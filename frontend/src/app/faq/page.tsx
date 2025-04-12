import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Was ist eine XRechnung?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Eine <strong>XRechnung</strong> ist ein standardisiertes elektronisches Rechnungsformat, das speziell für die <strong>elektronische Rechnungsstellung an öffentliche Auftraggeber in Deutschland</strong> entwickelt wurde. Sie basiert auf einem strukturierten XML-Datenformat und ist <strong>rechtskonform zur EU-Richtlinie 2014/55/EU</strong> über die elektronische Rechnungsstellung im öffentlichen Auftragswesen.</p>
  
          <h3>Merkmale der XRechnung</h3>
          <ul>
            <li><strong>Rein maschinenlesbar</strong>: Keine bildhafte Darstellung wie bei PDFs.</li>
            <li><strong>XML-basiert</strong>: Inhalte wie Rechnungsbetrag, Steuern, Lieferdatum etc. sind klar strukturiert.</li>
            <li><strong>Standardisiert</strong>: Basierend auf dem europäischen Standard EN 16931.</li>
            <li><strong>Pflicht im B2G-Bereich</strong>: Seit dem 27. November 2020 für Rechnungen an Bundesbehörden.</li>
          </ul>

          <h3>Vorteile</h3>
          <ul>
            <li><strong>Automatisierte Verarbeitung</strong>: Rechnungen können direkt in Buchhaltungssysteme eingelesen werden.</li>
            <li><strong>Fehlerreduktion</strong> durch strukturierte Daten.</li>
            <li><strong>Schnellere Zahlungsabwicklung</strong>.</li>
          </ul>

          <h3>Wichtige Bestandteile</h3>
          <ul>
            <li>Rechnungsnummer</li>
            <li>Rechnungsdatum</li>
            <li>Zahlungsempfänger</li>
            <li>USt.-ID oder Steuernummer</li>
            <li>Lieferdatum</li>
            <li>Bestellreferenz (z.&nbsp;B. Leitweg-ID)</li>
          </ul>

          <h3>Wann ist sie erforderlich?</h3>
          <p>Die XRechnung ist verpflichtend bei:</p>
          <ul>
            <li>Rechnungen an <strong>öffentliche Auftraggeber des Bundes</strong>.</li>
            <li>Rechnungsbeträgen <strong>über 1.000 € netto</strong> (variiert je nach Bundesland).</li>
          </ul>

          <p>Wenn Sie Rechnungen z.&nbsp;B. an eine Bundesbehörde, ein Ministerium oder eine andere öffentliche Institution stellen, müssen Sie eine XRechnung übermitteln.</p>
          <p>Mehr Information finden sie beim <a href="https://www.e-rechnung-bund.de/faq/xrechnung/" target="_blank">FAQ zum Thema XRechnung</a></p>
        </CardContent>
      </Card>
    
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Werden die hochgeladenen Rechnungen gespeichert?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Nein! Nachdem deine Rechnung in die XRechnung konvertiert worden ist, wird diese von unserem Server sofort gelöscht.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Warum gibt es drei Schritte bei der Konvertierung?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Damit eine korrekte XRechnung erzeugt werden kann.</p>
          <p>
            Im ersten Schritt wird die PDF Rechnung hochgeladen und in eine strukturierte Form umgewandelt.
            Im zweiten Schritt kann der Benutzer die strukturierte Form manuell validieren und selber Felder hinzufügen falls nötig.
            Im dritten Schritt kann die XRechnung heruntergeladen werden.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Kann ich auch fotografierte Rechnungen mit dem Tool in XRechnungen konvertieren?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Ja! Wir benutzen <a href="https://github.com/JaidedAI/EasyOCR" target="_blank">EasyOCR</a> um in den Bildern Text zu erkennen.
            Dieser Text wird dann in eine strukturiert Form konvertiert, die vom Benutzer im zweiten Schritt noch korrigiert werden kann.
            Als Input wird nur das PDF Format akzeptiert.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Wie lange dauert die Konvertierung?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Aktuell befinden wir uns in der Testphase und versuchen den Prozess so optimal wie möglich zu machen.
            Damit alle relevanten Felder vom PDF strukturiert erfasst werden können, braucht unser Tool aktuell ~15-30 Sekunden.
            Je mehr Information in der Rechnung enthalten ist, desto länger könnte der Konvertierungsprozess verlaufen.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Warum ist meine Konvertierung fehlgeschlagen?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Aktuell befindet sich das Tool in der Testphase und wird ständig weiterentwickelt.
            Es gibt viele Ursachen warum der Prozess fehlschlagen kann. Somit müssen wir den Fehler zuerst analysieren. 
            Als ersten Schritt bitte Seite neu laden und erneut probieren.
            Falls es andauert bitte ein Issue auf <a href="https://github.com/kretronik/pdftoxrechnung/issues" target="_blank"><b>GitHub</b></a> öffnen,
            damit wir den Fehler reproduzieren können.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

