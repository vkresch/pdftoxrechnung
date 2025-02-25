import pytest
from datetime import datetime, timezone
from decimal import Decimal
from backend.pdf_parser import generate_invoice_xml
from pdfplumber import open as open_pdf


def test_xml_creation_output():

    pdf_json = {
        "context": {
            "guideline_parameter": {
                "id": "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended"
            }
        },
        "header": {
            "id": "RE1337",
            "type_code": "380",
            "name": "RECHNUNG",
            "issue_date_time": datetime.today().date(),
            "languages": "de",
            "notes": [{"content": ["Test Node 1"]}],
        },
        "trade": {
            "agreement": {
                "seller": {
                    "name": "Lieferant GmbH",
                    "address": {"country_id": "DE", "country_subdivision": "Bayern"},
                    "tax_registrations": [{"id": ("VA", "DE000000000")}],
                    "order": {"issue_date_time": datetime.now(timezone.utc)},
                },
                "buyer": {
                    "name": "Kunde GmbH",
                    "order": {"issue_date_time": datetime.now(timezone.utc)},
                },
                "seller_order": {
                    "issue_date_time": datetime(2025, 2, 25)  # Example for Seller Order
                },
                "buyer_order": {
                    "issue_date_time": datetime(2025, 2, 25)  # Example for Buyer Order
                },
                "customer_order": {
                    "issue_date_time": datetime(
                        2025, 2, 25
                    )  # Example for Ultimate Customer Order
                },
            },
            "settlement": {
                "payee": {"name": "Lieferant GmbH"},
                "invoicee": {"name": "Kunde GmbH"},
                "currency_code": "EUR",
                "payment_means": {"type_code": "ZZZ"},
                "advance_payment": {"received_date": datetime.now(timezone.utc)},
                "trade_tax": [
                    {
                        "calculated_amount": Decimal("0.00"),
                        "basis_amount": Decimal("999.00"),
                        "type_code": "VAT",
                        "category_code": "AE",
                        "exemption_reason_code": "VATEX-EU-AE",
                        "rate_applicable_percent": Decimal("0.00"),
                    }
                ],
                "monetary_summation": {
                    "line_total": Decimal("999.00"),
                    "charge_total": Decimal("0.00"),
                    "allowance_total": Decimal("0.00"),
                    "tax_basis_total": Decimal("999.00"),
                    "tax_total": (Decimal("0.00"), "EUR"),
                    "grand_total": Decimal("999.00"),
                    "due_amount": Decimal("999.00"),
                },
            },
            "items": [
                {
                    "document": {"line_id": "1"},
                    "product": {"name": "Rainbow"},
                    "agreement": {
                        "gross": {
                            "amount": Decimal("999.00"),
                            "basis_quantity": (Decimal("1.0000"), "C62"),
                        },
                        "net": {
                            "amount": Decimal("999.00"),
                            "basis_quantity": (Decimal("999.00"), "EUR"),
                        },
                    },
                    "delivery": {"billed_quantity": (Decimal("1.0000"), "C62")},
                    "settlement": {
                        "trade_tax": {
                            "type_code": "VAT",
                            "category_code": "E",
                            "rate_applicable_percent": Decimal("0.00"),
                        },
                        "monetary_summation": {"total_amount": Decimal("999.00")},
                    },
                }
            ],
        },
    }

    with open("backend/tests/samples/output.xml") as xml:
        xml_string = xml.read()

    xml_content = generate_invoice_xml(pdf_json)
    assert xml_string == xml_content
