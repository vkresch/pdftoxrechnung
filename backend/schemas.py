from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class Context(BaseModel):
    type: str = "Context"
    guideline_parameter: str = (
        "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended"
    )


class Address(BaseModel):
    type: str = "Address"
    country: str = "Germany"
    country_code: str = "DE"
    country_subdivision: str = None
    street_name: str = None
    city_name: str = None
    postal_zone: int = None


class Seller(BaseModel):
    type: str = "Seller"
    name: str
    address: Address
    tax_id: str
    iban: str
    phone: str
    email: str
    homepage: str
    handels_register_name: str
    handels_register_number: str


class Buyer(BaseModel):
    type: str = "Buyer"
    name: str
    address: Address
    tax_id: str


class Order(BaseModel):
    type: str = "Order"
    date: date


class Agreement(BaseModel):
    type: str = "Agreement"
    seller: Seller
    buyer: Buyer
    orders: List[Order]


class Payee(BaseModel):
    type: str = "Payee"
    name: str


class Invoicee(BaseModel):
    type: str = "Invoicee"
    name: str


class PaymentMeans(BaseModel):
    type: str = "PaymentMeans"
    type_code: str


class TradeTax(BaseModel):
    type: str = "TradeTax"
    category: str
    rate: float
    amount: float


class MonetarySummation(BaseModel):
    type: str = "MonetarySummation"
    total: float
    tax_total: float


class Settlement(BaseModel):
    type: str = "Settlement"
    payee: Payee
    invoicee: Invoicee
    currency_code: str
    payment_means: PaymentMeans
    advance_payment_date: date
    trade_tax: List[TradeTax]
    monetary_summation: MonetarySummation


class Tax(BaseModel):
    type: str = "Tax"
    category: str
    rate: float
    amount: float


class Item(BaseModel):
    type: str = "Item"
    line_id: str
    product_name: str
    agreement_net_price: float
    quantity: int
    delivery_details: float
    settlement_tax: Tax
    total_amount: float


class Trade(BaseModel):
    type: str = "Trade"
    agreement: Agreement
    settlement: Settlement
    items: List[Item]


class Notes(BaseModel):
    content_code: str
    content: str
    subject_code: str


class Header(BaseModel):
    id: str
    type: str = "Header"
    type_code: str
    name: str
    issue_date_time: date
    languages: str
    notes: List[Notes]


class Invoice(BaseModel):
    context: Context
    header: Header
    trade: Trade
