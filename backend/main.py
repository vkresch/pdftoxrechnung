import os
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List
from pathlib import Path
from pdf_parser import extract_invoice_data, generate_invoice_xml
from backend.xrechnung_generator import generate_xrechnung

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define upload folder
UPLOAD_FOLDER = "./uploads"


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    """Accepts a PDF invoice, extracts text, and returns a structured JSON invoice."""

    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    invoice_data = extract_invoice_data(file_path)

    return JSONResponse(content=invoice_data)


@app.post("/convert/zugferd")
async def convert_to_zugferd(invoice_data: dict):
    """Receives JSON invoice data and converts it to XML."""
    xml_content = generate_invoice_xml(invoice_data)

    output_file_path = Path(UPLOAD_FOLDER) / "invoice.xml"
    with open(output_file_path, "w") as f:
        f.write(xml_content)

    return FileResponse(output_file_path, media_type="application/xml")


@app.post("/convert/")
async def convert_to_xrechnung(invoice_data: dict):
    """Receives JSON invoice data and converts it to XML."""
    xml_content = generate_xrechnung(invoice_data)
    output_file_path = Path(UPLOAD_FOLDER) / "invoice.xml"
    with open(output_file_path, "w") as f:
        f.write(xml_content)

    return FileResponse(output_file_path, media_type="application/xml")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
