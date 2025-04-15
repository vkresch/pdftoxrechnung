import pytest
from decimal import Decimal
from datetime import datetime, timezone
from pdf_parser import process, extract_text_from_pdf

models = [
    # "deepseek",
    "gemini",
    # "chatgpt", # FIXME: There seems to be an issue right now
]


@pytest.mark.parametrize("model", models)
def test_json_creation_output(model):

    pdf_file = "tests/samples/zugferd1_invoice_pdfa3b.pdf"
    processed_text = extract_text_from_pdf(pdf_file, language="de")
    result = process(processed_text, model=model, test=True, pdf_file=pdf_file)

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
    assert "ABC-123" in [seller.get("order_id"), buyer.get("order_id")]
    assert buyer.get("id") == "987-654"
    assert buyer.get("name") == "Papierflieger-Vertriebs-GmbH"
    assert buyer.get("contact_name") == "Helga Musterfrau"

    buyer_address = buyer.get("address")
    assert buyer_address.get("street_name") == "Rabattstr. 25"
    assert buyer_address.get("city_name") == "Osterhausen"
    assert buyer_address.get("postal_zone") == "34567"

    settlement = result.get("trade").get("settlement")
    assert settlement.get("payment_means").get("iban") == "DE28700100809999999999"

    assert settlement.get("monetary_summation").get("net_total") == 845
    assert settlement.get("monetary_summation").get("tax_total") == 160.55
    assert settlement.get("monetary_summation").get("grand_total") == 1005.55

    items = result.get("trade").get("items")
    assert len(items) == 7

    net_total = 0
    grand_total = 0
    for item in items:
        net_total += item.get("agreement_net_price") * item.get("quantity")
        grand_total += item.get("total_amount")

    assert grand_total == settlement.get("monetary_summation").get("grand_total")
    assert net_total == settlement.get("monetary_summation").get("net_total")


@pytest.mark.parametrize("model", models)
def test_json_creation_scanned_output(model):

    pdf_file = "tests/samples/example-invoice-scanned.pdf"
    processed_text = extract_text_from_pdf(pdf_file, language="en")
    result = process(processed_text, model=model, test=True, pdf_file=pdf_file)

    assert result.get("header").get("id") in ["INV/S/24/2024", "INVIS/24/2024"]
    assert result.get("header").get("issue_date_time") in ["2024-09-17", "17/09/2024"]

    seller = result.get("trade").get("agreement").get("seller")
    assert seller.get("name") == "Acme Invoice Ltd"

    seller_address = seller.get("address")
    assert seller_address.get("street_name") == "Darrow Street 2"
    assert seller_address.get("city_name") in ["Portsoken", "London"]
    assert seller_address.get("postal_zone") in ["E1 7AW", "E1 ZAW"]

    buyer = result.get("trade").get("agreement").get("buyer")
    # assert buyer.get("contact_name") == "John Doe"

    buyer_address = buyer.get("address")
    assert buyer_address.get("street_name") == "2048 Michigan Str"
    assert "Chicago" in buyer_address.get("city_name")
    assert buyer_address.get("postal_zone") == "60601"

    settlement = result.get("trade").get("settlement")

    assert (
        pytest.approx(settlement.get("monetary_summation").get("net_total"), 0.1)
        == 754.0
    )
    # assert (
    #     pytest.approx(settlement.get("monetary_summation").get("tax_total"), 0.1) == 0.0
    # )
    assert (
        pytest.approx(settlement.get("monetary_summation").get("grand_total"), 0.1)
        == 701.22
    )

    items = result.get("trade").get("items")
    assert len(items) == 2

    net_total = 0
    grand_total = 0
    for item in items:
        net_total += item.get("agreement_net_price") * item.get("quantity")
        grand_total += item.get("total_amount")

    discount = 0.07
    assert pytest.approx((grand_total * (1 - discount)), 0.1) == settlement.get(
        "monetary_summation"
    ).get("grand_total")
    assert net_total == settlement.get("monetary_summation").get("net_total")
