curl -X POST "https://pdftoxrechnung.de/api/upload/" \
-H "X-Session-ID: rapidapi" \
-H "origin: https://pdftoxrechnung.de" \
-H "X-RapidAPI-Proxy-Secret: ${RAPID_API_SECRET_KEY}" \
-F "file=@./backend/tests/samples/zugferd1_invoice_pdfa3b.pdf" \
-o result.json
