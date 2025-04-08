import os
import re
import json
import logging
import requests
from schemas import Invoice
from utils import PROMPT

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"


logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def process_with_gemini(pdf_text):
    """Main function to automate chat using Gemini via HTTP"""
    logging.info("Starting gemini extraction process ...")

    headers = {"Content-Type": "application/json"}

    payload = {"contents": [{"parts": [{"text": f"{PROMPT} {pdf_text}"}]}]}

    response = requests.post(URL, headers=headers, data=json.dumps(payload))

    if response.status_code != 200:
        logging.error(f"Request failed: {response.text}")
        raise Exception("Gemini API request failed")

    result = response.json()
    try:
        raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
        json_match = re.search(r"({.*})", raw_text, re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)
    except Exception as e:
        logging.error(f"Failed to extract JSON: {e}")
        raise
