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
          <p>Die <b>XRechnung</b> ist ein <b>standardisiertes elektronisches Rechnungsformat</b> in Deutschland. Sie wurde entwickelt, um den Austausch von Rechnungsdaten zwischen Unternehmen und der öffentlichen Verwaltung zu vereinfachen und zu automatisieren.</p>
          <p>Die wichtigsten Punkte zur XRechnung:</p>
          <ul>
              <li><b>Standard für elektronische Rechnungen:</b> Die XRechnung definiert die Art und technische Zusammensetzung von Rechnungsinformationen in einem strukturierten <b>XML-Datensatz</b>.</li>
              <br />
              <li><b>Maschinenlesbar:</b> Das XML-Format ermöglicht es Softwaresystemen, die Rechnungsdaten automatisch auszulesen und zu verarbeiten.</li>
              <br />
              <li><b>Erfüllt EU-Norm:</b> Die XRechnung ist eine nationale Ausgestaltung der europäischen Norm <b>EN 16931</b> für die elektronische Rechnungsstellung.</li>
              <br />
              <li><b>Pflicht für öffentliche Auftraggeber:</b> Seit dem 27. November 2020 müssen Lieferanten des Bundes Rechnungen an Bundesbehörden im XRechnungsformat stellen. Auch viele Landesbehörden akzeptieren oder fordern die XRechnung.</li>
              <br />
              <li><b>Wichtig für B2B:</b> Seit dem 1. Januar 2025 gilt in Deutschland eine <b>E-Rechnungspflicht im B2B-Bereich</b>, wobei die XRechnung als eines der zulässigen Formate verwendet werden kann.</li>
              <br />
              <li><b>Bestandteile:</b> Eine XRechnung enthält Header-Informationen (z.B. Rechnungssteller, Rechnungsempfänger, Rechnungsnummer), Rechnungspositionen, Steuerangaben und gegebenenfalls zusätzliche Informationen wie Bestell- oder Auftragsnummern.</li>
              <br />
              <li><b>Austausch:</b> XRechnungen werden in der Regel als Anhang einer E-Mail oder über spezielle Rechnungsportale ausgetauscht.</li>
          </ul>
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
            Nein! Hochgeladene Rechnungen werden mit einem Cron Job für immer vom Server gelöscht.
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
          <p>Kurz: Damit eine korrekte XRechnung erzeugt werden kann.</p>
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
            Ja! Wir benutzen <a href="https://github.com/JaidedAI/EasyOCR" target="_blank" rel="nofollow" className="underline">EasyOCR</a> und <a href="https://deepmind.google/technologies/gemini/" target="_blank" className="underline" rel="nofollow">Gemini 2.0 Flash</a> um in den Bildern Text zu erkennen.
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
            Damit alle relevanten Felder vom PDF strukturiert erfasst werden können, braucht unser Tool aktuell ~10-20 Sekunden.
            Je mehr Information in der Rechnung enthalten ist, desto länger könnte der Konvertierungsprozess verlaufen.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Kann ich automatisiert mehrere PDF Rechnungen in XRechnungen konvertieren?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Ja dazu kannst du unseren Endpoint auf <a href="https://rapidapi.com/kretronik/api/pdftoxrechnung" target="_blank" rel="nofollow" className="underline">RapidAPI</a> verwenden.
            Bei Anfrage kann auch ein individueller Plan vereinbart werden nach Bedarf.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ist pdftoxrechnung.de kostenlos?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Ja die Nutzung der Webapplikation is <b>kostenlos</b>. 
            Die API Nutzung auf <a href="https://rapidapi.com/kretronik/api/pdftoxrechnung" target="_blank" rel="nofollow" className="underline">RapidAPI</a> ist kostenpflichtig.
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
            Falls es andauert bitte ein Issue auf <a href="https://github.com/kretronik/pdftoxrechnung/issues" target="_blank" rel="nofollow" className="underline">GitHub</a> öffnen,
            damit wir den Fehler reproduzieren können.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}

