import os
from ollama_integration import process_with_ollama
from pdfplumber import open as open_pdf


def process_pdf(pdf_file_path: str) -> str:
    # Extract text from the PDF using pdfplumber
    with open_pdf(pdf_file_path) as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    # Send extracted text to Ollama model for field recognition
    fields = process_with_ollama(pdf_text)

    # Generate the XRechnung XML
    xml_content = generate_xrechnung_xml(fields)
    return xml_content


def generate_xrechnung_xml(fields: dict) -> str:
    # Example XML structure for XRechnung (simplified)
    xml = f"""
    <Invoice>
        <InvoiceNumber>{ fields.get('invoice_number', '')}</InvoiceNumber>
        <IssueDate>{ fields.get('date', '')}</IssueDate>
        <TotalAmount>{ fields.get('total', '')}</TotalAmount>
        <Fee>{ fields.get('fee', '')}</Fee>
        <Customer>{ fields.get('customer_name', '')}</Customer>
        <Company>{ fields.get('company', '')}</Company>
        <Items>{ fields.get('items', '')}</Items>
    </Invoice>
    """
    return xml
