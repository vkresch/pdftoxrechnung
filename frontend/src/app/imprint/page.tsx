import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ImprintPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Impressum</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-muted-foreground">🏢</span>
            Informationen zum Unternehmen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Kretronik GmbH</h2>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Adresse</h3>
              <address className="not-italic">
              Schusterbauerstraße 13
                <br />
                84508 Burgkirchen 
                <br />
                Bayern, Deutschland
              </address>
            </div>

            <div>
              <h3 className="font-medium mb-2">Kontakt</h3>
              <p>
                Email:{" "}
                <a href="mailto:viktor.kreschenski@kretronik.com" className="text-primary hover:underline">
                  viktor.kreschenski@kretronik.com 
                </a>
              </p>
              <p>Telefon: +49 (0)176 97980772 </p>
              <p>Web: <a href="https://kretronik.com" target="_blank" className="text-primary hover:underline">https://kretronik.com</a></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-muted-foreground">👤</span>
            Gesetzliche Vertreter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Geschäftsführer: Viktor Kreschenski</p>
          <p>Handelsregister: Amtsgericht Traunstein, HRB 31999</p>
          <p>Umsatzsteuer ID: DE361918775</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-muted-foreground">⚖️</span>
            Haftungsausschluss
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <h3 className="font-medium">Haftung für Inhalte</h3>
            <p>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir weisen darauf hin, dass wir nicht verpflichtet sind, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h3 className="font-medium mt-4">Haftung für Links</h3>
            <p>
                Unser Angebot enthält Links zu externen Webseiten Dritter. Auf deren Inhalte haben wir keinen Einfluss und können daher auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 className="font-medium mt-4">Urheberrecht</h3>
            <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Letztes Update: 6. April 2025</p>
      </div>
    </div>
  )
}

