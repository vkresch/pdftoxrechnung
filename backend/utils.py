import re
from schemas import Invoice


# Function to recursively remove keys with None values
def remove_nulls(obj):
    if isinstance(obj, dict):
        return {k: remove_nulls(v) for k, v in obj.items() if v is not None}
    elif isinstance(obj, list):
        return [remove_nulls(item) for item in obj]
    else:
        return obj


def format_dates(obj):
    if isinstance(obj, dict):
        return {k: format_dates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [format_dates(item) for item in obj]
    elif isinstance(obj, str):
        # Match ISO 8601 UTC date format: "2019-05-08T00:00:00Z"
        match = re.fullmatch(r"(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}Z", obj)
        if match:
            return match.group(1)
        return obj
    else:
        return obj


def fix_settlement_tax(data):
    trade = data.get("trade", {})
    for item in trade.get("items", []):
        delivery = item.get("delivery_details", 0)
        tax_info = item.get("settlement_tax", {})
        rate = tax_info.get("rate", 0)

        # Calculate amount as rate percent of delivery_details
        tax_amount = round((delivery * rate) / 100, 2)
        tax_info["amount"] = tax_amount

        # Calculate total amount
        item["total_amount"] = round(delivery + tax_amount, 2)

    return data


def replace_value_in_dict(data, target_key, target_value, replacement_value):
    def recursive_replace(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == target_key and value == target_value:
                    obj[key] = replacement_value
                else:
                    recursive_replace(value)
        elif isinstance(obj, list):
            for item in obj:
                recursive_replace(item)

    recursive_replace(data)
    return data


EXAMPLE_JSON = """
```
{
  "header": {
    "id": "2019-03",
    "type_code": "380",
    "name": "E-Rechnung",
    "leitweg_id": "LEITWEGID-12345ABCXYZ-00",
    "issue_date_time": "2019-05-08",
    "languages": "de",
    "notes": [
      "Zahlbar innerhalb von 30 Tagen netto auf unser Konto. Bitte geben Sie dabei die Rechnungsnummer an. Skontoabzüge werden nicht akzeptiert."
    ]
  },
  "trade": {
    "agreement": {
      "seller": {
        "name": "Kraxi GmbH",
        "contact_name": "Paul Kraxi",
        "address": {
          "country": "Germany",
          "country_code": "DE",
          "street_name": "Flugzeugallee 17",
          "city_name": "Papierfeld",
          "postal_zone": "12345",
          "street_name2": "Gebäude 4A"
        },
        "tax_id": "321/312/54321",
        "order_id": "SELLER-2019-0789",
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
        "id": "987-654",
        "name": "Papierflieger-Vertriebs-GmbH",
        "contact_name": "Helga Musterfrau",
        "sales_order_number": "ABC-123",
        "contract_document_reference": "COSNTR-XXX", 
        "legal_form": "GmbH",
        "address": {
          "country": "Germany",
          "country_code": "DE",
          "street_name": "Rabattstr. 25",
          "city_name": "Osterhausen",
          "postal_zone": "34567",
          "street_name2": "Eingang B"
        },
        "trade_name": "Papierflieger-Vertrieb",
        "id_type": "customerId",
        "order_id": "BUYER-2019-0789",
        "tax_id": "123/123/12345",
        "vat_id": "DE987654321",
        "reference": "LW-ID-123456789",
        "electronic_address": "einkauf@papierflieger.de",
        "electronic_address_type_code": "EM",
        "contact_email": "h.musterfrau@papierflieger.de",
        "contact_phone": "+49 987 6543210"
      },
      "contract_reference": "V-REFERENCE-0456",
      "project_reference": "P-REFERENCE-0123",
      "object_reference": "O-REFERENCE-0456",
      "document_reference": "D-REFERENCE-0456",
      "previous_billing_reference": "B-REFERENCE-0456",
      "previous_billing_date": "2018-05-08"
    },
    "settlement": {
      "payee": {
        "name": "Kraxi GmbH"
      },
      "invoicee": {
        "name": "Papierflieger-Vertriebs-GmbH"
      },
      "currency_code": "EUR",
      "payment_means": {
        "type_code": "58",
        "account_name": "Kraxi GmbH",
        "iban": "DE28700100809999999999",
        "bic": "PBNKDEFF",
        "bank_name": "Deutsche Postbank AG"
      },
      "advance_payment_date": "2019-05-08",
      "trade_tax": [
        {
          "category": "S",
          "rate": 19,
          "amount": 160.55
        }
      ],
      "monetary_summation": {
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
        "line_id": "1",
        "product_name": "Superdrachen",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 20,
        "quantity": 2,
        "delivery_details": 40,
        "settlement_tax": {
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
        "line_id": "2",
        "product_name": "Turbo Flyer",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 40,
        "quantity": 5,
        "delivery_details": 200,
        "settlement_tax": {
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
        "line_id": "3",
        "product_name": "Sturzflug-Geier",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 180,
        "quantity": 1,
        "delivery_details": 180,
        "settlement_tax": {
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
        "line_id": "4",
        "product_name": "Eisvogel",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 50,
        "quantity": 3,
        "delivery_details": 150,
        "settlement_tax": {
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
        "line_id": "5",
        "product_name": "Storch",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 20,
        "quantity": 10,
        "delivery_details": 200,
        "settlement_tax": {
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
        "line_id": "7",
        "product_name": "Kostenlose Zugabe",
        "period_start": "2019-05-08",
        "period_end": "2019-05-08",
        "agreement_net_price": 0,
        "quantity": 1,
        "delivery_details": 0,
        "settlement_tax": {
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
    "start_date": "2019-05-01",
    "end_date": "2019-05-31",
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
}

```
"""

PROMPT = f"""
You are a highly skilled document processing AI.

Your task is to extract structured invoice data from raw text extracted from a PDF. Return the data as a single **valid JSON object** using the **exact key names and structure** defined in the following schema:

```json
{Invoice.model_json_schema()}
```

Instructions:
  - Extract all relevant information from the input text.
  - Preserve all numerical values exactly as they appear (do not reformat).
  - Do not include any explanations, comments, or additional text.
  - Your entire output should be a valid JSON object only.
  - Ensure every key from the schema is included (use null if data is missing).
  - Follow the schema strictly to avoid invalid output.
  - Do not output the json model schema again
  - All the dates should be in the format "yyyy-mm-dd".
  - Important do not use id values from the example provided as default.
  - The final output should be a valid json object.

Here is an example of the expected output format:

{EXAMPLE_JSON}

Now extract the data from the attached invoice pdf file.
For extraction support the following plain text was extracted from the attached pdf:
"""
