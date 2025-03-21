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
from backend.xrechnung_generator import generate_xrechnung

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
    return JSONResponse(content=invoice_data)


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

    # Store filename in registry
    file_registry["xrechnung"] = unique_filename
    return FileResponse(
        output_file_path,
        media_type="application/xml",
        filename=unique_filename,
    )


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
    jar_path = "backend/validator/validationtool-1.5.0-standalone.jar"
    scenarios_file = "backend/validator/scenarios.xml"
    output_directory = Path.cwd() / "backend/validator/"
    xml_filename = file_registry.get("xrechnung", "invoice_xrechnung.xml")
    xml_file = UPLOAD_FOLDER / xml_filename
    validation_report = UPLOAD_FOLDER / xml_filename.replace(".xml", "-report.xml")

    command = [
        "java",
        "-jar",
        jar_path,
        "-s",
        scenarios_file,
        "-r",
        str(output_directory),
        "--output-directory",
        str(UPLOAD_FOLDER),
        "-h",
        xml_file,
    ]

    try:
        result = subprocess.run(command, capture_output=True, text=True)
        return_code = result.returncode

        response = {"return_code": return_code, "message": "Validation completed"}

        if return_code == 0:
            response["description"] = (
                "XRechnung is valid according to KoSIT Validator 1.5.0."
            )
        elif return_code > 0:
            response["description"] = (
                "XRechnung file is invalid according to KoSIT Validator 1.5.0."
            )
        elif return_code == -1:
            response["description"] = "Parsing error: Incorrect command-line arguments."
        elif return_code == -2:
            response["description"] = (
                "Configuration error: Issues with loading configuration/validation targets."
            )
        else:
            response["description"] = "Unknown error."

        return response
    except Exception as e:
        return {"return_code": -99, "description": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
