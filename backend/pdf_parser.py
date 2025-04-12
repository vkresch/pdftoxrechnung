import os
import re
import logging
import time
import numpy as np
from chatgpt_integration import process_with_chatgpt
from deepseek_integration import process_with_deepseek
from ollama_integration import process_with_ollama

from gemini_integration import process_with_gemini
from pdfplumber import open as open_pdf
from datetime import datetime, timezone
import easyocr
from pdf2image import convert_from_path
from drafthorse.models.accounting import ApplicableTradeTax
from drafthorse.models.document import Document
from drafthorse.models.note import IncludedNote
from drafthorse.models.party import TaxRegistration
from drafthorse.models.tradelines import LineItem
from drafthorse.pdf import attach_xml

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def process(pdf_text, model="chatgpt", test=False):

    if model == "ollama":
        return process_with_ollama(pdf_text)
    elif model == "deepseek":
        return process_with_deepseek(pdf_text, test)
    elif model == "chatgpt":
        return process_with_chatgpt(pdf_text, test)
    elif model == "gemini":
        return process_with_gemini(pdf_text)
    return process_with_chatgpt(pdf_text, test)


def parse_iso_datetime(value):
    """Convert an ISO 8601 string to a datetime object if it's a valid date format."""
    if isinstance(value, str) and len(value) >= 10:  # Quick check for string format
        if value[4] == "-" and value[7] == "-":  # Basic ISO 8601 validation
            return datetime.fromisoformat(value)  # Safe conversion
    return value  # Return original value if it's not a valid datetime string


