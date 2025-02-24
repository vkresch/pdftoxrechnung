import pytest
from pdfplumber import open as open_pdf
from backend.ollama_integration import process_with_ollama


def test_json_creation_ollama():
    # Extract text from the PDF using pdfplumber
    with open_pdf("backend/tests/samples/output.pdf") as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    fields = process_with_ollama(pdf_text)
    assert fields == {
        "invoice_number": "RE1337",
        "date": "2025-02-24",
        "total": 999.0,
        "currency": "EUR",
        "supplier_name": "Lieferant GmbH",
        "supplier_address": "",
        "supplier_state": "Bayern",
        "supplier_vat_id": "DE000000000",
        "customer_name": "Kunde GmbH",
        "customer_address": "",
        "customer_state": None,
        "company": "Lieferant GmbH",
        "fee": 0.0,
        "payment_info": {
            "account_number": None,
            "bank_name": None,
            "bank_details": None,
        },
        "items": [
            {
                "description": "Rainbow",
                "quantity": 1000.0,
                "hours": 0.0,
                "fee": 0.0,
                "total_price": 999.0,
                "vat_category": "E",
                "unit_code": "C62",
                "unit_price": 999.0,
            }
        ],
        "comments": "Test Node 1",
        "tax_details": {"tax_category": "AE", "tax_rate": 0.0, "tax_amount": 0.0},
        "invoice_summary": {
            "position_sum": 999.0,
            "discount_sum": 0.0,
            "surcharge_sum": 0.0,
            "total_sum": 999.0,
            "tax_sum": 0.0,
            "foreign_claims_sum": 0.0,
            "due_amount": 999.0,
            "vatex_category": None,
            "exemption_reason": None,
        },
    }
