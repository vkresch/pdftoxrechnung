import re
import subprocess
import requests
import os
import json
import logging
from backend.schemas import Invoice

# mistral, deepseek-r1:14b, deepseek-r1:8b, deepseek-r1:1.5b, llama3.2:3b
OLLAMA_MODEL = "deepseek-r1:8b"  # Replace with your model of choice (ollama list)
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model
OLLAMA_API_URL = "http://localhost:11434/api/generate"

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


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
        response = query_ollama(OLLAMA_MODEL, pdf_text)
        json_match = re.search(r"({.*})", response.get("response"), re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)

    except subprocess.CalledProcessError as e:
        raise Exception(f"Error running Ollama model: {e.stderr}")
