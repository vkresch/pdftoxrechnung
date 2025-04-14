curl --request POST \
	--url https://pdftoxrechnung.p.rapidapi.com/autoconvert \
	--header "Content-Type: multipart/form-data" \
	--header "x-rapidapi-host: pdftoxrechnung.p.rapidapi.com" \
	--header "x-rapidapi-key: ${RAPID_API_KEY}" \
	--form file=@./backend/tests/samples/zugferd1_invoice_pdfa3b.pdf