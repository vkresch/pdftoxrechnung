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
        self.ownBIC = ""
        self.ownBankName = ""
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
        self.customerAdditionalStreetname = ""
        self.customerPostalZone = ""
        self.customerCityname = ""
        self.customerContactEmail = ""
        self.customerContactPhone = ""
        self.customerCompanyName = ""

        # SETTLEMENT
        self.priceNet = ""
        self.priceFull = ""
        self.priceTax = ""  # Berechnen
        self.positionName = ""
        self.taxPercent = ""

        # DELIVERY
        self.locationID = ""
        self.deliveryDate = ""
        self.deliveryStreetName = ""
        self.deliveryAdditionalStreetName = ""
        self.deliveryAdditionalInfo = ""
        self.deliveryCityName = ""
        self.deliveryPostalZone = ""
        self.deliveryRegion = ""
        self.deliveryCountryCode = ""
        self.deliveryReceiptName = ""

        # ALLOWANCES
        self.allowances = []

        # CHARGES
        self.charges = []

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
    invoice.leitwegID = header.get("leitweg_id", 0) or 0
    invoice.note = " ".join(header.get("notes", []))

    invoice.periodStart = invoice_data["trade"].get("start_date", "")
    invoice.periodEnd = invoice_data["trade"].get("end_date", "")
    
    agreement = invoice_data["trade"]["agreement"]
    invoice.contractDocumentReference = agreement.get("contract_reference", "")
    invoice.projectReference = agreement.get("project_reference", "")
    invoice.objectReference = agreement.get("object_reference", "")
    invoice.documentReference = agreement.get("document_reference", "")
    invoice.previousBillingReference = agreement.get("previous_billing_reference", "")
    invoice.previousBillingDate = agreement.get("previous_billing_date", "")
    
    # SELLER ------------------------------------------------------------
    seller = agreement["seller"]
    invoice.ownCompanyName = seller.get("name", "")
    invoice.ownContactName = seller.get("contact_name", "")
    invoice.ownSalesOrderReference = seller.get("order_id", "")
    seller_address = seller["address"]
    invoice.ownStreetname = seller_address.get("street_name", "")
    invoice.ownAdditionalStreetname = seller_address.get("street_name2", "")
    invoice.ownCityname = seller_address.get("city_name", "")
    invoice.ownPostalCode = seller_address.get("postal_zone", "")
    invoice.ownID = seller.get("id", "")
    invoice.ownCompanyID = seller.get("vat_id", "")
    invoice.ownTaxNo = seller.get("tax_id", "")
    invoice.ownContactEmail = seller.get("email", "")
    invoice.ownContactPhone = seller.get("phone", "")
    invoice.ownContactFax = seller.get("fax", "")
    
    invoice.ownLegalForm = seller.get("legal_form", "")
    invoice.ownHraNo = seller.get("handels_register_number", "")
    invoice.ownHraName = seller.get("handels_register_name", "")
    
    # BUYER ------------------------------------------------------------
    buyer = agreement["buyer"]
    invoice.customerID = buyer.get("id", "")
    invoice.customerPurchaseOrderReference = buyer.get("order_id", "")
    invoice.customerCompanyName = buyer.get("name", "")
    invoice.customerContactName = buyer.get("contact_name", "")
    invoice.customerContractDocumentReference = buyer.get("contract_document_reference", "")
    buyer_address = buyer["address"]
    invoice.customerStreetname = buyer_address.get("street_name", "")
    invoice.customerAdditionalStreetname = buyer_address.get("street_name2", "")
    invoice.customerCityname = buyer_address.get("city_name", "")
    invoice.customerPostalZone = buyer_address.get("postal_zone", "")
    invoice.customerCompanyID = buyer.get("vat_id", "")
    invoice.customerTaxNo = buyer.get("tax_id", "")
    invoice.customerRegisterID = buyer.get("register_id", "")
    invoice.customerContactPhone = buyer.get("contact_phone", "")
    invoice.customerContactEmail = buyer.get("contact_email", "")
    
    # SETTLEMENT -------------------------------------------------------
    settlement = invoice_data["trade"]["settlement"]
    invoice.dueDate = settlement.get("advance_payment_date", "")
    invoice.paymentMeansCode = settlement["payment_means"].get("type_code", "58") # https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL4461/
    invoice.ownIban = settlement.get("payment_means").get("iban", "")
    invoice.ownBIC = settlement.get("payment_means").get("bic", "")
    invoice.ownBankName = settlement.get("payment_means").get("bank_name", "")
    invoice.currencyCode = settlement.get("currency_code", "EUR")
    invoice.priceNet = settlement["monetary_summation"]["net_total"]
    invoice.priceTax = settlement["monetary_summation"]["tax_total"]
    invoice.priceFull = invoice.priceNet + invoice.priceTax
    invoice.paymentTerms = settlement.get("payment_terms", "")
    tax_rates = settlement["trade_tax"]
    if tax_rates:
        invoice.taxPercent = tax_rates[0]["rate"] 
    
    invoiceDateObject = datetime.strptime(invoice.invoiceDate, "%Y-%m-%d")
    if invoice.dueDate is not None and invoice.dueDate != "":
        dueDateObject = datetime.strptime(invoice.dueDate, "%Y-%m-%d")
        invoice.dueDays = (dueDateObject - invoiceDateObject).days

    # DELIVERY ------------------------------------------------------------
    delivery = invoice_data["trade"].get("delivery")    
    if delivery:
        invoice.deliveryReceiptName = delivery.get("recipient_name", "")
        invoice.deliveryDate = delivery.get("date", header["issue_date_time"])
        invoice.locationID = delivery.get("location_id", "")
        address = delivery.get("address", "")
        if address:
            invoice.deliveryStreetName = address.get("street_name", "")
            invoice.deliveryAdditionalStreetName = address.get("street_name2", "")
            invoice.deliveryAdditionalInfo = address.get("additional_info", "")
            invoice.deliveryCityName = address.get("city_name", "")
            invoice.deliveryPostalZone = address.get("postal_zone", "")
            invoice.deliveryRegion = address.get("region", "")
            invoice.deliveryCountryCode = address.get("country_code", "")
    else:
        invoice.deliveryDate = header["issue_date_time"]

    # ALLOWANCES ------------------------------------------------------------
    allowances = invoice_data["trade"].get("allowances")
    if allowances:
        invoice.allowances = allowances

    # CHARGES ------------------------------------------------------------
    charges = invoice_data["trade"].get("charges")
    if charges:
        invoice.charges = charges
    
    # LINE ITEMS ------------------------------------------------------------
    tax_sub_totals = {}
    for item in invoice_data["trade"]["items"]:
        tax_category = item["settlement_tax"].get("category", "")
        price_net = float(item.get("agreement_net_price", 0))
        delivery_details = float(item.get("delivery_details", 0))
        tax_percent = item["settlement_tax"].get("rate", "")
        
        invoice.items.append({
            "lineID": item.get("line_id", ""),
            "periodStart": item.get("period_start", ""),
            "periodEnd": item.get("period_end", ""),
            "positionName": item.get("product_name", ""),
            "quantity": item.get("quantity", ""),
            "deliveryDetails": delivery_details,
            "priceNet": price_net,
            "taxPercent": tax_percent,
            "taxCategory": tax_category,
        })

        # Sum the priceNet values for each taxCategory
        if tax_category in tax_sub_totals:
            tax_sub_totals[tax_category]["priceNet"] += delivery_details
        else:
            tax_sub_totals[tax_category] = {"priceNet": delivery_details, "taxPercent": tax_percent}

    invoice.taxSubTotals = tax_sub_totals
    
    template = Template(open("./templates/ubl-3.0.1-xrechnung-template.xml").read())
    return template.render(data=invoice)
# fmt: on


def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)
