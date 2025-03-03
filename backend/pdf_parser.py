import os
import re
import logging
from backend.ollama_integration import process_with_ollama
from pdfplumber import open as open_pdf
from datetime import datetime, timezone
from decimal import Decimal
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
    doc.header.type_code = invoice_data["header"].get("type_code", "")
    doc.header.name = invoice_data["header"].get("name", "")
    doc.header.issue_date_time = datetime.strptime(invoice_data["header"].get("issue_date_time", "2025-01-01"), "%Y-%m-%d").date()
    doc.header.languages.add(invoice_data["header"].get("languages", ""))
    
    # Notes
    for note_data in invoice_data["header"].get("notes", []):
        note = IncludedNote()
        note.content.add(note_data.get("content", ""))
        doc.header.notes.add(note)
    
    # Trade Agreement
    doc.trade.agreement.seller.name = invoice_data["trade"]["agreement"]["seller"].get("name", "")
    doc.trade.agreement.seller.address.country_id = invoice_data["trade"]["agreement"]["seller"]["address"].get("country_code", "")
    doc.trade.agreement.seller.address.country_subdivision = invoice_data["trade"]["agreement"]["seller"]["address"].get("region", "")
    
    tax_id = invoice_data["trade"]["agreement"]["seller"].get("tax_id", "")
    if tax_id:
        doc.trade.agreement.seller.tax_registrations.add(TaxRegistration(id=("VA", tax_id)))
    
    doc.trade.agreement.buyer.name = invoice_data["trade"]["agreement"]["buyer"].get("name", "")
    
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
        trade_tax.calculated_amount = Decimal(tax.get("amount", 0))
        trade_tax.basis_amount = Decimal(invoice_data["trade"]["settlement"]["monetary_summation"].get("total", 0))
        trade_tax.type_code = "VAT"
        trade_tax.category_code = tax.get("category", "")
        trade_tax.exemption_reason_code = "VATEX-EU-AE"
        trade_tax.rate_applicable_percent = Decimal(tax.get("rate", 0))
        doc.trade.settlement.trade_tax.add(trade_tax)
    
    # Monetary Summation
    summation = invoice_data["trade"]["settlement"]["monetary_summation"]
    doc.trade.settlement.monetary_summation.line_total = Decimal(summation.get("total", 0))
    doc.trade.settlement.monetary_summation.charge_total = Decimal("0.00")
    doc.trade.settlement.monetary_summation.allowance_total = Decimal("0.00")
    doc.trade.settlement.monetary_summation.tax_basis_total = Decimal(summation.get("total", 0))
    doc.trade.settlement.monetary_summation.tax_total = (Decimal(summation.get("tax_total", 0)), "EUR")
    doc.trade.settlement.monetary_summation.grand_total = Decimal(summation.get("total", 0))
    doc.trade.settlement.monetary_summation.due_amount = Decimal(summation.get("total", 0))
    
    # Line Items
    for item in invoice_data["trade"].get("items", []):
        li = LineItem()
        li.document.line_id = item.get("line_id", "")
        li.product.name = item.get("product_name", "")
        li.agreement.gross.amount = Decimal(item.get("agreement_net_price", 0))
        li.agreement.gross.basis_quantity = (Decimal("1.0000"), "C62")
        li.agreement.net.amount = Decimal(item.get("agreement_net_price", 0))
        li.agreement.net.basis_quantity = (Decimal(item.get("agreement_net_price", 0)), "EUR")
        li.delivery.billed_quantity = (Decimal(item.get("quantity", 0)), "C62")
        li.settlement.trade_tax.type_code = "VAT"
        li.settlement.trade_tax.category_code = item["settlement_tax"].get("category", "")
        li.settlement.trade_tax.rate_applicable_percent = Decimal(item["settlement_tax"].get("rate", 0))
        li.settlement.monetary_summation.total_amount = Decimal(item.get("total_amount", 0))
        doc.trade.items.add(li)

    xml = doc.serialize(schema="FACTUR-X_EXTENDED")
    return xml.decode("utf-8")
# fmt: on


def preprocess_invoice_text(text):
    # Remove extra whitespace and newlines
    text = re.sub(r"\s+", " ", text)

    # Remove duplicated headers or footers (like "E-Rechnung | Lieferant GmbH Seite X / X")
    text = re.sub(r"E-Rechnung \| Lieferant GmbH Seite \d+ / \d+", "", text)

    # Remove unnecessary notes
    text = re.sub(r"\* Wichtig:.*?!", "", text)

    # Normalize number formatting (ensure consistent decimal separator)
    text = text.replace(",", ".")

    # Remove multiple spaces introduced by previous cleaning steps
    text = re.sub(r"\s{2,}", " ", text)

    # Strip leading and trailing whitespace
    text = text.strip()

    return text


def process_pdf(pdf_file_path: str) -> str:
    logging.info(f"Starting processing {pdf_file_path} ...")
    # Extract text from the PDF using pdfplumber
    with open_pdf(pdf_file_path) as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    # Send extracted text to Ollama model for field recognition
    invoice_data = process_with_ollama(preprocess_invoice_text(pdf_text))

    # Generate the XRechnung XML
    xml_content = generate_invoice_xml(invoice_data)
    return xml_content
