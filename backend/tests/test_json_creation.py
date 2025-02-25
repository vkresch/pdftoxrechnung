import pytest
from pdfplumber import open as open_pdf
from backend.ollama_integration import process_with_ollama


def test_json_creation_output():
    # Extract text from the PDF using pdfplumber
    with open_pdf("backend/tests/samples/output.pdf") as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    assert process_with_ollama(pdf_text) == {
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


def test_json_creation_invoice_pdf17():
    # Extract text from the PDF using pdfplumber
    with open_pdf("backend/tests/samples/invoice_pdf17.pdf") as pdf:
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

    assert process_with_ollama(pdf_text) == {
        "invoice_number": "4698018857",
        "date": "2019-08-03",
        "total": 706.00,
        "currency": "USD",
        "supplier_name": None,
        "supplier_address": None,
        "supplier_country_id": None,
        "supplier_country_subdivision": None,
        "supplier_vat_id": None,
        "customer_name": "John Miller",
        "customer_address": "ACME Company Inc\n2 Maple St\nNew Milford",
        "customer_country_id": None,
        "customer_country_subdivision": None,
        "company": None,
        "fee": 66.00,
        "payment_info": {
            "": None,
            "bank_nameaccount_number": "1123 4567 2345 8765",
            "bank_details": "Add your bank details",
        },
        "items": [
            {
                "description": "DB Architecture",
                "quantity": None,
                "hours": 7.00,
                "fee": 12.00,
                "total_price": 182.00,
                "vat_category": None,
                "unit_code": None,
                "unit_price": 12.00,
            },
            {
                "description": "Analysis",
                "quantity": None,
                "hours": 9.00,
                "fee": 29.00,
                "total_price": 189.00,
                "vat_category": None,
                "unit_code": None,
                "unit_price": 29.00,
            },
            {
                "description": "Web scrapping",
                "quantity": None,
                "hours": 5.00,
                "fee": 15.00,
                "total_price": 175.00,
                "vat_category": None,
                "unit_code": None,
                "unit_price": 15.00,
            },
            {
                "description": "Web design",
                "quantity": None,
                "hours": 8.00,
                "fee": 10.00,
                "total_price": 160.00,
                "vat_category": None,
                "unit_code": None,
                "unit_price": 10.00,
            },
        ],
        "comments": None,
        "tax_details": {"tax_category": None, "tax_rate": None, "tax_amount": None},
        "invoice_summary": {
            "position_sum": 640.00,
            "discount_sum": None,
            "surcharge_sum": None,
            "total_sum": 706.00,
            "tax_sum": None,
            "foreign_claims_sum": None,
            "due_amount": 706.00,
            "exemption_vatex_category": None,
            "exemption_reason": None,
        },
    }
