from backend.schemas import Invoice

EXAMPLE_JSON = """
```
{
  "context": {
    "type": "Context",
    "guideline_parameter": "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended"
  },
  "header": {
    "id": "2019-03",
    "type": "Header",
    "type_code": "380",
    "name": "E-Rechnung",
    "leitweg_id": "04011000-12345ABCXYZ-86",
    "issue_date_time": "2019-05-08",
    "languages": "de",
    "notes": [
      "Zahlbar innerhalb von 30 Tagen netto auf unser Konto. Bitte geben Sie dabei die Rechnungsnummer an. Skontoabzüge werden nicht akzeptiert."
    ]
  },
  "trade": {
    "type": "Trade",
    "agreement": {
      "type": "Agreement",
      "seller": {
        "type": "Seller",
        "name": "Kraxi GmbH",
        "contact_name": "Paul Kraxi",
        "address": {
          "type": "Address",
          "country": "Germany",
          "country_code": "DE",
          "street_name": "Flugzeugallee 17",
          "city_name": "Papierfeld",
          "postal_zone": "12345",
          "street_name2": "Gebäude 4A"
        },
        "tax_id": "DE123456789",
        "iban": "DE28700100809999999999",
        "phone": "(0123) 4567",
        "fax": "(0123) 4568",
        "email": "info@kraxi.com",
        "homepage": "www.kraxi.com",
        "legal_form": "GmbH",
        "handels_register_name": "Handelsregister München",
        "handels_register_number": "HRB 999999",
        "trade_name": "Kraxi Papierflugzeuge",
        "id": "S-12345",
        "trade_id": "HRB 999999",
        "vat_id": "DE123456789",
        "legal_info": "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE123456789",
        "electronic_address": "info@kraxi.com",
        "electronic_address_type_code": "EM",
        "contact_email": "info@kraxi.com",
        "contact_phone": "+49 123 4567890"
      },
      "buyer": {
        "type": "Buyer",
        "id": "987-654",
        "name": "Papierflieger-Vertriebs-GmbH",
        "contact_name": "Helga Musterfrau",
        "order_id": "123453322",
        "sales_order_number": "ABC-123",
        "contract_document_reference": "COSNTR-XXX", 
        "legal_form": "GmbH",
        "address": {
          "type": "Address",
          "country": "Germany",
          "country_code": "DE",
          "street_name": "Rabattstr. 25",
          "city_name": "Osterhausen",
          "postal_zone": "34567",
          "street_name2": "Eingang B"
        },
        "trade_name": "Papierflieger-Vertrieb",
        "id_type": "customerId",
        "vat_id": "DE987654321",
        "reference": "LW-ID-123456789",
        "electronic_address": "einkauf@papierflieger.de",
        "electronic_address_type_code": "EM",
        "contact_email": "h.musterfrau@papierflieger.de",
        "contact_phone": "+49 987 6543210"
      },
      "orders": [
        {
          "type": "Order",
          "date": "2019-05-08"
        }
      ],
      "contract_reference": "V-2019-0456",
      "project_reference": "P-2019-0123",
      "purchase_order_reference": "PO-2019-0789",
    },
    "settlement": {
      "type": "Settlement",
      "payee": {
        "type": "Payee",
        "name": "Kraxi GmbH"
      },
      "invoicee": {
        "type": "Invoicee",
        "name": "Papierflieger-Vertriebs-GmbH"
      },
      "currency_code": "EUR",
      "payment_means": {
        "type": "PaymentMeans",
        "type_code": "58",
        "account_name": "Kraxi GmbH",
        "iban": "DE28700100809999999999",
        "bic": "PBNKDEFF",
        "bank_name": "Deutsche Postbank AG"
      },
      "advance_payment_date": "2019-05-08",
      "trade_tax": [
        {
          "type": "TradeTax",
          "category": "S",
          "rate": 19,
          "amount": 160.55
        }
      ],
      "monetary_summation": {
        "type": "MonetarySummation",
        "net_total": 845,
        "tax_total": 160.55,
        "grand_total": 1005.55,
        "paid_amount": 0,
        "rounding_amount": 0,
        "due_amount": 1005.55
      },
      "payment_reference": "RE2019-03",
      "payment_terms": "Zahlbar innerhalb von 30 Tagen netto auf unser Konto. Bitte geben Sie dabei die Rechnungsnummer an. Skontoabzüge werden nicht akzeptiert."
    },
    "items": [
      {
        "type": "Item",
        "line_id": "1",
        "product_name": "Superdrachen",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 20,
        "quantity": 2,
        "delivery_details": 40,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 7.6
        },
        "total_amount": 47.6,
        "id": "SKU-1000",
        "order_position": "1",
        "description": "Detaillierte Beschreibung für Superdrachen. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      },
      {
        "type": "Item",
        "line_id": "2",
        "product_name": "Turbo Flyer",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 40,
        "quantity": 5,
        "delivery_details": 200,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 38
        },
        "total_amount": 238,
        "id": "SKU-1001",
        "order_position": "2",
        "description": "Detaillierte Beschreibung für Turbo Flyer. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      },
      {
        "type": "Item",
        "line_id": "3",
        "product_name": "Sturzflug-Geier",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 180,
        "quantity": 1,
        "delivery_details": 180,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 34.2
        },
        "total_amount": 214.2,
        "id": "SKU-1002",
        "order_position": "3",
        "description": "Detaillierte Beschreibung für Sturzflug-Geier. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      },
      {
        "type": "Item",
        "line_id": "4",
        "product_name": "Eisvogel",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 50,
        "quantity": 3,
        "delivery_details": 150,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 28.5
        },
        "total_amount": 178.5,
        "id": "SKU-1003",
        "order_position": "4",
        "description": "Detaillierte Beschreibung für Eisvogel. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      },
      {
        "type": "Item",
        "line_id": "5",
        "product_name": "Storch",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 20,
        "quantity": 10,
        "delivery_details": 200,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 38
        },
        "total_amount": 238,
        "id": "SKU-1004",
        "order_position": "5",
        "description": "Detaillierte Beschreibung für Storch. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      },
      {
        "type": "Item",
        "line_id": "6",
        "product_name": "Adler",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 75,
        "quantity": 1,
        "delivery_details": 75,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 14.25
        },
        "total_amount": 89.25,
        "id": "SKU-1005",
        "order_position": "6",
        "description": "Detaillierte Beschreibung für Adler. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      },
      {
        "type": "Item",
        "line_id": "7",
        "product_name": "Kostenlose Zugabe",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 0,
        "quantity": 1,
        "delivery_details": 0,
        "settlement_tax": {
          "type": "Tax",
          "category": "S",
          "rate": 19,
          "amount": 0
        },
        "total_amount": 0,
        "id": "SKU-1006",
        "order_position": "7",
        "description": "Detaillierte Beschreibung für Kostenlose Zugabe. Hochwertige Qualität, langlebiges Material.",
        "quantity_unit": "H87"
      }
    ],
    "billing_period": {
      "start_date": "2019-05-01",
      "end_date": "2019-05-31"
    },
    "delivery": {
      "date": "2019-05-07",
      "delivery_note_id": "LN-2019-05-07-001",
      "delivery_party": {
        "name": "Papierflieger-Vertriebs-GmbH",
        "address": {
          "street_name": "Rabattstr. 25",
          "city_name": "Osterhausen",
          "postal_zone": "34567",
          "country_code": "DE"
        }
      }
    }
  },
  "document_references": [
    "Ausschreibung 2019-04-XYZ",
    "Los 3: Papierflugzeuge"
  ],
  "intro_text": "Vielen Dank für Ihren Auftrag. Wir stellen Ihnen hiermit folgende Positionen in Rechnung:",
  "output_format": "zugferd:xrechnung",
  "output_lang_code": "de"
}

```
"""

PROMPT = f"""
You are an expert in document processing.
Given the extracted text from an invoice PDF, 
extract and return only the invoice data in 
JSON object format with the following schema with exactly the provided key names:

```
{Invoice.model_json_schema()}
```

Extract all relevant values from the text.
Ensure all numerical values remain in their original format.
Do not include any explanations or additional text, only
return the the valid JSON object with the exact key names.

Example output:

{EXAMPLE_JSON}

Input text:

"""
