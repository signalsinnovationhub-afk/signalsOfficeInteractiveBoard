# KI-Quiz als HTML-Datei herunterladen

Im Admin-Bereich kommt ein Button „Quiz als HTML herunterladen“. Ergebnis: eine einzige `.html`-Datei, die lokal per Doppelklick läuft, ohne Internet, ohne Datenbank – zum Weitergeben per Mail/USB.

## Was die Datei enthält

- Alle aktuellen Fragen aus der Datenbank (Deutsch + Englisch, inkl. Erklärung und Quelle), direkt in die Datei eingebettet.
- Den kompletten Quiz-Ablauf: Sprachauswahl → Frage → Auflösung (Richtig/Falsch + Erklärung + Quelle) → Endergebnis → „Neues Spiel“.
- Das signals-Design: Schwarz/Gelb, Fan-Shapes, große Typo, gleiche Animationen-Anmutung.

## Was bewusst NICHT enthalten ist

- Kein Ranking / keine Rangliste, kein Nickname-Screen, kein Speichern von Ergebnissen.
- Keine Idle-/Countdown-Automatik und kein Auto-Exit (macht offline keinen Sinn).
- Kein Nachladen von Bildern aus dem Internet.

## Bilder offline verfügbar

Die Fragebilder werden beim Export heruntergeladen und **direkt in die HTML-Datei eingebettet** (als Base64-Data-URI). Damit sind sie auch ohne Internet sichtbar.

- Der Export lädt jedes Bild serverseitig, komprimiert wird nicht – das Original wird eingebettet.
- Die Datei wird dadurch größer (grob: Summe aller Bilder × 1,33). Bei sehr großen Bildern kann der Download einige Sekunden dauern; der Button zeigt während des Exports „Erstelle Datei …“.
- Schlägt ein einzelner Bild-Download fehl, bleibt der Bildbereich für diese Frage leer, der Export läuft aber durch.


## Responsives Verhalten

Die Export-Version nutzt **nicht** die feste 1920×1080-Bühne des Displays, sondern ein flüssiges Layout:

- Schriftgrößen über `clamp()`, Abstände relativ.
- Antworten: 2 Spalten auf Desktop/Tablet, 1 Spalte auf dem Handy.
- Volle Höhe (`100dvh`), Touch-taugliche große Buttons, funktioniert im Hoch- und Querformat.
- Optional zusätzlich ein Vollbild-Button (Fullscreen-API) für Präsentationen.

## Technische Umsetzung

- Neue Server-Funktion `exportQuizHtml` (in `src/lib/quiz-export.functions.ts`), geschützt mit `requireSupabaseAuth` + Admin-Rollencheck (wie `isAdmin` in `questions.functions.ts`).
- Sie lädt die Fragen über die bestehende Logik und rendert eine **eigenständige HTML-Vorlage** als String: Inline-`<style>`, Inline-`<script>` in Vanilla-JS, Fragen als JSON-Literal. Kein React, kein Build-Schritt, keine externen Requests.
- Die Quiz-Texte (i18n-Strings aus `src/lib/quiz/i18n.ts`, ohne Ranking-Teile) werden in die Vorlage übernommen, damit DE/EN weiter funktioniert.
- Der Fragen-Mischalgorithmus (Fragen + Antworten shufflen) wird in der Vorlage als kleine JS-Funktion nachgebaut.
- Im Admin (`SettingsTab.tsx`, Bereich „Einstellungen“) neuer Button: ruft die Server-Funktion auf, erzeugt aus dem zurückgegebenen HTML einen Blob und lädt ihn als `signals-ki-quiz.html` herunter (Dateiname mit Datum).
- Bestehende Quiz-Komponenten und die Display-Logik bleiben unverändert.

## Prüfung

Export einmal erzeugen und die Datei im Browser bei Desktop-Breite und Handy-Breite (375 px) durchklicken: Sprachwahl, alle Fragen, Auflösung, Endergebnis, Neustart.
