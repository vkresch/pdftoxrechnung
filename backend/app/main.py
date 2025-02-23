from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from pdf_parser import process_pdf
import os

app = FastAPI()

# Define upload folder
UPLOAD_FOLDER = "./uploads"

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Process the PDF and generate XML
    xml_response = process_pdf(file_path)

    # Save and return the generated XML file
    output_file_path = os.path.join(UPLOAD_FOLDER, f"{file.filename}.xml")
    with open(output_file_path, "w") as f:
        f.write(xml_response)

    return FileResponse(output_file_path, media_type="application/xml")
