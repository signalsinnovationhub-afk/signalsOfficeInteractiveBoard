# Full Srcreen Dashboard with Innovation Hub Quiz

<role>

Du bist ein Lead Frontend Developer und UX/UI-Experte für interaktive Installationen. Du bist darauf spezialisiert, moderne, hochperformante Web-Apps (im "Lovable Vibez"-Design) für große Touchscreens zu coden.

</role>

<context>

Wir bauen eine interaktive Quiz-Applikation für das Foyer unseres Innovation Hubs. Das Publikum reicht von zufälligen Besuchern bis hin zu Vorstandsmitgliedern. Die finalen 10 Fragen (Kahoot-Stil, 4 Antworten) binde ich unten ein. Die App soll autark auf einem großen Touchscreen laufen.

</context>

<task>

Entwickle den vollständigen Code für eine interaktive Single-Page-Application (SPA). Implementiere folgende exakte User Journey:

1. Idle/Start-Screen: Ein Screen mit einem großen, visuell ansprechenden "Quiz Starten" Button als Eyecatcher.

2. Onboarding: Nach Klick auf Start erfolgt die Aufforderung zur Eingabe eines Nicknames.

3. Quiz-Loop (Frage): Anzeige der aktuellen Frage mit großen Buttons für die 4 Antwortmöglichkeiten.

4. Auflösung & Aha-Moment: Direkt nach der Antwortauswahl gibt es visuelles Feedback (Richtig/Falsch) PLUS die Anzeige einer kurzen Erklärung (1-2 Sätze). Beziehe diesen Text aus dem Feld "Strategische Begründung" der übergebenen Daten. Darunter ein Button "Nächste Frage".

5. Auswertung: Nach 10 Fragen Anzeige der persönlichen Gesamtpunktzahl.

6. Rangliste: Eine Podestplatz-Ansicht für Platz 1 bis 3, Anzeige der Gesamtteilnehmerzahl und Einordnung des aktuellen Nutzers (z.B. "Du bist auf Platz 8 von 45").

</task>

<constraints>

- UI/UX-Zwang: Optimiere das Layout zwingend für große Touchscreens (riesige Tap-Targets für Buttons, klare Kontraste, keine Scrollbars).

- Nutze moderne Animationen für ein starkes visuelles Feedback ("Vibez"), besonders bei der Richtig/Falsch-Auflösung.

- Implementiere ein robustes State-Management für User, Score, aktuellen Quiz-Status und Leaderboard (nutze Mock-Daten für das Leaderboard zum Testen).

- Plane die Architektur der Komponenten und State-Übergänge im Vorfeld innerhalb von <thinking> Tags.

</constraints>

<input_data>

Frage;Antwort 1;Antwort 2;Antwort 3;Antwort 4;Korrekte Antwort (Zahl 1-4);Auflösung

"Das ""Last Exam of Humanity"" wurde Ende 2024 entwickelt – 2.500 extrem knifflige Fragen aus Mathe, Biologie, Geschichte und Logik, die KI damals NICHT lösen konnte. Wie viel Prozent davon lösen die führenden KI-Modelle heute?";"ca. 10 %";"ca. 25 %";"ca. 50 %";"ca. 85 %";3;"Innerhalb von nur 18 Monaten ist KI von 0 % auf 50 % gesprungen. Wahrscheinlich braucht es bald ein neues 'letztes Examen' – die Modelle nähern sich rasant der 100 %."

"Leo Tolstoi brauchte 7 Jahre, um ""Krieg und Frieden"" zu schreiben – 1.000 Seiten, rund 300.000 Token. Wie schnell und zu welchem Preis schafft eine moderne KI denselben Output?";"10 Minuten und 5 USD";"1 Stunde und 1 USD";"ca. 1 Minute und 15 Cent";"30 Sekunden, kostenlos";3;"15 Cent reichen. Die Inferenz-Kosten von KI sind innerhalb eines Jahres um Faktor 10 bis 100 gefallen – Text-Generierung ist praktisch kostenlos geworden."

