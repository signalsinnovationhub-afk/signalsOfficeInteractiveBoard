# Startup-Kachel: Diashow als Startbildschirm

## Verhalten
- Beim Laden zeigt die Startup-Kachel nicht mehr die Kategorieübersicht. Stattdessen läuft eine Diashow durch **alle** Kategorie-Titelbilder in alphabetischer Reihenfolge (Bild und gelbe Kategorie-Box wie heute). Nach der letzten Kategorie beginnt sie wieder von vorn.
- Wechsel alle **3 Sekunden** mit sanfter Überblendung.
- Ein Tippen auf die Diashow öffnet die gerade gezeigte Kategorie. Danach funktioniert die Navigation wie bisher (Pfeile, Haus zur Übersicht, Pfeil zurück zur Titelseite).
- Sobald jemand die Kachel berührt, stoppt die Diashow.
- Nach **30 Sekunden ohne Berührung** springt die Kachel automatisch zurück in die Diashow.
- In der Diashow steht oben „Startups“. Über das Haus-Symbol kommt man jederzeit direkt zur Kategorieübersicht.

## Technische Details
- Betrifft nur `src/components/dashboard/StartupTile.tsx`.
- Neuer Zustand `mode: "slideshow" | "overview" | "pages"`. Der Startwert ist `"slideshow"`. Die Diashow nutzt alle Einträge aus `categories` und das vorhandene `CategoryVisual` (cover).
- Ein Intervall von 3 s läuft nur im Diashow-Modus und wird beim Verlassen aufgeräumt.
- Für die Inaktivität gibt es einen Timer, der nur auf `pointerdown` im Kachel-Container hört. So setzen Bedienungen im Quiz oder bei den News den Startup-Timer nicht zurück. Nach 30 s geht die Kachel zurück in die Diashow.
