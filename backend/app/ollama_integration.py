import subprocess
import os

OLLAMA_MODEL = "llama3.2:3b"  # Replace with your model of choice
OLLAMA_CMD = "ollama run"  # Command to invoke the local Ollama model

def process_with_ollama(pdf_text: str) -> dict:
    # Prepare the command to send to Ollama
    command = [
        OLLAMA_CMD, OLLAMA_MODEL, '--text', 
        f"Extract the following fields from this invoice text: Invoice Number, Invoice Date, Total Amount, Tax, Customer.\n\nText:\n{pdf_text}"
    ]
    
    try:
        # Run the Ollama model locally using subprocess
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        
        # Assuming the output is in a JSON-like format, you would parse it
        # Ollama output example: {'invoice_number': '12345', 'invoice_date': '2025-02-23', ...}
        fields = parse_ollama_output(result.stdout)
        return fields
    
    except subprocess.CalledProcessError as e:
        raise Exception(f"Error running Ollama model: {e.stderr}")

def parse_ollama_output(output: str) -> dict:
    # This function is just an example. Customize this to parse Ollama's output properly.
    # In this case, assume the output is JSON, but it might need adjustment based on Ollama's exact response.
    
    # Example (if Ollama output is JSON):
    try:
        fields = json.loads(output)  # Adjust this based on actual output format
        return {
            "invoice_number": fields.get('invoice_number', ''),
            "invoice_date": fields.get('invoice_date', ''),
            "total_amount": fields.get('total_amount', ''),
            "tax": fields.get('tax', ''),
            "customer": fields.get('customer', '')
        }
    except Exception as e:
        raise ValueError(f"Failed to parse Ollama output: {str(e)}")
