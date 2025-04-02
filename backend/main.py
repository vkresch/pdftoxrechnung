import os
import uvicorn
import subprocess
import uuid
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List
from pathlib import Path
from pdf_parser import extract_invoice_data, generate_invoice_xml
from validate import validate
from xrechnung_generator import generate_xrechnung

app = FastAPI()

origins = ["http://localhost:3000", "http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define upload folder
UPLOAD_FOLDER = Path("./uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

# Dictionary to store filenames for reuse
file_registry = {}


def generate_unique_filename(prefix: str, extension: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:6]  # Short unique identifier
    return f"{prefix}_{timestamp}_{unique_id}.{extension}"


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    """Accepts a PDF invoice, extracts text, and returns a structured JSON invoice."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    unique_filename = generate_unique_filename("invoice", "pdf")
    file_path = UPLOAD_FOLDER / unique_filename
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    invoice_data = extract_invoice_data(str(file_path))

    # Explicitly add CORS headers
    response = JSONResponse(content=invoice_data)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@app.post("/convert/zugferd")
async def convert_to_zugferd(invoice_data: dict):
    """Receives JSON invoice data and converts it to XML."""
    try:
        xml_content = generate_invoice_xml(invoice_data)
        unique_filename = generate_unique_filename("invoice_zugferd", "xml")
        output_file_path = UPLOAD_FOLDER / unique_filename
        with open(output_file_path, "w") as f:
            f.write(xml_content)
        return FileResponse(
            output_file_path,
            media_type="application/xml",
            filename=unique_filename,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/convert/")
async def convert_to_xrechnung(invoice_data: dict):
    """Receives JSON invoice data and converts it to XML."""
    xml_content = generate_xrechnung(invoice_data)
    unique_filename = generate_unique_filename("invoice_xrechnung", "xml")
    output_file_path = UPLOAD_FOLDER / unique_filename
    with open(output_file_path, "w") as f:
        f.write(xml_content)

    file_registry["xrechnung"] = unique_filename

    # Manually set CORS headers for file response
    response = FileResponse(
        output_file_path,
        media_type="application/xml",
        filename=unique_filename,
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@app.get("/validation-report-content/")
async def validation_report():
    filename = file_registry.get("xrechnung", "invoice_xrechnung.xml").replace(
        ".xml", "-report.xml"
    )
    output_file_path = UPLOAD_FOLDER / filename
    return FileResponse(
        output_file_path,
        media_type="application/xml",
        filename=filename,
    )


@app.get("/validation-report/")
async def download_report():
    filename = file_registry.get("xrechnung", "invoice_xrechnung.xml").replace(
        ".xml", "-report.html"
    )
    output_file_path = UPLOAD_FOLDER / filename
    return FileResponse(
        output_file_path,
        media_type="application/html",
        filename=filename,
    )


@app.post("/validate/")
async def validate_xml():
    xml_filename = file_registry.get("xrechnung", "invoice_xrechnung.xml")
    xml_file = UPLOAD_FOLDER / xml_filename
    return validate(xml_file, UPLOAD_FOLDER)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
