from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

# fmt: off
class Context(BaseModel):
    type: str = Field(description="Type of the context (Kontexttyp)")
    guideline_parameter: str = Field(description="Parameter for guidelines (Richtlinienparameter)")


class Address(BaseModel):
    type: str = Field(description="Type of address (Adresstyp)")
    country: str = Field(description="Country name (Land)")
    country_code: Optional[str] = Field(description="Country code, e.g., DE for Germany (Ländercode)")
    state: Optional[str] = Field(description="State or province (Bundesland)")
    street_name: Optional[str] = Field(description="Street name (Straßenname)")
    street_name2: Optional[str] = Field(description="Additional street information (Zusätzliche Straßeninformationen)")
    city_name: Optional[str] = Field(description="City name (Stadt)")
    postal_zone: Optional[str] = Field(description="Postal code (Postleitzahl)")


class Seller(BaseModel):
    type: str = Field(description="Type of party - Seller (Verkäufer)")
    name: str = Field(description="Company name of the seller (Firmenname des Verkäufers)")
    contact_name: Optional[str] = Field(description="Name of contact person (Name der Kontaktperson)")
    address: Address = Field(description="Address of the seller (Adresse des Verkäufers)")
    tax_id: str = Field(description="Tax identification number (Steuernummer)")
    iban: Optional[str] = Field(description="International bank account number (IBAN)")
    phone: Optional[str] = Field(description="Phone number (Telefonnummer)")
    fax: Optional[str] = Field(description="Fax number (Faxnummer)")
    email: Optional[str] = Field(description="Email address (E-Mail-Adresse)")
    homepage: Optional[str] = Field(description="Website URL (Webseite)")
    legal_form: Optional[str] = Field(description="Legal form of the company (Rechtsform)")
    handels_register_name: Optional[str] = Field(description="Name of commercial register (Handelsregistername)")
    handels_register_number: Optional[str] = Field(description="Commercial register number (Handelsregisternummer)")
    trade_name: Optional[str] = Field(description="Trade name (Handelsname)")
    id: Optional[str] = Field(description="Seller ID (Verkäufer-ID)")
    trade_id: Optional[str] = Field(description="Trade ID (Handels-ID)")
    vat_id: Optional[str] = Field(description="VAT identification number (Umsatzsteuer-ID)")
    legal_info: Optional[str] = Field(description="Legal information (Rechtliche Informationen)")
    electronic_address: Optional[str] = Field(description="Electronic address (Elektronische Adresse)")
    electronic_address_type_code: Optional[str] = Field(description="Type code for electronic address (Typcode für elektronische Adresse)")
    contact_email: Optional[str] = Field(description="Contact email address (Kontakt-E-Mail)")
    contact_phone: Optional[str] = Field(description="Contact phone number (Kontakttelefon)")


class Buyer(BaseModel):
    type: str = Field(description="Type of party - Buyer (Käufer)")
    id: Optional[str] = Field(description="Buyer ID (Käufer-ID, Kundennummer)")
    name: str = Field(description="Company name of the buyer (Firmenname des Käufers)")
    contact_name: Optional[str] = Field(description="Name of contact person (Name der Kontaktperson)")
    sales_order_number: Optional[str] = Field(description="Sales order number (Auftragsnummer)")
    contract_document_reference: Optional[str] = Field(description="Reference to contract document (Vertragsdokumentreferenz)")
    legal_form: Optional[str] = Field(description="Legal form of the company (Rechtsform)")
    address: Address = Field(description="Address of the buyer (Adresse des Käufers)")
    trade_name: Optional[str] = Field(description="Trade name (Handelsname)")
    id_type: Optional[str] = Field(description="Type of ID (ID-Typ)")
    vat_id: Optional[str] = Field(description="VAT identification number (Umsatzsteuer-ID)")
    reference: Optional[str] = Field(description="Reference (Referenz)")
    electronic_address: Optional[str] = Field(description="Electronic address (Elektronische Adresse)")
    electronic_address_type_code: Optional[str] = Field(description="Type code for electronic address (Typcode für elektronische Adresse)")
    contact_email: Optional[str] = Field(description="Contact email address (Kontakt-E-Mail)")
    contact_phone: Optional[str] = Field(description="Contact phone number (Kontakttelefon)")


