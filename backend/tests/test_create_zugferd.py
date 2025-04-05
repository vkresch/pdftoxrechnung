import os
from datetime import date, datetime, timezone
from decimal import Decimal

from drafthorse.models.accounting import ApplicableTradeTax
from drafthorse.models.document import Document
from drafthorse.models.note import IncludedNote
from drafthorse.models.party import TaxRegistration
from drafthorse.models.tradelines import LineItem
from drafthorse.pdf import attach_xml


def test_generate_sample():

    # Build data structure
    doc = Document()
    doc.context.guideline_parameter.id = (
        "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended"
    )
    doc.header.id = "RE1337"
    doc.header.type_code = "380"
    doc.header.name = "RECHNUNG"
    doc.header.issue_date_time = date.today()
    doc.header.languages.add("de")

    note = IncludedNote()
    note.content.add("Test Node 1")
    doc.header.notes.add(note)

    doc.trade.agreement.seller.name = "Lieferant GmbH"
    doc.trade.settlement.payee.name = "Lieferant GmbH"

    doc.trade.agreement.buyer.name = "Kunde GmbH"
    doc.trade.settlement.invoicee.name = "Kunde GmbH"

    doc.trade.settlement.currency_code = "EUR"
    doc.trade.settlement.payment_means.type_code = "ZZZ"

    doc.trade.agreement.seller.address.country_id = "DE"
    doc.trade.agreement.seller.address.country_subdivision = "Bayern"
    doc.trade.agreement.seller.tax_registrations.add(
        TaxRegistration(id=("VA", "DE000000000"))
    )

    doc.trade.agreement.seller_order.issue_date_time = datetime.now(timezone.utc)
    doc.trade.agreement.buyer_order.issue_date_time = datetime.now(timezone.utc)
    doc.trade.settlement.advance_payment.received_date = datetime.now(timezone.utc)
    doc.trade.agreement.customer_order.issue_date_time = datetime.now(timezone.utc)

    li = LineItem()
    li.document.line_id = "1"
    li.product.name = "Rainbow"
    li.agreement.gross.amount = Decimal("999.00")
    li.agreement.gross.basis_quantity = (Decimal("1.0000"), "C62")  # C62 == pieces
    li.agreement.net.amount = Decimal("999.00")
    li.agreement.net.basis_quantity = (Decimal("999.00"), "EUR")
    li.delivery.billed_quantity = (Decimal("1.0000"), "C62")  # C62 == pieces
    li.settlement.trade_tax.type_code = "VAT"
    li.settlement.trade_tax.category_code = "E"
    li.settlement.trade_tax.rate_applicable_percent = Decimal("0.00")
    li.settlement.monetary_summation.total_amount = Decimal("999.00")
    doc.trade.items.add(li)

    trade_tax = ApplicableTradeTax()
    trade_tax.calculated_amount = Decimal("0.00")
    trade_tax.basis_amount = Decimal("999.00")
    trade_tax.type_code = "VAT"
    trade_tax.category_code = "AE"
    trade_tax.exemption_reason_code = "VATEX-EU-AE"
    trade_tax.rate_applicable_percent = Decimal("0.00")
    doc.trade.settlement.trade_tax.add(trade_tax)

    doc.trade.settlement.monetary_summation.line_total = Decimal("999.00")
    doc.trade.settlement.monetary_summation.charge_total = Decimal("0.00")
    doc.trade.settlement.monetary_summation.allowance_total = Decimal("0.00")
    doc.trade.settlement.monetary_summation.tax_basis_total = Decimal("999.00")
    doc.trade.settlement.monetary_summation.tax_total = (Decimal("0.00"), "EUR")
    doc.trade.settlement.monetary_summation.grand_total = Decimal("999.00")
    doc.trade.settlement.monetary_summation.due_amount = Decimal("999.00")

    # Generate XML file
    xml = doc.serialize(schema="FACTUR-X_EXTENDED")

    output_path = "tests/samples/output_zugferd.xml"

    with open(output_path, "wb") as f:
        f.write(xml)

    assert os.path.isfile(output_path)
