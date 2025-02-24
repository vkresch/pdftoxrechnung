import os
from ollama_integration import process_with_ollama
from pdfplumber import open as open_pdf
from datetime import datetime, timezone
from decimal import Decimal
from drafthorse.models.accounting import ApplicableTradeTax
from drafthorse.models.document import Document
from drafthorse.models.note import IncludedNote
from drafthorse.models.party import TaxRegistration
from drafthorse.models.tradelines import LineItem
from drafthorse.pdf import attach_xml


def generate_invoice_xml_from_dict(invoice_dict):
    # Create the document object
    doc = Document()
    doc.context.guideline_parameter.id = (
        "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended"
    )

    # Header info
    doc.header.id = (
        invoice_dict.get("invoice_number")
        if invoice_dict.get("invoice_number") is not None
        else ""
    )
    doc.header.type_code = "380"
    doc.header.name = "RECHNUNG"
    doc.header.issue_date_time = (
        datetime.strptime(invoice_dict["date"], "%Y-%m-%d").date()
        if invoice_dict.get("date")
        else datetime.today().date()
    )
    doc.header.languages.add("de")

    # Notes
    if "comments" in invoice_dict and invoice_dict["comments"] is not None:
        note = IncludedNote()
        note.content.add(invoice_dict["comments"])
        doc.header.notes.add(note)

    # Trade Agreement
    if "supplier_name" in invoice_dict and invoice_dict["supplier_name"] is not None:
        doc.trade.agreement.seller.name = invoice_dict["supplier_name"]
        doc.trade.settlement.payee.name = invoice_dict["supplier_name"]

    if "customer_name" in invoice_dict and invoice_dict["customer_name"] is not None:
        doc.trade.agreement.buyer.name = invoice_dict["customer_name"]
        doc.trade.settlement.invoicee.name = invoice_dict["customer_name"]

    # Currency & Payment Means
    doc.trade.settlement.currency_code = invoice_dict.get("currency", "EUR")
    doc.trade.settlement.payment_means.type_code = "ZZZ"

    # Seller address and VAT registration
    if "supplier_state" in invoice_dict and invoice_dict["supplier_state"] is not None:
        doc.trade.agreement.seller.address.country_id = invoice_dict["supplier_state"]

    if (
        "supplier_vat_id" in invoice_dict
        and invoice_dict["supplier_vat_id"] is not None
    ):
        doc.trade.agreement.seller.tax_registrations.add(
            TaxRegistration(id=("VA", invoice_dict["supplier_vat_id"]))
        )

    tax_details = invoice_dict.get("tax_details")

    # Dates for seller, buyer and customer orders
    current_datetime = datetime.now(timezone.utc)
    doc.trade.agreement.seller_order.issue_date_time = current_datetime
    doc.trade.agreement.buyer_order.issue_date_time = current_datetime
    doc.trade.settlement.advance_payment.received_date = current_datetime
    doc.trade.agreement.customer_order.issue_date_time = current_datetime

    # Line Items
    if "items" in invoice_dict and isinstance(invoice_dict["items"], list):
        for i, item in enumerate(invoice_dict["items"], start=1):
            li = LineItem()
            li.document.line_id = str(i)

            if "description" in item and item["description"] is not None:
                li.product.name = item["description"]

            if "total_price" in item and item["total_price"] is not None:
                li.agreement.gross.amount = Decimal(str(item["total_price"]))

            if "quantity" in item and item["quantity"] is not None:
                li.agreement.gross.basis_quantity = (
                    Decimal(str(item["quantity"])),
                    "C62",
                )  # C62 == pieces

                li.delivery.billed_quantity = (
                    Decimal(str(item["quantity"])),
                    "C62",
                )  # C62 == pieces

            if "tax_rate" in tax_details and tax_details["tax_rate"] is not None:
                li.settlement.trade_tax.rate_applicable_percent = Decimal(
                    str(tax_details["tax_rate"])
                )
                li.agreement.net.amount = Decimal(
                    str(
                        float(item["total_price"])
                        - float(tax_details["tax_rate"]) * float(item["total_price"])
                    )
                )
                li.agreement.net.basis_quantity = (
                    Decimal(str(item["quantity"])),
                    "C62",
                )  # C62 == pieces
            else:
                li.agreement.net.amount = Decimal(str(item["total_price"]))
                li.agreement.net.basis_quantity = (
                    Decimal(str(item["quantity"])),
                    "C62",
                )  # C62 == pieces

            if "vat_category" in item and item["vat_category"] is not None:
                li.settlement.trade_tax.type_code = item["vat_category"]

            if "fee" in item and item["fee"] is not None:
                li.settlement.trade_tax.basis_amount = Decimal(
                    str(item["fee"])
                )  # Apply VAT
                li.settlement.trade_tax.category_code = item[
                    "vat_category"
                ]  # Apply VAT

            if "total_price" in item and item["total_price"] is not None:
                li.settlement.monetary_summation.total_amount = Decimal(
                    str(item["total_price"])
                )
            doc.trade.items.add(li)

    # Tax Details
    if "tax_details" in invoice_dict and invoice_dict["tax_details"] is not None:
        tax_details = invoice_dict["tax_details"]
        trade_tax = ApplicableTradeTax()
        trade_tax_add = False

        if "tax_amount" in tax_details and tax_details["tax_amount"] is not None:
            trade_tax.calculated_amount = Decimal(str(tax_details["tax_amount"]))
            trade_tax.basis_amount = Decimal(str(item["total_price"]))
            trade_tax_add = True

        if "tax_category" in tax_details and tax_details["tax_category"] is not None:
            trade_tax.type_code = tax_details["tax_category"]
            trade_tax_add = True

        if "tax_rate" in tax_details and tax_details["tax_rate"] is not None:
            # trade_tax.rate_applicable_percent = Decimal(str(tax_details["tax_rate"]))
            trade_tax.basis_amount = Decimal(str(tax_details["tax_rate"]))  # Apply VAT
            trade_tax.category_code = tax_details["tax_category"]
            trade_tax_add = True

        if (
            "exemption_reason" in tax_details
            and tax_details["exemption_reason"] is not None
        ):
            trade_tax.exemption_reason_code = tax_details["exemption_reason"]
            trade_tax_add = True

        if trade_tax_add:
            doc.trade.settlement.trade_tax.add(trade_tax)

    # Monetary Summation
    if (
        "invoice_summary" in invoice_dict
        and invoice_dict["invoice_summary"] is not None
    ):
        summary = invoice_dict["invoice_summary"]
        if "position_sum" in summary and summary["position_sum"] is not None:
            doc.trade.settlement.monetary_summation.line_total = Decimal(
                str(summary["position_sum"])
            )
        if "discount_sum" in summary and summary["discount_sum"] is not None:
            doc.trade.settlement.monetary_summation.charge_total = Decimal(
                str(summary["discount_sum"])
            )
        if "surcharge_sum" in summary and summary["surcharge_sum"] is not None:
            doc.trade.settlement.monetary_summation.allowance_total = Decimal(
                str(summary["surcharge_sum"])
            )
        if "tax_basis_sum" in summary and summary["tax_basis_sum"] is not None:
            doc.trade.settlement.monetary_summation.tax_basis_total = Decimal(
                str(summary["tax_basis_sum"])
            )
        if "tax_sum" in summary and summary["tax_sum"] is not None:
            doc.trade.settlement.monetary_summation.tax_total = (
                Decimal(str(summary["tax_sum"])),
                "EUR",
            )
            doc.trade.settlement.monetary_summation.grand_total = Decimal(
                str(summary["total_sum"])
            )
        # if "total_sum" in summary and summary["total_sum"] is not None:
        if "due_amount" in summary and summary["due_amount"] is not None:
            doc.trade.settlement.monetary_summation.due_amount = Decimal(
                str(summary["due_amount"])
            )

    # Generate the XML
    xml = doc.serialize(schema="FACTUR-X_EXTENDED")

    return xml


def process_pdf(pdf_file_path: str) -> str:
    # Extract text from the PDF using pdfplumber
    with open_pdf(pdf_file_path) as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    # Send extracted text to Ollama model for field recognition
    fields = process_with_ollama(pdf_text)

    # Generate the XRechnung XML
    xml_content = generate_invoice_xml_from_dict(fields)
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