class Order(BaseModel):
    type: str = Field(description="Type of order (Auftragstyp)")
    date: datetime.datetime = Field(description="Order date (Bestelldatum)", json_schema_extra={"format": "date-time"})


class Agreement(BaseModel):
    type: str = Field(description="Type of agreement (Vereinbarungstyp)")
    seller: Seller = Field(description="Seller information (Verkäuferinformationen)")
    buyer: Buyer = Field(description="Buyer information (Käuferinformationen)")
    orders: List[Order] = Field(description="List of orders (Liste der Bestellungen)")
    contract_reference: Optional[str] = Field(description="Reference to contract (Vertragsnummer)")
    project_reference: Optional[str] = Field(description="Reference to project (Projektnummer)")
    order_id: Optional[str] = Field(description="Reference to purchase order (Bestellnummer)")


class Payee(BaseModel):
    type: str = Field(description="Type of party - Payee (Zahlungsempfänger)")
    name: str = Field(description="Name of payee (Name des Zahlungsempfängers)")


class Invoicee(BaseModel):
    type: str = Field(description="Type of party - Invoicee (Rechnungsempfänger)")
    name: str = Field(description="Name of invoicee (Name des Rechnungsempfängers)")


class PaymentMeans(BaseModel):
    type: str = Field(description="Type of payment means (Zahlungsmitteltyp)")
    type_code: str = Field(description="Payment type code with default value: '58' (Zahlungstypcode)")
    account_name: Optional[str] = Field(description="Account name (Kontoname)")
    iban: Optional[str] = Field(description="International bank account number (IBAN)")
    bic: Optional[str] = Field(description="Bank identifier code (BIC/SWIFT-Code)")
    bank_name: Optional[str] = Field(description="Bank name (Bankname)")


class TradeTax(BaseModel):
    type: str = Field(description="Type of trade tax (Handelssteuertyp)")
    category: str = Field(description="Tax category (Steuerkategorie)")
    rate: float = Field(description="Tax rate in percentage (Steuersatz in Prozent)")
    amount: float = Field(description="Tax amount (Steuerbetrag)")


class MonetarySummation(BaseModel):
    type: str = Field(description="Type of monetary summation (Währungssummentyp)")
    net_total: Optional[float] = Field(description="Net total amount (Nettogesamtbetrag)")
    tax_total: float = Field(description="Total tax amount (Gesamtsteuerbetrag)")
    grand_total: Optional[float] = Field(description="Grand total amount including taxes (Gesamtbetrag inkl. Steuern)")
    paid_amount: Optional[float] = Field(description="Amount already paid (Bereits gezahlter Betrag)")
    rounding_amount: Optional[float] = Field(description="Rounding amount (Rundungsbetrag)")
    due_amount: Optional[float] = Field(description="Amount due for payment normally equals the grand_total (Fälliger Zahlungsbetrag)")


class Settlement(BaseModel):
    type: str = Field(description="Type of settlement (Abrechnungstyp)")
    payee: Payee = Field(description="Payee information (Zahlungsempfängerinformationen)")
    invoicee: Invoicee = Field(description="Invoicee information (Rechnungsempfängerinformationen)")
    currency_code: str = Field(description="Currency code, e.g., EUR (Währungscode)")
    payment_means: PaymentMeans = Field(description="Payment means information (Zahlungsmittelinformationen)")
    advance_payment_date: datetime.datetime = Field(description="Date of advance payment (Vorauszahlungsdatum)", json_schema_extra={"format": "date-time"})
    trade_tax: List[TradeTax] = Field(description="List of trade taxes (Liste der Handelssteuern)")
    monetary_summation: MonetarySummation = Field(description="Monetary summation information (Währungssummeninformationen)")
    payment_reference: Optional[str] = Field(description="Payment reference (Zahlungsreferenz)")
    payment_terms: Optional[str] = Field(description="Payment terms (Zahlungsbedingungen)")


class Tax(BaseModel):
    type: str = Field(description="Type of tax (Steuertyp)")
    category: str = Field(description="Tax category (Steuerkategorie)")
    rate: float = Field(description="Tax rate in percentage (Steuersatz in Prozent)")
    amount: float = Field(description="Tax amount (Steuerbetrag)")


