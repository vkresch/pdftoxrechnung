import pytest
from pdf_parser import preprocess_invoice_text

unprocessed_text = """
Kraxi GmbH
Flugzeugallee 17
12345 Papierfeld
Deutschland
Tel. (0123) 4567
Fax (0123) 4568
info@kraxi.com
Kraxi GmbH • Flugzeugallee 17 • 12345 Papierfeld • Deutschland
www.kraxi.com
Papierflieger-Vertriebs-GmbH
Helga Musterfrau
Rabattstr. 25
34567 Osterhausen
Deutschland
Rechnungsnummer: 2019-03 Liefer- und Rechnungsdatum: 8. Mai 2019
Kundennummer: 987-654
Ihre Auftragsnummer: ABC-123
Beträge in EUR
Pos. Artikelbeschreibung Menge Preis Betrag
1 Superdrachen 2 20,00 40,00
2 Turbo Flyer 5 40,00 200,00
3 Sturzflug-Geier 1 180,00 180,00
4 Eisvogel 3 50,00 150,00
5 Storch 10 20,00 200,00
6 Adler 1 75,00 75,00
7 Kostenlose Zugabe 1 0,00 0,00
Rechnungssumme netto 845,00
zuzüglich 19% MwSt. 160,55
Rechnungssumme brutto 1.005,55
Zahlbar innerhalb von 30 Tagen netto auf unser Konto. Bitte geben Sie dabei die
Rechnungsnummer an. Skontoabzüge werden nicht akzeptiert.
Kraxi GmbH Sitz der Gesellschaft USt-IdNr Postbank München
GF Paul Kraxi München HRB 999999 DE123456789 IBAN DE28700100809999999999
"""

expected_processed_text = """
Kraxi GmbH
Flugzeugallee 17
12345 Papierfeld
Deutschland
Tel. (0123) 4567
Fax (0123) 4568
info@kraxi.com
Kraxi GmbH • Flugzeugallee 17 • 12345 Papierfeld • Deutschland
www.kraxi.com
Papierflieger-Vertriebs-GmbH
Helga Musterfrau
Rabattstr. 25
34567 Osterhausen
Deutschland
Rechnungsnummer: 2019-03 Liefer- und Rechnungsdatum: 8. Mai 2019
Kundennummer: 987-654
Ihre Auftragsnummer: ABC-123
Beträge in EUR
Pos. Artikelbeschreibung Menge Preis Betrag
1 Superdrachen 2 20.00 40.00
2 Turbo Flyer 5 40.00 200.00
3 Sturzflug-Geier 1 180.00 180.00
4 Eisvogel 3 50.00 150.00
5 Storch 10 20.00 200.00
6 Adler 1 75.00 75.00
7 Kostenlose Zugabe 1 0.00 0.00
Rechnungssumme netto 845.00
zuzüglich 19% MwSt. 160.55
Rechnungssumme brutto 1005.55
Zahlbar innerhalb von 30 Tagen netto auf unser Konto. Bitte geben Sie dabei die
Rechnungsnummer an. Skontoabzüge werden nicht akzeptiert.
Kraxi GmbH Sitz der Gesellschaft USt-IdNr Postbank München
GF Paul Kraxi München HRB 999999 DE123456789 IBAN DE28700100809999999999
"""


def test_json_creation_output():
    assert expected_processed_text == preprocess_invoice_text(unprocessed_text)
