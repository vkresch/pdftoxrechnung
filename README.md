# PDF to XRechnung

This web application allows you to upload PDF invoices and converts them to **XRechnung** XML format. The backend uses **FastAPI** for the API, integrates with **Ollama's GPT-based models** to extract invoice fields, and generates the XML output. The frontend is built with **React** for a dynamic user experience.

## Features

- Upload a PDF invoice.
- Extracts fields such as **Invoice Number**, **Date**, **Total Amount**, and **Tax** using Ollama's AI model.
- Returns a downloadable **XRechnung XML** file.

## Local Ollama Setup

To use the Ollama model locally:

1. Install Ollama by following the instructions on the [Ollama website](https://ollama.com).
2. Run the following command to start the Ollama service:
   ```bash
   ollama start
    ```

## Technologies

- **Frontend**: React, CSS
- **Backend**: FastAPI, Python, PDFPlumber (for PDF text extraction), Ollama API (for field extraction)
- **Docker**: Containerized backend service
- **Ollama**: Custom-trained model to extract fields from invoices

## Setup Instructions

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/vkresch/pdftoxrechnung.git
   cd pdftoxrechnung
