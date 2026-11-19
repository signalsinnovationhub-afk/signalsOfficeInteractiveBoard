# Video auf dem Samsung-Fernseher wird schwarz

## Befund
Die Videodatei unten rechts ist sehr gross: knapp 500 MB fuer gut 4 Minuten, Full-HD mit hoher Datenrate (ca. 16 Mbit/s) und Tonspur. Am Laptop ist das kein Problem. Der eingebaute Samsung-Browser hat aber sehr wenig Speicher: Er versucht, das Video vorzuladen, laeuft nach 1-2 Minuten voll und schaltet die Videowiedergabe ab. Dann bleibt die Kachel schwarz und nur Neuladen hilft. Das passt genau zu deinem Fehlerbild (nur Fernseher, nur das Video, nach 1-2 Minuten).

Meine letzten beiden Aenderungen haben das nicht behoben, weil die eigentliche Ursache die Dateigroesse ist.

## Loesung
1. **Schlanke Fassung des Videos erzeugen:** gleiches Video, aber ca. 1280x720, deutlich niedrigere Datenrate, ohne Ton (laeuft ohnehin stumm), fuer schnelles Streamen optimiert. Ziel: etwa 40-60 MB statt 500 MB. Sichtbar ist der Unterschied auf der Kachelgroesse praktisch nicht.
2. Die schlanke Fassung hochladen und im Video-Slot unten rechts eintragen. Das Original bleibt gespeichert.
3. **Weniger vorladen:** Der Browser laedt nur noch das, was er gerade braucht, statt die ganze Datei auf Vorrat.
4. **Schutz bei Ausfall:** Meldet der Fernseher einen Wiedergabefehler, wird das Video automatisch frisch gestartet (bisher mit langer Wartezeit, kuenftig nach wenigen Sekunden), damit es nicht dauerhaft schwarz bleibt.
5. **Hinweis im Admin** beim Video-Upload: empfohlene Groesse (720p, unter ca. 100 MB) und Warnung, wenn eine hochgeladene Datei deutlich groesser ist.

## Pruefung
Neue Datei auf Format und Groesse pruefen. In der Vorschau mehrere Minuten laufen lassen. Am Fernseher kann ich nicht testen – das musst du danach einmal ein paar Minuten beobachten.

## Technische Details
- Umwandlung mit ffmpeg: H.264 Main, 1280x720, CRF ca. 26 / maxrate 2.5M, `-an`, `-movflags +faststart`. Upload in den Storage-Bucket `media`, `media_tiles.storage_path` (Slot `bottom`) per Migration/Update umstellen.
- `MediaVideoTile.tsx`: `preload="metadata"`; Fehler-Remount nach ca. 3 s mit begrenztem Backoff.
- `MediaTab.tsx`: Dateigroessen-Warnung beim Upload.
