import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from pdf_parser import process_pdf
import os

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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
