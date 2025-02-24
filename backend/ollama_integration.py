import re
import subprocess
import requests
import os
import json

OLLAMA_MODEL = "llama3.2:3b"  # Replace with your model of choice
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model
OLLAMA_API_URL = "http://localhost:11434/api/generate"

FORMAT = """
Extract the following fields from the given invoice text. Always return a valid JSON object with the exact same keys, even if some values are missing.

Expected valid JSON output format:
{
  "invoice_number": "string",
  "date": "YYYY-MM-DD",
  "total": "float",
  "currency": "string", # example: EUR, USD, ...
  "supplier_name": "string",
  "supplier_address": "string",
  "supplier_country_id": "string",  # example: State code e.g DE (optional)
  "supplier_country_subdivision": "string",  # example: Bayern (optional)
  "supplier_vat_id": "string",  # example: Umsatzsteuer-ID, Value Added Tax ID
  "customer_name": "string",
  "customer_address": "string",
  "customer_country_id": "string",  # example: State code e.g DE (optional)
  "customer_country_subdivision": "string",  # example: Bayern (optional)
  "company": "string",
  "fee": "float",
  "payment_info": {
    "": "string",
    "bank_nameaccount_number": "string",
    "bank_details": "string",
  },
  "items": [
    {
      "description": "string",
      "quantity": "int",
      "hours": "float",
      "fee": "float",
      "total_price": "float",
      "vat_category": "string",  # example: Umsatzsteuerkategorie (VAT Category)
      "unit_code": "string",  # example: Einheit (Unit)
      "unit_price": "float",  # example: Preis pro Einheit (Unit price)
    }
  ],
  "comments": "string",  # example: Remarks or notes for the invoice (e.g. 'Test Node 1')
  "tax_details": {
    "tax_category": "string",  # example: Umsatzsteuerkategorie
    "tax_rate": "float",  # example: Umsatzsteuersatz
    "tax_amount": "float"  # example: Umsatzsteuerbetrag
  },
  "invoice_summary": {
    "position_sum": "float",  # example: Summe aller Positionen
    "discount_sum": "float",  # example: Summe Nachlässe
    "surcharge_sum": "float",  # example: Summe Zuschläge
    "total_sum": "float",  # example: Gesamtsumme
    "tax_sum": "float",  # example: Summe Umsatzsteuer
    "foreign_claims_sum": "float",  # example: Summe Fremdforderungen
    "due_amount": "float",  # example: Fälliger Betrag
    "exemption_vatex_category": "string",  # example: VATEX category (e.g. VATEX-EU-AE)
    "exemption_reason": "string"  # example: Befreiungsgrund
  }
}

If any value is missing in the input, return null for that field instead of omitting it.

Here is the invoice text return only only valid json output as a string no code or no comments from you:

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
