from backend.schemas import Invoice

EXAMPLE_JSON = """
```
{
  "context": {
    "@type": "Context",
    "guideline_parameter": "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended"
  },
  "header": {
    "@id": "RE1337",
    "@type": "Header",
    "id": "RE1337",
    "type_code": "eInvoice",
    "name": "E-Rechnung",
    "issue_date_time": "2025-02-24",
    "languages": "de",
    "leitweg_id": "04011000-12345ABCXYZ-86",
    "notes": ["Zahlbar innerhalb von 30 Tagen netto auf unser Konto."]
  },
  "trade": {
    "@type": "Trade",
    "agreement": {
      "@type": "Agreement",
      "seller": {
        "@type": "Seller",
        "name": "Lieferant GmbH",
        "address": {
          "@type": "Address",
          "country": "Deutschland",
          "state": "Bayern",
          "street_name": "Admiralbogen 45",
          "city_name": "München",
          "postal_zone": 80934
        },
        "iban": "DE28700100809999999999",
        "tax_id": "DE000000000",
        "phone": "(0123) 4567",
        "email": "info@kraxi.com",
        "homepage": "www.kraxi.com",
        "handels_register_name": "Handelsregister München",
        "handels_register_number": "HRB 999999"
      },
      "buyer": {
        "@type": "Buyer",
        "name": "Kunde GmbH",
        "address": {
          "@type": "Address",
          "country": "Deutschland",
          "state": "Sachsen",
          "street_name": "Berliner 123",
          "city_name": "KundenStadt",
          "postal_zone": 23451
        }
      },
      "orders": [
        {
          "@type": "Order",
          "date": "2025-02-24"
        }
      ]
    },
    "settlement": {
      "@type": "Settlement",
      "payee": {
        "@type": "Payee",
        "name": "Lieferant GmbH"
      },
      "invoicee": {
        "@type": "Invoicee",
        "name": "Kunde GmbH"
      },
      "currency_code": "EUR",
      "payment_means": {
        "@type": "PaymentMeans",
        "type_code": "ZZZ"
      },
      "advance_payment_date": "2025-02-25",
      "trade_tax": [
        {
          "@type": "TradeTax",
          "category": "AE",
          "rate": 0.00,
          "amount": 0
        }
      ],
      "monetary_summation": {
        "@type": "MonetarySummation",
        "total": 999,
        "tax_total": 0
      }
    },
    "items": [
      {
        "@type": "Item",
        "line_id": "1",
        "product_name": "Rainbow",
        "period_start": "2025-01-01",
        "period_end": "2025-02-01",
        "agreement_net_price": 999.00,
        "quantity": 1,
        "delivery_details": 999.00,
        "settlement_tax": {
          "@type": "Tax",
          "category": "E",
          "rate": 0,
          "amount": 0
        },
        "total_amount": 999.00
      }
    ]
  }
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