"Wie viel investieren die großen Tech-Konzerne (Google, Microsoft, Amazon, Meta, Oracle & Co.) global PRO WERKTAG in neue KI-Datacenter?";"ca. 200 Millionen USD";"ca. 500 Millionen USD";"ca. 2 Milliarden USD";"ca. 10 Milliarden USD";3;"Zwei Milliarden – pro Werktag. Big Tech wird 2026 zusammen rund 790 Mrd. USD in Datacenter stecken. Das ist mehr als Manhattan-Projekt, Marshallplan, Apollo-Programm und Internationale Raumstation ZUSAMMEN gekostet haben."

"Wohin gehen aktuell 3 von 4 Dollar, die Unternehmen im B2B-Bereich für KI ausgeben?";"zu OpenAI (ChatGPT)";"zu Anthropic (Claude)";"zu Google (Gemini)";"zu Microsoft (Copilot)";2;"Anthropic dominiert den B2B-Markt – auch wenn ChatGPT bei Privatnutzern bekannter ist. Grund: Claude ist führend bei Coding, und Geschäftskunden sind deutlich loyaler als Privatnutzer."

"Tech-Konzerne haben in den letzten Jahren massenhaft Mitarbeiter entlassen. Was ist der HAUPTSÄCHLICHE Grund dafür?";"KI ersetzt Junior-Jobs";"Outsourcing nach Indien";"Zinswende + Corona-Overhiring";"Demografischer Wandel";3;"Nicht KI, sondern die Zinssteigerung von 0,25 % auf über 4 % plus massives Overhiring während Corona. Zusätzlich fließt Kapital jetzt in Datacenter statt in Gehälter – der CFO killt Jobs, nicht ChatGPT."

"Das Spitzenmodell ""Claude Sonnet"" von Anthropic kostet rund 15 USD pro 1 Mio. Output-Token. Was kostet ein vergleichbares Modell des chinesischen Anbieters DeepSeek?";"ca. 10 USD";"ca. 5 USD";"unter 1 USD";"gleicher Preis";3;"Weniger als 7 % des US-Preises. China destilliert westliche Modelle und bietet sie als 'Discount-Version' an. Resultat: China entwickelt sich zur globalen Token-Fabrik – das größte strategische Problem für US-Frontier-Labs."

"Wie groß ist der Anteil der WELTBEVÖLKERUNG, der heute aktiv für KI bezahlt?";"ca. 30 %";"ca. 10 %";"ca. 3 %";"ca. 0,3 %";4;"99,7 % zahlen NICHTS für KI. Wer für KI zahlt, ist automatisch im Top-1% der frühen Adopter weltweit. Riesiges Potenzial – und gleichzeitig das größte Marktrisiko für die KI-Konzerne."

"Wo werden rund 90 % der weltweit produzierten fortschrittlichen KI-Chips hergestellt?";"USA";"Südkorea";"Taiwan";"China";3;"Auf einer einzigen kleinen Insel. Damit hängt die gesamte globale KI-Infrastruktur an einem geopolitischen Hotspot. Europa hat in der Chip-Produktion praktisch keine Souveränität."

"Wegen der Flut an KI-generierter Musik hat Spotify eine bemerkenswerte Entscheidung getroffen. Welche?";"KI-Songs komplett verboten";"Extra-Gebühr für KI-Musik";"Siegel für menschliche Artists";"Eigene Tracking-Kategorie";3;"Spotify kennzeichnet jetzt MENSCHLICHE Künstler – nicht KI. Der Paradigmenwechsel: KI-Watermarks funktionieren nicht. Stattdessen muss der immer seltener werdende menschliche Content ausgezeichnet werden – wie ein Bio-Siegel."

"Wie hat sich die Halluzinationsrate (also das ""Erfinden"" falscher Fakten) bei den neuesten Reasoning-Modellen wie GPT-5.5, Claude Opus 4.7 oder Gemini 3 Pro entwickelt?";"Drastisch gesunken";"Konstant niedrig geblieben";"Sogar gestiegen";"Komplett verschwunden";3;"Kontraintuitiv: Reasoning-Modelle halluzinieren MEHR, nicht weniger. Im Mai 2026 lagen ALLE führenden Reasoning-Modelle bei über 10 % Halluzinationsrate. Sie 'wissen' mehr, raten aber auch häufiger."

</input_data>

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://signals-ki-board.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/819a609a-eaf4-4d5a-92c7-98761946662f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
