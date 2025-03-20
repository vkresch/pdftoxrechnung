import pytest
from pdfplumber import open as open_pdf
from decimal import Decimal
from datetime import datetime, timezone
from backend.pdf_parser import process


def test_json_creation_output_deepseek():
    # Extract text from the PDF using pdfplumber
    with open_pdf("backend/tests/samples/output.pdf") as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    assert process(pdf_text, model="deepseek", test=True) == {
        "context": {
            "type": "Context",
            "guideline_parameter": "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended",
        },
        "header": {
            "id": "RE1337",
            "type": "Header",
            "type_code": "380",
            "name": "E-Rechnung",
            "issue_date_time": "2025-02-24",
            "languages": "de",
            "notes": [
                "Test Node 1",
                "Wichtig: Dieses Dokument ist eine automatisch generierte Zusammenfassung der E-Rechnung, es ersetzt nicht die Originaldatei!",
            ],
        },
        "trade": {
            "type": "Trade",
            "agreement": {
                "type": "Agreement",
                "seller": {
                    "type": "Seller",
                    "name": "Lieferant GmbH",
                    "address": {
                        "type": "Address",
                        "country": "Germany",
                        "country_code": "DE",
                        "state": "Bayern",
                    },
                    "tax_id": "DE000000000",
                },
                "buyer": {
                    "type": "Buyer",
                    "name": "Kunde GmbH",
                    "address": {"type": "Address", "country": "Germany"},
                },
                "orders": [{"type": "Order", "date": "2025-02-24"}],
            },
            "settlement": {
                "type": "Settlement",
                "payee": {"type": "Payee", "name": "Lieferant GmbH"},
                "invoicee": {"type": "Invoicee", "name": "Kunde GmbH"},
                "currency_code": "EUR",
                "payment_means": {"type": "PaymentMeans", "type_code": "ZZZ"},
                "advance_payment_date": "2025-02-24",
                "trade_tax": [
                    {"type": "TradeTax", "category": "AE", "rate": 0, "amount": 0}
                ],
                "monetary_summation": {
                    "type": "MonetarySummation",
                    "net_total": 999,
                    "tax_total": 0,
                    "grand_total": 999,
                    "paid_amount": 0,
                    "rounding_amount": 0,
                    "due_amount": 999,
                },
            },
            "items": [
                {
                    "type": "Item",
                    "line_id": "1",
                    "product_name": "Rainbow",
                    "agreement_net_price": 999,
                    "quantity": 1,
                    "delivery_details": 999,
                    "settlement_tax": {
                        "type": "Tax",
                        "category": "E",
                        "rate": 0,
                        "amount": 0,
                    },
                    "total_amount": 999,
                    "quantity_unit": "C62",
                }
            ],
        },
    }
