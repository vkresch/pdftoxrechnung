import subprocess
import requests
import os
import json

OLLAMA_MODEL = "llama3.2:3b"  # Replace with your model of choice
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model
OLLAMA_API_URL = "http://localhost:11434/api/generate"

FORMAT = """
Extract the following fields from the given invoice text. Always return a JSON object with the exact same keys, even if some values are missing.

Expected JSON output format:
{
  "invoice_number": "string",
  "date": "YYYY-MM-DD",
  "total": "float",
  "currency": "string",
  "supplier_name": "string",
  "supplier_address": "string",
  "customer_name": "string",
  "customer_address": "string",
  "company": "string",
  "fee": "float",
  payment_info: {
    account_number: "string",
    bank_name: "string",
    bank_details: "string",
  },
  "items": [
    {
      "description": "string",
      "quantity": "int",
      "hours": "float",
      "fee": "float",
      "total_price": "float"
    }
  ]
}

If any value is missing in the input, return null for that field instead of omitting it.

Here is the invoice text only return the json output:

"""


def query_ollama(model: str, prompt: str):
    payload = {
        "model": model,
        "prompt": prompt,
        "seed": 42,
        "temperature": 0, # Make the output deterministic
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
        return json.loads(response.get("response"))

    except subprocess.CalledProcessError as e:
        raise Exception(f"Error running Ollama model: {e.stderr}")
