import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
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
UPLOAD_FOLDER = Path("./uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    """Accepts a PDF invoice, extracts text, and returns a structured JSON invoice."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = UPLOAD_FOLDER / file.filename
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        invoice_data = extract_invoice_data(str(file_path))
        return JSONResponse(content=invoice_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        if file_path.exists():
            file_path.unlink()  # Delete the temporary file


@app.post("/convert/zugferd")
async def convert_to_zugferd(invoice_data: dict):
    """Receives JSON invoice data and converts it to XML."""
    try:
        xml_content = generate_invoice_xml(invoice_data)
        output_file_path = UPLOAD_FOLDER / "invoice_zugferd.xml"
        with open(output_file_path, "w") as f:
            f.write(xml_content)
        return FileResponse(
            output_file_path,
            media_type="application/xml",
            filename="invoice_zugferd.xml",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/convert/")
async def convert_to_xrechnung(invoice_data: dict):
    """Receives JSON invoice data and converts it to XML."""
    try:
        xml_content = generate_xrechnung(invoice_data)
        output_file_path = UPLOAD_FOLDER / "invoice_xrechnung.xml"
        with open(output_file_path, "w") as f:
            f.write(xml_content)
        return FileResponse(
            output_file_path,
            media_type="application/xml",
            filename="invoice_xrechnung.xml",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
