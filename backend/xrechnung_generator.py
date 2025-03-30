import os
import csv
import sys
import requests
from pathlib import Path
from datetime import datetime
from jinja2 import Template


class Invoice:
    def __init__(self):

        # HEADER
        self.leitwegID = 0
        self.invoiceNumber = ""
        self.invoiceDate = ""
        self.dueDate = ""
        self.note = ""
        self.dueDays = ""  # Berechnen
        self.periodStart = ""
        self.periodEnd = ""

        # SELLER
        self.ownContactName = ""
        self.ownContactPhone = ""
        self.ownContactFax = ""
        self.ownContactEmail = ""
        self.ownIban = ""
        self.ownBic = ""
        self.ownAccountOwner = ""
        self.ownHraNo = ""  # Handelsregisternummer
        self.ownHraName = ""  # Handelsregister Name
        self.ownStreetname = ""
        self.ownPostalCode = ""
        self.ownCityname = ""
        self.ownCompanyName = ""
        self.ownCompanyID = ""  # UmstID
        self.ownTaxNo = ""  # Steuernummer

        # BUYER
        self.customerCompanyID = ""  # UmstID
        self.customerStreetname = ""
        self.customerPostalZone = ""
        self.customerCityname = ""
        self.customerEmail = ""
        self.customerCompanyName = ""

        # SETTLEMENT
        self.priceNet = ""
        self.priceFull = ""
        self.priceTax = ""  # Berechnen
        self.positionName = ""
        self.taxPercent = ""

        # DELIVERY
        self.locationID = ""
        self.recipientName = ""
        self.deliveryStreetName = ""
        self.deliveryCityName = ""
        self.deliveryPostalZone = ""
        self.deliveryRegion = ""
        self.deliveryCountryCode = ""
        self.deliveryReceiptName = ""

        # ALLOWANCES
        self.allowances = ""

        # CHARGES
        self.charges = ""

        # LINE ITEMS
        self.items = []


def validate_xml_file(fileName):
    try:
        url = "https://xrechnung-validator.demo.epoconsulting.com/"

        files = {"file": open(fileName, "rb")}

        request = requests.post(url, files=files)
        response = request.text

        if response:
            print(response)
    except:
        print(
            "Validating XML failed. Is the file format correct and an internet connection available?"
        )


# fmt: off
def generate_xrechnung(invoice_data):
    invoice = Invoice()
    
    # HEADER ------------------------------------------------------------
    header = invoice_data["header"]
    invoice.invoiceNumber = header["id"]
    invoice.invoiceDate = header["issue_date_time"]    
    invoice.leitwegID = header.get("leitweg_id", 0)
    invoice.note = " ".join(header.get("notes", []))
    
    agreement = invoice_data["trade"]["agreement"]
    invoice.contractDocumentReference = agreement.get("contract_reference", "")
    invoice.projectReference = agreement.get("project_reference", "")
    invoice.purchaseOrderReference = agreement.get("purchase_order_reference", "")
    
    # SELLER ------------------------------------------------------------
    seller = agreement["seller"]
    invoice.ownCompanyName = seller.get("name", "")
    invoice.ownContactName = seller.get("contact_name", "")
    seller_address = seller["address"]
    invoice.ownStreetname = seller_address.get("street_name", "")
    invoice.ownCityname = seller_address.get("city_name", "")
    invoice.ownPostalCode = seller_address.get("postal_zone", "")
    invoice.ownCompanyID = seller.get("tax_id", "")
    invoice.ownContactEmail = seller.get("email", "")
    invoice.ownContactPhone = seller.get("phone", "")
    invoice.ownContactFax = seller.get("fax", "")
    
    invoice.ownLegalForm = seller.get("legal_form", "")
    invoice.ownHraNo = seller.get("handels_register_number", "")
    invoice.ownHraName = seller.get("handels_register_name", "")
    
    # BUYER ------------------------------------------------------------
    buyer = agreement["buyer"]
    invoice.customerID = buyer.get("id", "")
    invoice.customerCompanyName = buyer.get("name", "")
    invoice.customerContactName = buyer.get("contact_name", "")
    invoice.customerOrderID = buyer.get("order_id", "")
    invoice.customerSalesOrderNumber = buyer.get("sales_order_number", "")
    invoice.customerContractDocumentReference = buyer.get("contract_document_reference", "")
    buyer_address = buyer["address"]
    invoice.customerStreetname = buyer_address.get("street_name", "")
    invoice.customerCityname = buyer_address.get("city_name", "")
    invoice.customerPostalZone = buyer_address.get("postal_zone", "")
    invoice.customerCompanyID = buyer.get("tax_id", "")
    invoice.customerContactEmail = buyer.get("email", "")
    
    # SETTLEMENT -------------------------------------------------------
    settlement = invoice_data["trade"]["settlement"]
    invoice.dueDate = settlement.get("advance_payment_date", "")
    invoice.paymentMeansCode = settlement["payment_means"]["type_code"] # https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL4461/
    invoice.ownIban = settlement.get("payment_means").get("iban", "")
    invoice.currencyCode = settlement.get("currency_code", "EUR")
    invoice.priceNet = settlement["monetary_summation"]["net_total"]
    invoice.priceTax = settlement["monetary_summation"]["tax_total"]
    invoice.priceFull = invoice.priceNet + invoice.priceTax
    tax_rates = settlement["trade_tax"]
    if tax_rates:
        invoice.taxPercent = tax_rates[0]["rate"] 
    
    invoiceDateObject = datetime.strptime(invoice.invoiceDate, "%Y-%m-%d")
    if invoice.dueDate != "":
        dueDateObject = datetime.strptime(invoice.dueDate, "%Y-%m-%d")
        invoice.dueDays = (dueDateObject - invoiceDateObject).days

    # DELIVERY ------------------------------------------------------------
    delivery = invoice_data["trade"].get("delivery")
    if delivery:
        invoice.locationID = delivery.get("location_id", "")
        invoice.recipientName = delivery.get("recipient_name", "")
        address = delivery.get("address", "")
        if address:
            invoice.deliveryStreetName = address.get("street_name", "")
            invoice.deliveryCityName = address.get("city_name", "")
            invoice.deliveryPostalZone = address.get("postal_zone", "")
            invoice.deliveryRegion = address.get("region", "")
            invoice.deliveryCountryCode = address.get("country_code", "")
            invoice.deliveryReceiptName = address.get("recipient_name", "")

    # ALLOWANCES ------------------------------------------------------------
    allowances = invoice_data["trade"].get("allowances")
    if allowances:
        invoice.allowances = allowances

    # CHARGES ------------------------------------------------------------
    charges = invoice_data["trade"].get("charges")
    if charges:
        invoice.charges = charges
    
    # LINE ITEMS ------------------------------------------------------------
    for item in invoice_data["trade"]["items"]:
        invoice.items.append({
            "lineID": item.get("line_id", ""),
            "periodStart": item.get("period_start", ""),
            "periodEnd": item.get("period_end", ""),
            "positionName": item.get("product_name", ""),
            "quantity": item.get("quantity", ""),
            "deliveryDetails": item.get("delivery_details", ""),
            "priceNet": item.get("agreement_net_price", ""),
            "taxPercent": item["settlement_tax"].get("rate", ""),
            "taxCategory": item["settlement_tax"].get("category", ""),
        })
    
    template = Template(open("./backend/templates/ubl-3.0.1-xrechnung-template.xml").read())
    return template.render(data=invoice)
# fmt: on


def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)
