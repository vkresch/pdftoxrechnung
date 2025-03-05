import re
import subprocess
import requests
import os
import json
import logging
from backend.schemas import Invoice

# mistral, deepseek-r1:14b, deepseek-r1:8b, deepseek-r1:1.5b, llama3.2:3b, llama3.1
OLLAMA_MODEL = "llama3.1"  # Replace with your model of choice (ollama list)
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model
OLLAMA_API_URL = "http://localhost:11434/api/generate"

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

EXAMPLE_JSON = """
```json
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
    "notes": ["Test Node 1"]
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
          "country": "Germany",
          "state": "Bayern"
        },
        "tax_id": "DE000000000"
      },
      "buyer": {
        "@type": "Buyer",
        "name": "Kunde GmbH"
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
JSON object format with the following schema with **exactly** the provided key names:

{Invoice.model_json_schema()}

Extract all relevant values from the text.
Ensure all numerical values remain in their original format.
Do not include any explanations or additional text, **only** 
return the the valid JSON object with the **exact** key names.

Example output:

{EXAMPLE_JSON}

Input text:

"""


def query_ollama(model: str, prompt: str):
    payload = {
        "model": model,
        "prompt": prompt,
        "seed": 42,
        "temperature": 0,  # Make the output deterministic
        "stream": False,  # Set to True for streamed responses
        "format": Invoice.model_json_schema(),
        "keep_alive": "5m",
    }
    response = requests.post(OLLAMA_API_URL, json=payload)
    return response.json()


def process_with_ollama(pdf_text: str) -> dict:
    # Prepare the command to send to Ollama
    try:
        # Assuming the output is in a JSON-like format, you would parse it
        # Ollama output example: {'invoice_number': '12345', 'invoice_date': '2025-02-23', ...}
        response = query_ollama(OLLAMA_MODEL, f"{PROMPT} {pdf_text}")
        json_match = re.search(r"({.*})", response.get("response"), re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)

    except subprocess.CalledProcessError as e:
        raise Exception(f"Error running Ollama model: {e.stderr}")
