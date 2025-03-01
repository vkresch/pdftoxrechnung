import re
import subprocess
import requests
import os
import json

# mistral, deepseek-r1:14b, deepseek-r1:8b, deepseek-r1:1.5b, llama3.2:3b
OLLAMA_MODEL = "deepseek-r1:8b"  # Replace with your model of choice (ollama list)
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model
OLLAMA_API_URL = "http://localhost:11434/api/generate"

FORMAT = """
You are an expert in document processing.
Given the extracted text from an invoice PDF, extract and return only the invoice data in english JSON object format with the following schema with **exactly** the provided key names:

```json
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
      "issue_date_time": "2025/2/25",
      "languages": "de",
      "notes": [{"content": ["Test Node 1"]}]
  },
  "trade": {
      "agreement": {
          "seller": {
              "name": "Lieferant GmbH",
              "address": {"country_id": "DE", "country_subdivision": "Bayern"},
              "tax_registrations": "DE000000000",
              "order": {"issue_date_time": "2025/2/25"}
          },
          "buyer": {
              "name": "Kunde GmbH",
              "order": {"issue_date_time": "2025/2/25"}
          },
          "seller_order": {
              "issue_date_time": "2025/2/25"
          },
          "buyer_order": {
              "issue_date_time": "2025/2/25"
          },
          "customer_order": {
              "issue_date_time": "2025/2/25"
          }
      },
      "settlement": {
          "payee": {"name": "Lieferant GmbH"},
          "invoicee": {"name": "Kunde GmbH"},
          "currency_code": "EUR",
          "payment_means": {"type_code": "ZZZ"},
          "advance_payment": {"received_date": "2025/2/25"},
          "trade_tax": [
              {
                  "calculated_amount": "0.00",
                  "basis_amount": "999.00",
                  "type_code": "VAT",
                  "category_code": "AE",
                  "exemption_reason_code": "VATEX-EU-AE",
                  "rate_applicable_percent": "0.00"
              }
          ],
          "monetary_summation": {
              "line_total": "999.00",
              "charge_total": "0.00",
              "allowance_total": "0.00",
              "tax_basis_total": "999.00",
              "tax_total": "0.00",
              "grand_total": "999.00",
              "due_amount": "999.00"
          }
      },
      "items": [
          {
              "document": {"line_id": "1"},
              "product": {"name": "Rainbow"},
              "agreement": {
                  "gross": {
                      "amount": "999.00",
                      "basis_quantity": "1.0000"
                  },
                  "net": {
                      "amount": "999.00",
                      "basis_quantity": "1.0000"
                  }
              },
              "delivery": {"billed_quantity": "1.0000"},
              "settlement": {
                  "trade_tax": {
                      "type_code": "VAT",
                      "category_code": "E",
                      "rate_applicable_percent": "0.00"
                  },
                  "monetary_summation": {"total_amount": "999.00"}
              }
          }
      ]
  }
}
```

Extract all relevant values from the text.
Ensure all numerical values remain in their original format.
Do not include any explanations or additional text, **only** return the the valid JSON object with the **exact** key names.

Input text:

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
        print(json_str)
        return json.loads(json_str)

    except subprocess.CalledProcessError as e:
        raise Exception(f"Error running Ollama model: {e.stderr}")
