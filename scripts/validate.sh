curl -X POST "https://pdftoxrechnung.de/api/validate/" \
-H "X-Session-ID: rapidapi" \
-H "origin: https://pdftoxrechnung.de" \
-H "X-RapidAPI-Proxy-Secret: ${RAPID_API_SECRET_KEY}" \
-F "file=@./result.xml" \
-o validation.xml
