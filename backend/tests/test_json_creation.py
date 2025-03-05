import pytest
from pdfplumber import open as open_pdf
from decimal import Decimal
from datetime import datetime, timezone
from backend.ollama_integration import process_with_ollama


def test_json_creation_output():
    # Extract text from the PDF using pdfplumber
    with open_pdf("backend/tests/samples/output.pdf") as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    assert process_with_ollama(pdf_text) == {
        "context": {
            "type": "Invoice",
            "guideline_parameter": "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extant",
        },
        "header": {
            "id": "RE1337",
            "type_code": "380",
            "name": "Kunde GmbH",
            "issue_date_time": "2025-02-24",
            "languages": "de",
            "notes": [
                {
                    "content_code": "Test Node 1",
                    "content": "Bemerkung: Test Node 1",
                    "subject_code": "REM",
                }
            ],
            "type": "InvoiceHeader",
        },
        "trade": {
            "agreement": {
                "seller": {
                    "name": "Lieferant GmbH",
                    "address": {"country_code": "DE", "state_code": "Bayern"},
                    "tax_id": "DE000000000",
                },
                "buyer": {
                    "name": "Kunde GmbH",
                    "address": {"country_code": "DE", "state_code": "Bayern"},
                    "tax_id": "",
                },
                "orders": [],
            },
            "settlement": {
                "payee": {"name": "Lieferant GmbH"},
                "invoicee": {"name": "Kunde GmbH"},
                "currency_code": "EUR",
                "payment_means": {"type_code": "ZZZ"},
                "advance_payment_date": "2025-02-24",
                "trade_tax": [{"category": "AE", "rate": 0, "amount": 0}],
                "monetary_summation": {
                    "total": 999,
                    "tax_total": 0,
                    "type": "MonetarySummation",
                },
            },
            "items": [
                {
                    "line_id": "1",
                    "product_name": "Rainbow",
                    "agreement_net_price": 999,
                    "quantity": 1,
                    "delivery_details": 999,
                    "settlement_tax": {"category": "E", "rate": 0, "amount": 0},
                    "total_amount": 999,
                    "type": "Item",
                }
            ],
        },
    }
