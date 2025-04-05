# PDF to XRechnung

This web application allows you to upload PDF invoices and converts them to **XRechnung** XML format. The backend uses **FastAPI** for the API, integrates with **Ollama's GPT-based models** to extract invoice fields, and generates the XML output. The frontend is built with **React** for a dynamic user experience.

## Features

- Upload a PDF invoice.
- Extracts fields such as **Invoice Number**, **Date**, **Total Amount**, and **Tax** using Ollama's AI model.
- Returns a downloadable **XRechnung XML** file.

## Local Ollama Setup

To use the Ollama model locally:

1. Install Ollama by following the instructions on the [Ollama website](https://ollama.com).
2. Run the following command to start the Ollama service:
   ```bash
   ollama start
    ```

## Technologies

- **Frontend**: React, CSS
- **Backend**: FastAPI, Python, PDFPlumber (for PDF text extraction), Ollama API (for field extraction)
- **Docker**: Containerized backend service
- **Ollama**: Custom-trained model to extract fields from invoices

## Backend Setup

uvicorn app.main:app --reload

## Frontend Setup

cd frontend
npm install
npm start

## Setup Instructions

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/vkresch/pdftoxrechnung.git
   cd pdftoxrechnung

## Docker

```
docker-compose up -d --build
```

# Certbot

1. Make Sure Your Domain Points to the Server

    Check with:

    ping pdftoxrechnung.de

    → It should return your server’s public IP.

2. Start NGINX Temporarily in Challenge Mode

Let’s spin up NGINX with a config that only handles the HTTP challenge first.
✏️ nginx/nginx.conf (temporary certbot version):

server {
    listen 80;
    server_name pdftoxrechnung.de;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 404;
    }
}

    This serves only the .well-known path on port 80. It’s essential for Certbot to validate domain ownership.

3. Start NGINX with Docker Compose

Make sure your folder structure looks like this:

.
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── certbot/
│   └── www/

Then run:

docker-compose up -d nginx

This starts only the nginx container, which listens on port 80 and serves the challenge files.

4. Run Certbot to Issue SSL

Now run the Certbot command:

```
docker run --rm -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
           -v "$(pwd)/certbot/www:/var/www/certbot" \
           certbot/certbot certonly \
           --webroot --webroot-path=/var/www/certbot \
           --email viktor.kreschenski@kretronik.com \
           --agree-tos \
           --no-eff-email \
           -d pdftoxrechnung.de

```