# fmt: off
def generate_invoice_xml(invoice_data):
    doc = Document()
    
    # Context
    doc.context.guideline_parameter.id = invoice_data["context"].get("guideline_parameter", "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended")
    
    # Header
    doc.header.id = invoice_data["header"].get("id", "")
    doc.header.type_code = invoice_data["header"].get("type_code", "380")
    doc.header.name = invoice_data["header"].get("name", "")
    doc.header.issue_date_time = datetime.strptime(invoice_data["header"].get("issue_date_time", "2025-01-01"), "%Y-%m-%d").date()
    doc.header.languages.add(invoice_data["header"].get("languages", ""))
    
    # Notes
    for note_data in invoice_data["header"].get("notes", []):
        note = IncludedNote()
        note.content.add(note_data)
        doc.header.notes.add(note)
    
    # Trade Agreement
    doc.trade.agreement.seller.name = invoice_data["trade"]["agreement"]["seller"].get("name", "")
    doc.trade.agreement.seller.address.country_id = invoice_data["trade"]["agreement"]["seller"]["address"].get("country_code", "")
    doc.trade.agreement.seller.address.country_subdivision = invoice_data["trade"]["agreement"]["seller"]["address"].get("region", "")
    doc.trade.agreement.seller_order.issue_date_time = datetime.strptime(invoice_data["header"].get("issue_date_time", "2025-01-01"), "%Y-%m-%d").date()
    
    tax_id = invoice_data["trade"]["agreement"]["seller"].get("tax_id", "")
    if tax_id:
        doc.trade.agreement.seller.tax_registrations.add(TaxRegistration(id=("VA", tax_id)))
    
    doc.trade.agreement.buyer.name = invoice_data["trade"]["agreement"]["buyer"].get("name", "")
    doc.trade.agreement.buyer_order.issue_date_time = datetime.strptime(invoice_data["header"].get("issue_date_time", "2025-01-01"), "%Y-%m-%d").date()
    doc.trade.agreement.customer_order.issue_date_time = datetime.strptime(invoice_data["header"].get("issue_date_time", "2025-01-01"), "%Y-%m-%d").date()
    
    # Trade Settlement
    doc.trade.settlement.payee.name = invoice_data["trade"]["settlement"]["payee"].get("name", "")
    doc.trade.settlement.invoicee.name = invoice_data["trade"]["settlement"]["invoicee"].get("name", "")
    doc.trade.settlement.currency_code = invoice_data["trade"]["settlement"].get("currency_code", "")
    doc.trade.settlement.payment_means.type_code = invoice_data["trade"]["settlement"]["payment_means"].get("type_code", "ZZZ")
    
    # Dates
    advance_payment_date = invoice_data["trade"]["settlement"].get("advance_payment_date", "2025-01-01")
    doc.trade.settlement.advance_payment.received_date = datetime.strptime(advance_payment_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    
    # Trade Tax
    for tax in invoice_data["trade"]["settlement"].get("trade_tax", []):
        trade_tax = ApplicableTradeTax()
        trade_tax.calculated_amount = round(tax.get("amount", 0), 2)
        trade_tax.basis_amount = round(invoice_data["trade"]["settlement"]["monetary_summation"].get("total", 0), 2)
        trade_tax.type_code = "VAT"
        trade_tax.category_code = tax.get("category", "")
        trade_tax.exemption_reason_code = "VATEX-EU-AE"
        trade_tax.rate_applicable_percent = round(tax.get("rate", 0), 2)
        doc.trade.settlement.trade_tax.add(trade_tax)
    
    # Monetary Summation
    summation = invoice_data["trade"]["settlement"]["monetary_summation"]
    doc.trade.settlement.monetary_summation.line_total = round(summation.get("total", 0), 2)
    doc.trade.settlement.monetary_summation.charge_total = round(0.0, 2)
    doc.trade.settlement.monetary_summation.allowance_total = round(0.0, 2)
    doc.trade.settlement.monetary_summation.tax_basis_total = round(summation.get("total", 0), 2)
    doc.trade.settlement.monetary_summation.tax_total = (round(summation.get("tax_total", 0), 2), "EUR")
    doc.trade.settlement.monetary_summation.grand_total = round(summation.get("total", 0), 2)
    doc.trade.settlement.monetary_summation.due_amount = round(summation.get("total", 0), 2)
    
    # Line Items
    for item in invoice_data["trade"].get("items", []):
        li = LineItem()
        li.document.line_id = item.get("line_id", "")
        li.product.name = item.get("product_name", "")
        li.agreement.gross.amount = round(item.get("agreement_net_price", 0), 2)
        li.agreement.gross.basis_quantity = (round(item.get("quantity", 0)), "C62", 2)
        li.agreement.net.amount = round(item.get("agreement_net_price", 0), 2)
        li.agreement.net.basis_quantity = (round(item.get("agreement_net_price", 0)), "EUR", 2)
        li.delivery.billed_quantity = (round(item.get("quantity", 0)), "C62", 2)
        li.settlement.trade_tax.type_code = "VAT"
        li.settlement.trade_tax.category_code = item["settlement_tax"].get("category", "")
        li.settlement.trade_tax.rate_applicable_percent = round(item["settlement_tax"].get("rate", 0), 2)
        li.settlement.monetary_summation.total_amount = round(item.get("total_amount", 0), 2)
        doc.trade.items.add(li)

    xml = doc.serialize(schema="FACTUR-X_EXTENDED")
    return xml.decode("utf-8")
# fmt: on


def preprocess_invoice_text(text):
    # Step 1: Temporarily replace decimal commas (e.g., "1.005,55" → "1.005DOT55")
    text = re.sub(r"(\d),(\d{2})\b", r"\1DOT\2", text)

    # Step 2: Remove periods used as thousands separators (e.g., "1.005DOT55" → "1005DOT55")
    text = re.sub(r"(?<=\d)\.(?=\d{3}DOT)", "", text)

    # Step 3: Replace temporary marker with decimal point
    text = text.replace("DOT", ".")

    return text


def extract_text_from_pdf(pdf_file_path: str, language: str = "de") -> str:
    # Extract text from the PDF using pdfplumber
    with open_pdf(pdf_file_path) as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    if not pdf_text:
        # Convert PDF to images
        images = convert_from_path(pdf_file_path)

        # Initialize EasyOCR reader (English and numbers)
        reader = easyocr.Reader([language])

        # Extract text from each image
        extracted_text = []
        for img in images:
            results = reader.readtext(
                np.array(img), detail=1
            )  # Extract text (detail=0 returns only text)
            for bbox, text, confidence in results:
                if confidence > 0.5:
                    extracted_text.append(text)

        # Join extracted text into a single string
        pdf_text = "\n".join(extracted_text)

    return preprocess_invoice_text(pdf_text)


def extract_invoice_data(pdf_file_path: str) -> str:
    logging.info(f"Starting processing {pdf_file_path} ...")

    # Send extracted text to Ollama model for field recognition
    processed_text = extract_text_from_pdf(pdf_file_path)
    start_time = time.perf_counter()
    invoice_data = process(processed_text, model="gemini")
    logging.info(
        f"Execution time of data extraction: {time.perf_counter() - start_time:.6f} seconds"
    )
    return invoice_data
