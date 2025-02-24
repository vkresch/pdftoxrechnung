import pytest
from pdfplumber import open as open_pdf
from backend.ollama_integration import process_with_ollama


def test_json_creation_ollama():
    # Extract text from the PDF using pdfplumber
    with open_pdf("backend/tests/samples/output.pdf") as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    assert process_with_ollama(pdf_text) == {
        "invoice_number": "RE1337",
        "date": "2025-02-24",
        "total": 999.00,
        "currency": "EUR",
        "supplier_name": "Lieferant GmbH",
        "supplier_address": None,
        "supplier_country_id": "DE",
        "supplier_country_subdivision": "Bayern",
        "supplier_vat_id": "DE000000000",
        "customer_name": "Kunde GmbH",
        "customer_address": None,
        "customer_country_id": None,
        "customer_country_subdivision": None,
        "company": None,
        "fee": None,
        "payment_info": {
            "account_number": None,
            "bank_name": None,
            "bank_details": None,
        },
        "items": [
            {
                "description": "Rainbow",
                "quantity": 1,
                "hours": None,
                "fee": None,
                "total_price": 999.00,
                "vat_category": "E",
                "unit_code": "C62",
                "unit_price": 999.00,
            }
        ],
        "comments": "Test Node 1",
        "tax_details": {"tax_category": "AE", "tax_rate": 0.00, "tax_amount": 0.00},
        "invoice_summary": {
            "position_sum": 999.00,
            "discount_sum": 0.00,
            "surcharge_sum": 0.00,
            "total_sum": 999.00,
            "tax_sum": 0.00,
            "foreign_claims_sum": 0.00,
            "due_amount": 999.00,
            "exemption_vatex_category": "VATEX-EU-AE",
            "exemption_reason": None,
        },
    }
