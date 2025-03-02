import os
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


def generate_invoice_xml(invoice_data):
    doc = Document()

    # Set context
    doc.context.guideline_parameter.id = invoice_data["context"]["guideline_parameter"]

    # Set header information
    header = invoice_data["header"]
    doc.header.id = header.get("id")
    doc.header.type_code = header.get("type_code")
    doc.header.name = header.get("name", "Rechnung")
    doc.header.issue_date_time = header.get("issue_date_time")
    doc.header.languages.add(header.get("languages", "de"))

    # Add notes to the document header
    for note_data in header.get("notes", []):
        note = IncludedNote()
        # If `note.content` is a container with an `add` method
        for content in note_data.get("content", []):
            note.content.add(content)
        doc.header.notes.add(note)

    # Set trade agreement (Seller and Buyer)
    trade = invoice_data.get("trade")
    doc.trade.agreement.seller.name = trade["agreement"]["seller"]["name"]
    doc.trade.settlement.payee.name = trade["settlement"]["payee"]["name"]
    doc.trade.agreement.buyer.name = trade["agreement"]["buyer"]["name"]
    doc.trade.settlement.invoicee.name = trade["settlement"]["invoicee"]["name"]
    doc.trade.settlement.currency_code = trade["settlement"]["currency_code"]
    doc.trade.settlement.payment_means.type_code = trade["settlement"]["payment_means"][
        "type_code"
    ]

    # Seller Address and Tax Registration
    seller = trade["agreement"]["seller"]
    doc.trade.agreement.seller.address.country_id = seller["address"]["country_code"]
    doc.trade.agreement.seller.address.country_subdivision = seller["address"][
        "country_subdivision"
    ]
    doc.trade.agreement.seller.tax_registrations.add(
        TaxRegistration(id=seller["tax_registrations"])
    )

    # Seller Order Reference
    doc.trade.agreement.seller_order.issue_date_time = (
        trade["agreement"].get("seller_order", {}).get("issue_date_time")
    )

    # Buyer Order Reference
    doc.trade.agreement.buyer_order.issue_date_time = (
        trade["agreement"].get("buyer_order", {}).get("issue_date_time")
    )

    # Ultimate Customer Order Reference
    doc.trade.agreement.customer_order.issue_date_time = (
        trade["agreement"].get("customer_order", {}).get("issue_date_time")
    )

    # Add line items to the document
    for item_data in trade["items"]:
        li = LineItem()
        li.document.line_id = item_data["document"]["line_id"]
        li.product.name = item_data["product"]["name"]
        li.agreement.gross.amount = item_data["agreement"]["gross"]["amount"]
        li.agreement.gross.basis_quantity = item_data["agreement"]["gross"][
            "basis_quantity"
        ]
        li.agreement.net.amount = item_data["agreement"]["net"]["amount"]
        li.agreement.net.basis_quantity = item_data["agreement"]["net"][
            "basis_quantity"
        ]
        li.delivery.billed_quantity = item_data["delivery"]["billed_quantity"]
        li.settlement.trade_tax.type_code = item_data["settlement"]["trade_tax"][
            "type_code"
        ]
        li.settlement.trade_tax.category_code = item_data["settlement"]["trade_tax"][
            "category_code"
        ]
        li.settlement.trade_tax.rate_applicable_percent = item_data["settlement"][
            "trade_tax"
        ]["rate_applicable_percent"]
        li.settlement.monetary_summation.total_amount = item_data["settlement"][
            "monetary_summation"
        ]["total_amount"]
        doc.trade.items.add(li)

    # Add settlement trade tax
    for tax_data in trade["settlement"]["trade_tax"]:
        trade_tax = ApplicableTradeTax()
        trade_tax.calculated_amount = tax_data["calculated_amount"]
        trade_tax.basis_amount = tax_data["basis_amount"]
        trade_tax.type_code = tax_data["type_code"]
        trade_tax.category_code = tax_data["category_code"]
        trade_tax.exemption_reason_code = tax_data["exemption_reason_code"]
        trade_tax.rate_applicable_percent = tax_data["rate_applicable_percent"]
        doc.trade.settlement.trade_tax.add(trade_tax)

    # Set monetary summation
    summation = trade["settlement"]["monetary_summation"]
    doc.trade.settlement.monetary_summation.line_total = summation["line_total"]
    doc.trade.settlement.monetary_summation.charge_total = summation["charge_total"]
    doc.trade.settlement.monetary_summation.allowance_total = summation[
        "allowance_total"
    ]
    doc.trade.settlement.monetary_summation.tax_basis_total = summation[
        "tax_basis_total"
    ]
    doc.trade.settlement.monetary_summation.tax_total = summation["tax_total"]
    doc.trade.settlement.monetary_summation.grand_total = summation["grand_total"]
    doc.trade.settlement.monetary_summation.due_amount = summation["due_amount"]

    # Generate XML file
    xml = doc.serialize(schema="FACTUR-X_EXTENDED")
    return xml.decode("utf-8")


def process_pdf(pdf_file_path: str) -> str:
    logging.info(f"Starting processing {pdf_file_path} ...")
    # Extract text from the PDF using pdfplumber
    with open_pdf(pdf_file_path) as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    # Send extracted text to Ollama model for field recognition
    invoice_data = process_with_ollama(pdf_text)

    # Generate the XRechnung XML
    xml_content = generate_invoice_xml(invoice_data)
    return xml_content
