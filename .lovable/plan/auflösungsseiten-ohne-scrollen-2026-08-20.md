# Auflösungsseiten ohne Scrollen

## Ziel
Auf den Auflösungsscreens (Erklärungsbox) soll kein Scrollen nötig sein – auch bei langen Erklärungstexten. Der Text passt sich automatisch an den verfügbaren Platz an.

## Vorgehen
- Automatische Textanpassung ("Auto-Fit"): Der Erklärungstext wird nach dem Rendern gemessen und die Schriftgröße stufenweise verkleinert, bis der Inhalt vollständig in die Box passt (Untergrenze ca. 0.85rem, damit es lesbar bleibt).
- Neuberechnung bei Fensterwechsel/Größenänderung und bei jedem Fragenwechsel.
- Innenabstände der Erklärungsbox werden bei langen Texten leicht reduziert, bevor die Schrift schrumpft.
- Scrollen wird als Sicherheitsnetz erst dann aktiv, wenn selbst die Mindestschriftgröße nicht mehr reicht (Desktop somit praktisch nie).
- Gleiche Logik im Offline-HTML-Export, damit App und Export identisch aussehen.
- Layout, Bildposition, Header und Abstände bleiben unverändert (einheitlich für alle Fragen).

## Technische Details
- `src/components/quiz/RevealScreen.tsx`: neuer Hook/Effekt mit `ResizeObserver`, der über `scrollHeight` vs. `clientHeight` iterativ eine `fontSize` (inline style) sucht; `overflow-auto` bleibt als Fallback, statt fester `clamp()`-Größe wird der berechnete Wert gesetzt.
- Mobile (Portrait) behält Scrollverhalten als Fallback, da dort der Platz stark begrenzt ist.
- `src/lib/quiz-export.template.ts`: gleiche Auto-Fit-Funktion in Vanilla JS für `.rv-expl`, aufgerufen beim Anzeigen des Reveal-Screens und bei `resize`.
