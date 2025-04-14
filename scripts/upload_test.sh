curl -X POST "https://pdftoxrechnung.de/api/upload/" \
-H "X-Session-ID: rapidapi" \
-H "origin: https://pdftoxrechnung.de" \
-H "X-RapidAPI-Proxy-Secret: mysecretapikey" \
-F "file=@./backend/tests/samples/zugferd1_invoice_pdfa3b.pdf" \
-o result.json
