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
    invoice.dueDate = invoice_data["trade"]["settlement"]["advance_payment_date"]
    invoice.note = invoice_data["header"].get("notes", [{}])[0].get("content", "")
    
    invoice.ownCompanyName = invoice_data["trade"]["agreement"]["seller"]["name"]
    invoice.ownStreetname = invoice_data["trade"]["agreement"]["seller"]["address"]["street_name"]
    invoice.ownCityname = invoice_data["trade"]["agreement"]["seller"]["address"]["city_name"]
    invoice.ownPostalCode = invoice_data["trade"]["agreement"]["seller"]["address"]["postal_zone"]
    invoice.ownCompanyID = invoice_data["trade"]["agreement"]["seller"].get("tax_id", "")
    
    invoice.customerCompanyName = invoice_data["trade"]["agreement"]["buyer"]["name"]
    invoice.customerStreetname = invoice_data["trade"]["agreement"]["buyer"]["address"]["street_name"]
    invoice.customerCityname = invoice_data["trade"]["agreement"]["buyer"]["address"]["city_name"]
    invoice.customerPostalZone = invoice_data["trade"]["agreement"]["buyer"]["address"]["postal_zone"]
    invoice.customerCompanyID = invoice_data["trade"]["agreement"]["buyer"].get("tax_id", "")
    
    invoice.priceNet = invoice_data["trade"]["settlement"]["monetary_summation"]["total"]
    invoice.priceFull = invoice.priceNet + invoice_data["trade"]["settlement"]["monetary_summation"]["tax_total"]
    invoice.priceTax = invoice_data["trade"]["settlement"]["monetary_summation"]["tax_total"]
    invoice.taxPercent = invoice_data["trade"]["settlement"]["trade_tax"][0]["rate"]
    
    invoiceDateObject = datetime.strptime(invoice.invoiceDate, "%Y-%m-%d")
    dueDateObject = datetime.strptime(invoice.dueDate, "%Y-%m-%d")
    invoice.dueDays = (dueDateObject - invoiceDateObject).days
    
    for item in invoice_data["trade"]["items"]:
        invoice.items.append({
            "lineID": item["line_id"],
            "positionName": item["product_name"],
            "quantity": item["quantity"],
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
