import pytest
from decimal import Decimal
from datetime import datetime, timezone
from pdf_parser import process, extract_text_from_pdf

models = [
    "deepseek",
    "gemini",
    # "chatgpt", # FIXME: There seems to be an issue right now
]


@pytest.mark.parametrize("model", models)
def test_json_creation_output(model):

    processed_text = extract_text_from_pdf("tests/samples/zugferd1_invoice_pdfa3b.pdf")
    result = process(processed_text, model=model, test=True)

    assert result.get("header").get("id") == "2019-03"
    assert result.get("header").get("issue_date_time") == "2019-05-08"
    assert result.get("header").get("languages") == "de"

    seller = result.get("trade").get("agreement").get("seller")
    assert seller.get("name") == "Kraxi GmbH"
    assert seller.get("contact_name") == "Paul Kraxi"

    seller_address = seller.get("address")
    assert seller_address.get("street_name") == "Flugzeugallee 17"
    assert seller_address.get("city_name") == "Papierfeld"
    assert seller_address.get("postal_zone") == "12345"

    buyer = result.get("trade").get("agreement").get("buyer")
    assert buyer.get("id") == "987-654"
    assert buyer.get("name") == "Papierflieger-Vertriebs-GmbH"
    assert buyer.get("contact_name") == "Helga Musterfrau"
    assert buyer.get("sales_order_number") == "ABC-123"

    buyer_address = buyer.get("address")
    assert buyer_address.get("street_name") == "Rabattstr. 25"
    assert buyer_address.get("city_name") == "Osterhausen"
    assert buyer_address.get("postal_zone") == "34567"

    settlement = result.get("trade").get("settlement")
    assert settlement.get("payment_means").get("iban") == "DE28700100809999999999"

    assert settlement.get("monetary_summation").get("net_total") == 845
    assert settlement.get("monetary_summation").get("tax_total") == 160.55
    assert settlement.get("monetary_summation").get("grand_total") == 1005.55
    assert settlement.get("monetary_summation").get("due_amount") == 1005.55

    items = result.get("trade").get("items")
    assert len(items) == 7

    net_total = 0
    grand_total = 0
    for item in items:
        net_total += item.get("agreement_net_price") * item.get("quantity")
        grand_total += item.get("total_amount")

    assert grand_total == settlement.get("monetary_summation").get("grand_total")
    assert net_total == settlement.get("monetary_summation").get("net_total")
