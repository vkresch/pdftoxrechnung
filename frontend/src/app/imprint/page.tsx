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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-muted-foreground">🛡️</span>
            Datenschutzerklärung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6 text-text-primary">
              <p>Willkommen bei pdftoxrechnung.de („wir“, „uns“ oder „unser“). Diese Datenschutzerklärung erläutert, wie wir Ihre personenbezogenen Daten erheben, verwenden und schützen, wenn Sie unsere Dienste nutzen. Wir verpflichten uns, Ihre Privatsphäre zu schützen und alle anwendbaren Datenschutzgesetze, einschließlich der EU-Datenschutz-Grundverordnung (DSGVO), einzuhalten. Durch die Nutzung von pdftoxrechnung.de stimmen Sie den in dieser Erklärung beschriebenen Praktiken zu.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Verantwortliche Stelle (Impressum)</h2>
                <p><strong>Verantwortliche Stelle:</strong> Kretronik GmbH</p>
                <p><strong>Geschäftsadresse:</strong> Schusterbauerstraße 13, 84508 Burgkirchen, Deutschland
                <strong> Kontakt E-Mail:</strong> viktor.kreschenski@kretronik.com</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">2. Webhosting und Dienstleister</h2>
                <p><strong>Hosting:</strong> Unsere Backend-Server befinden sich in Frankfurt, Deutschland (EU). Ihre Daten werden zunächst auf Servern in Deutschland verarbeitet, was dem DSGVO-Standard entspricht.</p>
                <p><strong>Gemini 2.0 Flash:</strong> Zur Konvertierung von Rechnungen nutzen wir die Gemini 2.0 Flash API (Google, USA). Die Rechnungsinhalte werden verschlüsselt an die API gesendet, verarbeitet und zur Erfüllung Ihres Auftrags zurückgesandt. Wir stützen uns auf das Data Processing Addendum von Google und SCCs, um Ihre Daten gemäß DSGVO-Standards zu schützen.</p>
                <p><strong>Google Tag Manager &amp; Google Analytics:</strong> Wir setzen Google Tag Manager zum Einbinden von Google Analytics ein, mit dem wir die Nutzung unserer Website nachvollziehen. Google Analytics kann Cookies platzieren und Daten an Google-Server in den USA übertragen. Google verwendet SCCs sowie eine IP-Anonymisierung, um EU-Daten zu schützen.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Erhobene und verwendete personenbezogene Daten</h2>
                <p><strong>a. Besuch unserer Website:</strong> Wir erfassen technische Daten (IP-Adresse, Zugriffszeit, Referrer-URL etc.) in Server-Logs zur Sicherheit und Leistungsanalyse. Dies beruht auf unserem berechtigten Interesse (Art. 6 Abs. 1 lit. f DSGVO).</p>
                <p><strong>b. Konvertierung von Rechnungen:</strong> Laden Sie eine PDF-Datei zur Konvertierung hoch, können darin personenbezogene Daten (z.B. Namen, Adressen, Rechnungspositionen) enthalten sein. Diese werden sicher an die Gemini 2.0 Flash gesendet und nach Erhalt des konvertierten Ergebnisses von unseren Servern gelöscht. Wir speichern Rechnungsdaten nicht dauerhaft.</p>
                <p><strong>c. Cookies und Tracking:</strong> Wir verwenden essenzielle Cookies für die Funktionalität der Seite sowie – mit Ihrer Einwilligung – Analyse-Cookies zur Messung der Leistung. Sie können Google Analytics ablehnen, indem Sie Cookies in unserem Banner ablehnen oder das <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">Google Analytics Opt-out Browser-Add-on</a> installieren.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">4. Internationale Datenübermittlungen</h2>
                <p>Einige unserer Dienstleister haben ihren Sitz außerhalb der EU (z.B. Google). Wir stützen uns auf Standardvertragsklauseln und andere zulässige Übermittlungsmechanismen nach der DSGVO, um Ihre Daten angemessen zu schützen. Einzelheiten zu den Anbietern finden Sie oben.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Aufbewahrung und Löschung von Daten</h2>
                <p>- <strong>Rechnungen:</strong> Wir bewahren hochgeladene Dateien nach der Konvertierung <em>nicht</em> auf; sie werden gelöscht, sobald die Umwandlung erfolgt ist.</p>
                <p>- <strong>Analytics:</strong> Google-Analytics-Daten werden in der Regel 2 Monate aufbewahrt und nur aggregiert verwendet.</p>
                <p>- <strong>Server-Logs:</strong> Automatische Löschung nach kurzer Zeit, es sei denn, sie werden für Sicherheitsuntersuchungen benötigt.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Ihre Rechte als betroffene Person</h2>
                <p>Sie haben das Recht auf:</p>
                <ul className="list-disc pl-5">
                    <li><strong>Auskunft</strong> (Art. 15 DSGVO)</li>
                    <li><strong>Berichtigung</strong> (Art. 16 DSGVO)</li>
                    <li><strong>Löschung</strong> (Art. 17 DSGVO)</li>
                    <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
                    <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
                    <li><strong>Widerspruch</strong> (Art. 21 DSGVO), insbesondere gegen Direktwerbung oder Verarbeitung aufgrund berechtigter Interessen</li>
                    <li><strong>Widerruf einer Einwilligung</strong> jederzeit, ohne die Rechtmäßigkeit der zuvor erfolgten Verarbeitung zu beeinträchtigen</li>
                </ul>
                <p>Zur Ausübung dieser Rechte schreiben Sie bitte an<strong> viktor.kreschenski@kretronik.com</strong>. Wir können einen Identitätsnachweis verlangen. In der Regel antworten wir innerhalb eines Monats.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Beschwerderecht</h2>
                <p>Wenn Sie glauben, dass Ihre Datenschutzrechte verletzt wurden, können Sie eine Beschwerde bei einer Datenschutzaufsichtsbehörde einreichen – entweder in Ihrem EU-Mitgliedstaat des Wohnsitzes, des Arbeitsplatzes oder an dem Ort, an dem der mutmaßliche Verstoß stattgefunden hat.</p>
                <p>Zuständige Behörde (Beispiel Baden-Württemberg):Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-WürttembergKönigstraße 10a, 70173 Stuttgart, GermanyE-Mail: <em>poststelle@lfdi.bwl.de</em></p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">8. Datensicherheitsmaßnahmen</h2>
                <p>Wir setzen HTTPS-Verschlüsselung, sichere Hosting-Umgebungen und strenge Zugriffskontrollen ein. Passwörter werden gehasht. Hochgeladene Rechnungsdateien werden unmittelbar nach der Konvertierung gelöscht. Obwohl keine Methode 100% sicher ist, bemühen wir uns, Ihre Daten vor unbefugtem Zugriff zu schützen. Bei einer Verletzung des Schutzes personenbezogener Daten werden wir Sie und die zuständigen Behörden informieren, sofern gesetzlich vorgeschrieben.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">9. Haftungsausschluss und Haftungsbegrenzung</h2>
                <p><strong>Genauigkeit der Konvertierung:</strong> Wir übernehmen keine Garantie für Vollständigkeit oder Richtigkeit der umgewandelten Rechnungen. Die Ausgaben erfolgen „wie besehen“. Es obliegt Ihnen, die Ergebnisse auf Rechts- und Konformitätsanforderungen zu überprüfen. Wir haften nicht für Schäden durch Fehler in den konvertierten Daten.</p>
                <p><strong>Verfügbarkeit des Dienstes:</strong> Wir gewährleisten keine ununterbrochene Verfügbarkeit; Ausfälle können vorkommen. Wir haften nicht für Schäden aus Service-Unterbrechungen oder Drittdienst-Ausfällen (Google, Hosting etc.).</p>
                <p><strong>Datenübertragung:</strong> Wir verwenden Verschlüsselung und gängige Sicherheitsstandards, jedoch ist die Übertragung über das Internet nie ohne Restrisiken. Für unbefugtes Abfangen oder Hacking außerhalb unseres Einflussbereichs übernehmen wir keine Haftung.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">10. Änderungen dieser Datenschutzerklärung</h2>
                <p>Wir können diese Erklärung anpassen, um Änderungen unserer Praktiken oder rechtlichen Anforderungen widerzuspiegeln. Bei erheblichen Änderungen aktualisieren wir das „Stand“-Datum und informieren Nutzer per E-Mail oder Hinweis auf der Website. Ihre fortgesetzte Nutzung von pdftoxrechnung.de gilt als Zustimmung zu den neuen Bestimmungen.</p>
                <h2 className="text-2xl font-semibold text-text-primary mb-4">11. Kontaktinformationen</h2>
                <p>Bei Fragen oder Anliegen zu dieser Datenschutzerklärung wenden Sie sich bitte an:</p>
                <p><strong>Kretronik GmbH</strong> (Datenschutzbeauftragter / Eigentümer)E-Mail: <em>viktor.kreschenski@kretronik.com</em> Adresse: Schusterbauerstraße 13, 84508 Burgkirchen, Deutschland</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-muted-foreground">🤝</span>
            Geschäftsbedingungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">Einleitung</h3>
              <p>Diese Geschäftsbedingungen (“Bedingungen”) regeln Ihre Nutzung der Website und Dienste von pdftoxrechnung.de (gemeinsam als “Dienst” bezeichnet). Durch den Zugriff auf oder die Nutzung des Dienstes stimmen Sie diesen Bedingungen zu. Wenn Sie mit Teilen oder dem Ganzen dieser Bedingungen nicht einverstanden sind, dürfen Sie den Dienst nicht nutzen. Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie pdftoxrechnung.de verwenden.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">1. Geschäftsstatus und Haftungsbeschränkung</h3>
              <p><strong>Betreiber:</strong> Der Dienst wird von <strong>Kretronik GmbH</strong> nach deutschem Recht betrieben. Sämtliche rechtliche Verantwortung und Haftung für den Dienst trägt damit allein Kretronik GmbH als Inhaber.</p>
              <p><strong>Haftung und “As Is”-Bereitstellung:</strong> Als GmbH haftet Kretronik GmbH für die Verpflichtungen und Schulden von pdftoxrechnung.de. Der Dienst wird jedoch <em>“wie besehen”</em> und <em>“wie verfügbar”</em> bereitgestellt, ohne jegliche Gewährleistungen oder Garantien. Die Nutzung des Dienstes erfolgt auf Ihr eigenes Risiko. Wir übernehmen <strong>keine Zusicherungen oder Garantien</strong>, dass der Dienst ununterbrochen, fehlerfrei oder stets sicher ist oder Ihre Anforderungen erfüllt.</p>
              <p><strong>Haftungsbegrenzung:</strong> Zur Begrenzung überhöhter Ansprüche enthält dieser Abschnitt eine Haftungsbeschränkung.<em>Weder pdftoxrechnung.de noch Kretronik GmbH haften für indirekte, zufällige, besondere oder Folgeschäden</em> (einschließlich, aber nicht beschränkt auf entgangenen Gewinn oder Datenverlust), die sich aus oder im Zusammenhang mit Ihrer Nutzung bzw. Unfähigkeit zur Nutzung des Dienstes ergeben. Soweit zwingendes Recht eine vollständige Haftungsausschluss nicht erlaubt, ist die Haftung der Höhe nach auf den Betrag beschränkt, den Sie in den letzten zwölf (12) Monaten vor dem Ereignis an uns gezahlt haben. Nichts in diesen Bedingungen schließt die Haftung für grobe Fahrlässigkeit, vorsätzliches Fehlverhalten oder Schäden an Leben, Körper oder Gesundheit oder jede andere Haftung aus, die gesetzlich nicht ausgeschlossen werden kann.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">2. Weltweite Verfügbarkeit &amp; Verantwortung für gesetzliche Einhaltung</h3>
              <p><strong>Weltweite Bereitstellung:</strong> Der Dienst ist grundsätzlich weltweit nutzbar. Die gesetzlichen Anforderungen an E-Rechnungen und Datenverarbeitung können sich jedoch von Land zu Land unterscheiden. Sie müssen selbst beurteilen, ob Ihre Nutzung des Dienstes in Ihrem Land gesetzeskonform ist.</p>
              <p><strong>Verantwortung des Nutzers für Rechtskonformität:</strong> Sie tragen die volle Verantwortung für die Einhaltung einschlägiger Gesetze und Vorschriften in Ihrem Land. Wir gewährleisten nicht, dass die erstellten Dokumente (z.B. konvertierte Rechnungen) den spezifischen Anforderungen Ihrer lokalen Behörden entsprechen. Sämtliche Strafen, Bußgelder oder rechtlichen Konsequenzen aus einer Nichtbeachtung der lokalen Vorschriften liegen allein in Ihrer Verantwortung. Wir empfehlen, vor der Nutzung der konvertierten Rechnungen in rechtlich sensiblen Zusammenhängen einen Rechts- oder Steuerberater hinzuzuziehen.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">3. Streitbeilegungsverfahren</h3>
              <p><strong>Schritt 1 - Kontaktaufnahme:</strong> Sie verpflichten sich, zunächst per E-Mail an <strong>contact@pdftoxrechnung.de</strong> eine Lösung zu versuchen und uns mindestens 30 Tage Zeit zu geben, bevor Sie rechtliche Schritte einleiten.</p>
              <p><strong>Schritt 2 - Anwendbares Recht &amp; Gerichtsstand:</strong> Kommt keine Einigung zustande, gilt deutsches Recht. Die Gerichte in Deutschland haben ausschließliche Zuständigkeit für Streitfälle, sofern gesetzliche Bestimmungen in Ihrem Wohnsitzland dies nicht anders regeln.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">4. Datenaufbewahrung &amp; Datenschutz</h3>
              <p>Die Nutzung unseres Dienstes beinhaltet eine Datenverarbeitung, wie in unserer <strong>Datenschutzerklärung</strong> beschrieben. Indem Sie diesen Bedingungen zustimmen, stimmen Sie auch der<strong> Datenschutzerklärung</strong> zu. Bitte lesen Sie sie sorgfältig, um zu verstehen, wie wir Ihre Daten behandeln, wie lange wir diese speichern und welche Rechte Sie hinsichtlich der Löschung oder Einsicht Ihrer Daten haben. Unsere Datenschutzerklärung ist durch Verweis Bestandteil dieser Bedingungen.</p>
              <p><strong>Aufbewahrung &amp; Löschung von Daten:</strong> Wir bewahren personenbezogene Daten nur solange auf, wie es für die Zwecke notwendig ist oder gesetzlich vorgeschrieben wird. Hochgeladene Rechnungsdokumente werden <em>nur vorübergehend</em> zur Konvertierung gespeichert und anschließend gelöscht. Wir führen keine dauerhaften Archive mit Benutzerrechnungen.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">5. Eigentum an Inhalten &amp; Nutzungsrechte</h3>
              <p><strong>Eigentum an Benutzerinhalten:</strong> Sie behalten das Eigentum an allen Rechnungen oder Dokumenten, die Sie hochladen. Wir beanspruchen keine Rechte an Ihren Inhalten, die über das zum Betrieb des Dienstes notwendige Maß hinausgehen.</p>
              <p><strong>Lizenz zur Verarbeitung Ihrer Inhalte:</strong> Durch das Hochladen Ihrer Inhalte gewähren Sie uns eine beschränkte, widerrufliche, nicht-exklusive, gebührenfreie Lizenz zur Verarbeitung der Daten zur Konvertierung. Wir werden Ihre Inhalte nicht außerhalb des Dienstes nutzen oder weiterverbreiten.</p>
              <p><strong>Keine dauerhafte Speicherung:</strong> Die hochgeladenen Rechnungen werden nach kurzer Zeit gelöscht. Wir führen kein zentrales Archiv hochgeladener Dateien.</p>
              <p><strong>Verantwortung des Nutzers:</strong> Durch das Hochladen erklären Sie, dass Sie das Recht zur Verwendung dieser Inhalte besitzen und diese keine Gesetze oder Rechte Dritter verletzen. Bei Rechtsverletzungen durch Ihre Inhalte stellen Sie uns von entsprechenden Ansprüchen Dritter frei.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">6. Weitere rechtliche Klauseln</h3>
              <p><strong>Höhere Gewalt (Force Majeure):</strong> Wir haften nicht für Verzögerungen oder Ausfälle, die durch Umstände außerhalb unserer Kontrolle entstehen, wie Naturkatastrophen, Krieg, Terrorismus, Arbeitskämpfe oder behördliche Maßnahmen.</p>
              <p><strong>Regulatorische und rechtliche Compliance – Freistellung des Anbieters:</strong> Wir bieten lediglich ein Konvertierungstool an und übernehmen keine Haftung für Ihre Einhaltung lokaler Vorschriften. Sie erklären sich bereit, uns gegen Ansprüche Dritter freizustellen, die durch Ihre rechtswidrige Nutzung des Dienstes entstehen.</p>
              <p><strong>Geistige Eigentumsrechte:</strong> Die Plattform pdftoxrechnung.de und sämtliche Inhalte (mit Ausnahme Ihrer hochgeladenen Inhalte) sind durch geistige Eigentumsrechte geschützt. Sie dürfen diese nicht ohne vorherige schriftliche Zustimmung kopieren, verteilen oder verändern.</p>
              <p><strong>Salvatorische Klausel &amp; kein Verzicht:</strong> Sollte eine Bestimmung dieser Bedingungen unwirksam sein, bleiben die restlichen Klauseln in Kraft. Das Unterlassen der Durchsetzung einer Bestimmung stellt keinen Verzicht darauf dar.</p>
              <p><strong>Änderungen dieser Bedingungen:</strong> Wir können diese Bedingungen aktualisieren oder ändern. Wesentliche Änderungen werden auf der Website veröffentlicht; Ihre fortgesetzte Nutzung gilt als Zustimmung zu den geänderten Bedingungen.</p>
              <p><strong>Gesamte Vereinbarung &amp; Anwendbares Recht:</strong> Diese Bedingungen (plus Datenschutzerklärung) bilden die gesamte Vereinbarung zwischen Ihnen und uns. Es gilt deutsches Recht, sofern nicht zwingende Verbraucherschutzvorschriften in Ihrem Wohnsitzland etwas anderes vorsehen.</p>
          </div>
          <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-primary">Kontaktinformationen</h3>
              <p>Wenn Sie Fragen oder Bedenken zu diesen Bedingungen haben, kontaktieren Sie uns bitte unter: <strong>viktor.kreschenski@kretronik.com</strong>. Die aktuelle Geschäftsadresse und die Angaben zum Betreiber finden Sie oben.</p>
          </div>

        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Letztes Update: 17. April 2025</p>
      </div>
    </div>
  )
}

