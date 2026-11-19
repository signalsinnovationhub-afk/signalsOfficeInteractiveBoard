# Video unten rechts bleibt nicht mehr haengen

## Problem
Das Video friert manchmal an einer Stelle ein. Die bisherige Absicherung startet das Video nur neu, wenn es als "pausiert" gilt. Friert es ein, waehrend der Browser glaubt, es laeuft noch (z. B. nach einem Ladefehler beim Nachladen), passiert nichts.

## Loesung
Ein "Waechter" prueft alle paar Sekunden, ob sich das Video wirklich weiterbewegt:
1. Bewegt sich das Bild ca. 6 Sekunden lang nicht, springt das Video ein kleines Stueck weiter und spielt weiter.
2. Hilft das nicht, wird das Video komplett neu geladen und an derselben Stelle fortgesetzt (bzw. von vorne, falls das nicht geht).
3. Bei einem Ladefehler des Videos wird es nach kurzer Pause automatisch neu geladen.
4. Waehrend das Quiz offen ist (Video absichtlich pausiert), greift der Waechter nicht.

Der Rest (Aussehen, Endlosschleife, ohne Ton) bleibt unveraendert.

## Technische Details
- Nur `src/components/dashboard/MediaVideoTile.tsx`.
- Intervall vergleicht `currentTime` mit dem letzten Wert; zusaetzlich Listener fuer `waiting`, `error`, `ended` (Fallback, falls `loop` versagt).
- Stufe 1: `currentTime += 0.5` + `play()`; Stufe 2: `load()` + Zeit wiederherstellen + `play()`.
- Pruefung in der Vorschau: Video laeuft weiter, simuliertes Einfrieren wird erkannt und behoben.