class Item(BaseModel):
    type: str = Field(description="Type of item (Positionstyp)")
    line_id: str = Field(description="Line ID (Zeilennummer)")
    product_name: str = Field(description="Product name (Produktname)")
    period_start: Optional[datetime.datetime] = Field(description="Start date of period (Startdatum des Zeitraums)", json_schema_extra={"format": "date-time"})
    period_end: Optional[datetime.datetime] = Field(description="End date of period (Enddatum des Zeitraums)", json_schema_extra={"format": "date-time"})
    agreement_net_price: float = Field(description="Agreed net price (Vereinbarter Nettopreis)")
    quantity: int = Field(description="Quantity (Menge)")
    delivery_details: float = Field(description="Delivery details amount (Lieferdetailsbetrag)")
    settlement_tax: Tax = Field(description="Settlement tax information (Abrechnungssteuerinformationen)")
    total_amount: float = Field(description="Total amount for this item (Gesamtbetrag für diese Position)")
    id: Optional[str] = Field(description="Item ID (Positions-ID)")
    order_position: Optional[str] = Field(description="Order position (Bestellposition)")
    description: Optional[str] = Field(description="Description of the item (Beschreibung der Position)")
    quantity_unit: Optional[str] = Field(description="Unit of quantity, e.g., pcs, kg (Mengeneinheit)")


class BillingPeriod(BaseModel):
    start_date: datetime.datetime = Field(description="Start date of billing period (Startdatum des Abrechnungszeitraums)", json_schema_extra={"format": "date-time"})
    end_date: datetime.datetime = Field(description="End date of billing period (Enddatum des Abrechnungszeitraums)", json_schema_extra={"format": "date-time"})


class DeliveryParty(BaseModel):
    name: str = Field(description="Name of delivery party (Name der Lieferpartei)")
    address: Address = Field(description="Address of delivery party (Adresse der Lieferpartei)")


class Delivery(BaseModel):
    date: datetime.datetime = Field(description="Delivery date (Lieferdatum)", json_schema_extra={"format": "date-time"})
    delivery_note_id: Optional[str] = Field(description="Delivery note ID (Lieferscheinnummer)")
    delivery_party: DeliveryParty = Field(description="Delivery party information (Lieferparteiinformationen)")


class Trade(BaseModel):
    type: str = Field(description="Type of trade (Handelstyp)")
    agreement: Agreement = Field(description="Agreement information (Vereinbarungsinformationen)")
    settlement: Settlement = Field(description="Settlement information (Abrechnungsinformationen)")
    items: List[Item] = Field(description="List of invoice items (Liste der Rechnungspositionen)")
    billing_period: Optional[BillingPeriod] = Field(description="Billing period information (Abrechnungszeitrauminformationen)")
    delivery: Optional[Delivery] = Field(description="Delivery information (Lieferinformationen)")


class Header(BaseModel):
    id: str = Field(description="Invoice ID (Rechnungsnummer)")
    type: str = Field(description="Type of header (Kopfzeilentyp)")
    leitweg_id: str = Field(description="Pflichtangabe bei Rechnungen für Behörden, optional bei Rechnungen für Firmen (Leitweg ID)")
    type_code: str = Field(description="Type code of the document with default value: '380' (Dokumententypcode)")
    name: str = Field(description="Document name (Dokumentenname)")
    issue_date_time: datetime.datetime = Field(description="Issue date of the invoice (Ausstellungsdatum der Rechnung)", json_schema_extra={"format": "date-time"})
    languages: str = Field(description="Language codes (Sprachcodes)")
    notes: List[str] = Field(description="Additional notes (Zusätzliche Hinweise)")


class Invoice(BaseModel):
    context: Context = Field(description="Context information (Kontextinformationen)")
    header: Header = Field(description="Header information (Kopfzeileninformationen)")
    trade: Trade = Field(description="Trade information (Handelsinformationen)")
    document_references: Optional[List[str]] = Field(description="References to other documents (Referenzen zu anderen Dokumenten)")
    intro_text: Optional[str] = Field(description="Introductory text (Einleitungstext)")
    output_format: Optional[str] = Field(description="Output format, e.g., PDF (Ausgabeformat)")
    output_lang_code: Optional[str] = Field(description="Output language code, e.g., DE (Ausgabesprachcode)")
# fmt: on
