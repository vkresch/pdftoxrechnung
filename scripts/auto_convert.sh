curl -X POST "https://pdftoxrechnung.de/api/autoconvert" \
-H "X-RapidAPI-Proxy-Secret: ${RAPID_API_SECRET_KEY}" \
-F "file=@./backend/tests/samples/zugferd1_invoice_pdfa3b.pdf" 