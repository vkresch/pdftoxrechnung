import os
import re
import json
import logging
import requests
from google import genai
from google.genai import types
from schemas import Invoice
from utils import (
    PROMPT,
    remove_nulls,
    format_dates,
    fix_settlement_tax,
    replace_value_in_dict,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)


logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def process_with_gemini(pdf_file, pdf_text):
    """Main function to automate chat using Gemini via HTTP"""
    logging.info("Starting gemini extraction process ...")
    invoice = client.files.upload(file=pdf_file)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[invoice, PROMPT, pdf_text],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Invoice.model_json_schema(),
            temperature=0,
        ),
    )
    json_str = response.text
    logging.info(f"JSON String:\n{json_str}")

    raw_invoice_data = json.loads(json_str)

    # Replace default values
    preprocessed_invoice_data = replace_value_in_dict(
        raw_invoice_data, "leitweg_id", "LEITWEGID-12345ABCXYZ-00", 0
    )
    preprocessed_invoice_data = replace_value_in_dict(
        preprocessed_invoice_data, "leitweg_id", "string", 0
    )
    preprocessed_invoice_data = replace_value_in_dict(
        preprocessed_invoice_data, "tax_id", "321/312/54321", None
    )
    preprocessed_invoice_data = replace_value_in_dict(
        preprocessed_invoice_data, "order_id", "SELLER-2019-0789", None
    )
    preprocessed_invoice_data = replace_value_in_dict(
        preprocessed_invoice_data, "order_id", "BUYER-2019-0789", None
    )

    # Remove null
    preprocessed_invoice_data = remove_nulls(preprocessed_invoice_data)

    # Format dates
    preprocessed_invoice_data = format_dates(preprocessed_invoice_data)

    # Calculate the settlement tax amount
    preprocessed_invoice_data = fix_settlement_tax(preprocessed_invoice_data)

    logging.info(f"Preprocessed invoice data:\n{preprocessed_invoice_data}")

    return preprocessed_invoice_data
