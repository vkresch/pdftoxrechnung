import os
import csv
import sys
import requests
from pathlib import Path
from datetime import datetime
from jinja2 import Template


class Invoice:
    def __init__(self):
        self.invoiceNumber = None
        self.leitwegID = None
        self.invoiceDate = None
        self.dueDate = None
        self.note = None
        self.dueDays = None  # Berechnen
        self.periodStart = None
        self.periodEnd = None
        self.customerCompanyID = None  # UmstID
        self.customerStreetname = None
        self.customerPostalZone = None
        self.customerCityname = None
        self.customerEmail = None
        self.customerCompanyName = None

        # Zusatzadresse
        self.priceNet = None
        self.priceFull = None
        self.priceTax = None  # Berechnen
        self.positionName = None
        self.taxPercent = None
        self.ownStreetname = None
        self.ownPostalCode = None
        self.ownCityname = None
        self.ownCompanyName = None
        self.ownCompanyID = None  # UmstID
        self.ownTaxNo = None  # Steuernummer

        # ownContactCompanyName
        self.ownContactName = None
        self.ownContactPhone = None
        self.ownContactEmail = None
        self.ownIban = None
        self.ownBic = None
        self.ownAccountOwner = None
        self.ownHraNo = None  # Handelsregisternummer
        self.ownHraName = None  # Handelsregister Name

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
    
    invoice.invoiceNumber = invoice_data["header"]["id"]
    invoice.invoiceDate = invoice_data["header"]["issue_date_time"]
    invoice.dueDate = invoice_data["trade"]["settlement"].get("advance_payment_date", "")
    invoice.leitwegID = invoice_data["header"].get("leitweg_id")
    invoice.note = " ".join(invoice_data["header"].get("notes", []))
    
    invoice.ownCompanyName = invoice_data["trade"]["agreement"]["seller"]["name"]
    invoice.ownContactName = invoice_data["trade"]["agreement"]["seller"]["contact_name"]
    invoice.ownStreetname = invoice_data["trade"]["agreement"]["seller"]["address"]["street_name"]
    invoice.ownCityname = invoice_data["trade"]["agreement"]["seller"]["address"]["city_name"]
    invoice.ownPostalCode = invoice_data["trade"]["agreement"]["seller"]["address"]["postal_zone"]
    invoice.ownCompanyID = invoice_data["trade"]["agreement"]["seller"].get("tax_id", "")
    invoice.ownContactEmail = invoice_data["trade"]["agreement"]["seller"].get("email")
    invoice.ownContactPhone = invoice_data["trade"]["agreement"]["seller"].get("phone")
    invoice.ownIban = invoice_data["trade"]["agreement"]["seller"]["iban"]
    invoice.ownLegalForm = invoice_data["trade"]["agreement"]["seller"]["legal_form"]
    invoice.ownHraNo = invoice_data["trade"]["agreement"]["seller"]["handels_register_number"]
    invoice.ownHraName = invoice_data["trade"]["agreement"]["seller"]["handels_register_name"]
    
    invoice.customerID = invoice_data["trade"]["agreement"]["buyer"]["id"]
    invoice.customerCompanyName = invoice_data["trade"]["agreement"]["buyer"]["name"]
    invoice.customerContactName = invoice_data["trade"]["agreement"]["buyer"]["contact_name"]
    invoice.customerOrderNumber = invoice_data["trade"]["agreement"]["buyer"]["order_number"]
    invoice.customerStreetname = invoice_data["trade"]["agreement"]["buyer"]["address"]["street_name"]
    invoice.customerCityname = invoice_data["trade"]["agreement"]["buyer"]["address"]["city_name"]
    invoice.customerPostalZone = invoice_data["trade"]["agreement"]["buyer"]["address"]["postal_zone"]
    invoice.customerCompanyID = invoice_data["trade"]["agreement"]["buyer"].get("tax_id", "")
    invoice.customerContactEmail = invoice_data["trade"]["agreement"]["buyer"].get("email")
    
    invoice.priceNet = invoice_data["trade"]["settlement"]["monetary_summation"]["net_total"]
    invoice.priceTax = invoice_data["trade"]["settlement"]["monetary_summation"]["tax_total"]
    invoice.priceFull = invoice.priceNet + invoice.priceTax
    invoice.taxPercent = invoice_data["trade"]["settlement"]["trade_tax"][0]["rate"]
    
    invoiceDateObject = datetime.strptime(invoice.invoiceDate, "%Y-%m-%d")
    if invoice.dueDate != "":
        dueDateObject = datetime.strptime(invoice.dueDate, "%Y-%m-%d")
        invoice.dueDays = (dueDateObject - invoiceDateObject).days
    
    for item in invoice_data["trade"]["items"]:
        invoice.items.append({
            "lineID": item["line_id"],
            "periodStart": item.get("period_start"),
            "periodEnd": item.get("period_end"),
            "positionName": item["product_name"],
            "quantity": item["quantity"],
            "deliveryDetails": item["delivery_details"],
            "priceNet": item["agreement_net_price"],
            "taxPercent": item["settlement_tax"]["rate"],
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
