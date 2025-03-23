from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class Context(BaseModel):
    type: str = "Context"
    guideline_parameter: str


class Address(BaseModel):
    type: str = "Address"
    country: str
    country_code: Optional[str] = None
    state: Optional[str] = None
    street_name: Optional[str] = None
    street_name2: Optional[str] = None
    city_name: Optional[str] = None
    postal_zone: Optional[str] = None


class Seller(BaseModel):
    type: str = "Seller"
    name: str
    contact_name: Optional[str] = None
    address: Address
    tax_id: str
    iban: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    homepage: Optional[str] = None
    legal_form: Optional[str] = None
    handels_register_name: Optional[str] = None
    handels_register_number: Optional[str] = None
    trade_name: Optional[str] = None
    id: Optional[str] = None
    trade_id: Optional[str] = None
    vat_id: Optional[str] = None
    legal_info: Optional[str] = None
    electronic_address: Optional[str] = None
    electronic_address_type_code: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class Buyer(BaseModel):
    type: str = "Buyer"
    id: Optional[str] = None
    name: str
    contact_name: Optional[str] = None
    order_number: Optional[str] = None
    legal_form: Optional[str] = None
    address: Address
    trade_name: Optional[str] = None
    id_type: Optional[str] = None
    vat_id: Optional[str] = None
    reference: Optional[str] = None
    electronic_address: Optional[str] = None
    electronic_address_type_code: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class Order(BaseModel):
    type: str = "Order"
    date: date


class Agreement(BaseModel):
    type: str = "Agreement"
    seller: Seller
    buyer: Buyer
    orders: List[Order]
    contract_reference: Optional[str] = None
    project_reference: Optional[str] = None
    purchase_order_reference: Optional[str] = None
    sales_order_reference: Optional[str] = None


class Payee(BaseModel):
    type: str = "Payee"
    name: str


class Invoicee(BaseModel):
    type: str = "Invoicee"
    name: str


class PaymentMeans(BaseModel):
    type: str = "PaymentMeans"
    type_code: str
    account_name: Optional[str] = None
    iban: Optional[str] = None
    bic: Optional[str] = None
    bank_name: Optional[str] = None


class TradeTax(BaseModel):
    type: str = "TradeTax"
    category: str
    rate: float
    amount: float


class MonetarySummation(BaseModel):
    type: str = "MonetarySummation"
    net_total: Optional[float] = None
    tax_total: float
    grand_total: Optional[float] = None
    paid_amount: Optional[float] = None
    rounding_amount: Optional[float] = None
    due_amount: Optional[float] = None


class Settlement(BaseModel):
    type: str = "Settlement"
    payee: Payee
    invoicee: Invoicee
    currency_code: str
    payment_means: PaymentMeans
    advance_payment_date: date
    trade_tax: List[TradeTax]
    monetary_summation: MonetarySummation
    payment_reference: Optional[str] = None
    payment_terms: Optional[str] = None


class Tax(BaseModel):
    type: str = "Tax"
    category: str
    rate: float
    amount: float


class Item(BaseModel):
    type: str = "Item"
    line_id: str
    product_name: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    agreement_net_price: float
    quantity: int
    delivery_details: float
    settlement_tax: Tax
    total_amount: float
    id: Optional[str] = None
    order_position: Optional[str] = None
    description: Optional[str] = None
    quantity_unit: Optional[str] = None


class BillingPeriod(BaseModel):
    start_date: date
    end_date: date


class DeliveryParty(BaseModel):
    name: str
    address: Address


class Delivery(BaseModel):
    date: date
    delivery_note_id: Optional[str] = None
    delivery_party: DeliveryParty


class Trade(BaseModel):
    type: str = "Trade"
    agreement: Agreement
    settlement: Settlement
    items: List[Item]
    billing_period: Optional[BillingPeriod] = None
    delivery: Optional[Delivery] = None


class Header(BaseModel):
    id: str
    type: str = "Header"
    type_code: str
    name: str
    issue_date_time: date
    languages: str
    notes: List[str]


class Invoice(BaseModel):
    context: Context
    header: Header
    trade: Trade
    document_references: Optional[List[str]] = None
    intro_text: Optional[str] = None
    output_format: Optional[str] = None
    output_lang_code: Optional[str] = None
