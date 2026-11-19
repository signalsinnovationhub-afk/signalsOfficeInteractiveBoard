# Dashboard-Umbau: Quiz/Ranking zusammenlegen + Startup-Kachel

## 1) Oben rechts: Quiz und Ranking in einer Kachel

- Neue Komponente `QuizRankingTile`, die zwischen zwei Ansichten rotiert:
  - Ansicht A: bestehende `QuizTile` („KI Quiz" + „Jetzt starten")
  - Ansicht B: bestehende `RankingTile` (Podium „Allzeit Top 3")
- Automatischer Wechsel alle 10 Sekunden mit sanfter Überblendung (Opacity-Crossfade, beide Ansichten übereinander gestapelt).
- Klick auf die Quiz-Ansicht startet weiterhin das Quiz; Klick auf die Ranking-Ansicht öffnet weiterhin das Gesamt-Ranking. Während das Quiz läuft, stoppt die Rotation und die Kachel zeigt den Quiz-Flow wie bisher.
- Das separate Ranking-Feld unten links wird entfernt.

## 2) Unten links: Startups aus der Datenbank

- Neue Datenquelle: Serverfunktion `listInvestments` liest `Kategorie, Unternehmen, Kurzbeschreibung, Beschreibung, Investiert_in, Fonds, Website_URL` aus `investments`, sortiert nach Firmenname.
- Neue Komponente `StartupTile` zeigt immer einen Startup als Karte auf hellem Grund:
  - oben klein die Kategorie
  - Firmenname groß als Überschrift
  - `Kurzbeschreibung` in einem gelb hinterlegten Block (signals-Gelb)
  - darunter „Beschreibung:" + `Beschreibung`
  - rechts eine kompakte Infobox mit „Investiert in: {Investiert_in}", „Fonds: {Fonds}" und Link „zur Website" (neuer Tab). Fehlt `Website_URL`, wird kein Link gerendert.
- Automatische Rotation alle 8 Sekunden, dazu Pfeil-Buttons (← →) für manuelles Blättern. Manuelles Blättern setzt den Auto-Timer zurück.
- Sanfte Überblendung beim Kartenwechsel, Textlängen werden begrenzt/geklemmt, damit die Kachel nie scrollt.

## Layout & Stil

- 2×2-Vollbild-Raster bleibt: oben links News (unverändert), oben rechts Quiz/Ranking, unten links Startups, unten rechts Event-Video/Foto (unverändert).
- Gelb/Schwarz-Branding, gleiche Typo und Kachel-Optik wie die übrigen Kacheln; keine Blur-Effekte (Smartboard-Kompatibilität).

## Technische Details

- Neue Dateien: `src/lib/investments.functions.ts`, `src/components/dashboard/StartupTile.tsx`, `src/components/dashboard/QuizRankingTile.tsx`.
- Anpassung: `src/routes/index.tsx` (Kachel-Zuordnung im Raster).
- Datenabruf über `useServerFn` + `useQuery` (analog zu Media/Settings), Rotation über Intervall-Timer mit Cleanup.
- `QuizTile` und `RankingTile` bleiben unverändert und werden nur innerhalb der neuen Rotationskachel verwendet.
