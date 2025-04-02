import os
import re
import json
import logging
from google import genai
from schemas import Invoice
from utils import PROMPT

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def process_with_gemini(pdf_text):
    """Main function to automate chat while caching login"""
    logging.info(f"Starting gemini extraction process ...")
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"{PROMPT} {pdf_text}",
        config={
            "response_mime_type": "application/json",
            "response_schema": Invoice,
        },
    ).text
    json_match = re.search(r"({.*})", response, re.DOTALL)
    json_str = json_match.group(1)
    logging.info(f"JSON String:\n{json_str}")
    return json.loads(json_str)
