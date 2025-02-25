import re
import subprocess
import requests
import os
import json

OLLAMA_MODEL = "llama3.2:3b"  # Replace with your model of choice
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model
OLLAMA_API_URL = "http://localhost:11434/api/generate"

FORMAT = """
You are an expert in document processing.
Given the extracted text from an invoice PDF, extract and return only the invoice_data dictionary in JSON format, with the following structure:
{
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

Extract all relevant values from the text.
Ensure all numerical values remain in their original format.
Do not include any explanations or additional text, **only** return the dictionary as valid JSON.

Extracted PDF text:

"""


def query_ollama(model: str, prompt: str):
    payload = {
        "model": model,
        "prompt": prompt,
        "seed": 42,
        "temperature": 0,  # Make the output deterministic
        "stream": False,  # Set to True for streamed responses
    }
    response = requests.post(OLLAMA_API_URL, json=payload)
    return response.json()


def process_with_ollama(pdf_text: str) -> dict:
    # Prepare the command to send to Ollama
    try:
        # Assuming the output is in a JSON-like format, you would parse it
        # Ollama output example: {'invoice_number': '12345', 'invoice_date': '2025-02-23', ...}
        response = query_ollama(OLLAMA_MODEL, f"{FORMAT} {pdf_text}")
        json_match = re.search(r"({.*})", response.get("response"), re.DOTALL)
        json_str = json_match.group(1)
        return json.loads(json_str)

    except subprocess.CalledProcessError as e:
        raise Exception(f"Error running Ollama model: {e.stderr}")
