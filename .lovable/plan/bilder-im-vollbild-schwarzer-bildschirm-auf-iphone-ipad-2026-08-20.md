# Bilder im Vollbild + schwarzer Bildschirm auf iPhone/iPad

## 1. Bilder aufklappen (Vollbild)

Im Auflösungs-Screen der exportierten HTML-Datei wird das Bild antippbar:

- Tap/Klick auf das Bild öffnet ein Vollbild-Overlay (schwarzer Hintergrund, Bild `object-fit: contain`, Pinch-Zoom erlaubt).
- Schließen per Tap auf den Hintergrund, ✕-Button oben rechts und `Esc`.
- Kleiner Hinweis am Bild: „Zum Vergrößern tippen“ / „Tap to enlarge“ (DE/EN über die vorhandene i18n-Struktur der Vorlage).
- Dieselbe Vollbild-Ansicht kommt auch ins Live-Quiz (`RevealScreen.tsx`), damit App und Export gleich funktionieren.

## 2. Schwarzer Bildschirm mit nur dem Vollbild-Button

Das Symptom ist eindeutig: Der schwarze Hintergrund und der Vollbild-Button sind statisches HTML/CSS — sie erscheinen immer. Der gesamte Quiz-Inhalt wird dagegen erst per JavaScript in den leeren `#app`-Container geschrieben. Bleibt alles andere schwarz, heißt das: **das JavaScript läuft nicht.**

Auf iPhone/iPad passiert das, wenn die Datei aus der Dateien-App bzw. aus Mail/WhatsApp in der iOS-Vorschau (Quick Look) geöffnet wird. Diese Vorschau zeigt HTML und CSS an, führt aber kein JavaScript aus. Erst „Teilen → In Safari öffnen“ startet eine echte Browser-Umgebung.

### Maßnahmen

1. **Statischer Startbildschirm statt schwarzer Fläche.** Die Sprachauswahl wird direkt als HTML in die Datei geschrieben (nicht per JS erzeugt). Damit sieht man auf jedem Gerät sofort Inhalt statt Schwarz.
2. **Klarer Hinweis, wenn JS nicht läuft.** Ein sichtbarer Hinweisblock plus `<noscript>`: „Diese Datei muss in Safari geöffnet werden: Teilen-Symbol → In Safari öffnen.“ Sobald JavaScript läuft, entfernt das Skript diesen Hinweis in der ersten Zeile — er ist also nur sichtbar, wenn es wirklich ein Problem gibt.
3. **iOS-Fallback ohne JS-Interaktion vermeidbar machen:** keine Abhängigkeit von Fullscreen-API (auf iPhone nicht verfügbar) — der Vollbild-Button wird ausgeblendet, wenn die API fehlt, damit er nicht als einziges Element sichtbar ist.
4. **Zweite mögliche Ursache absichern (Dateigröße).** Alle Bilder liegen als Base64 in der Datei; sehr große Dateien kann mobiles Safari beim Laden abbrechen. Der Export bekommt deshalb ein Größenlimit pro Bild und zeigt im Admin die tatsächliche Dateigröße mit Warnung, wenn sie für Mobilgeräte kritisch ist.
5. **Kurzanleitung im Admin** direkt unter dem Download-Button: iPhone/iPad → Dateien-App → Datei antippen → Teilen → In Safari öffnen.

### Prüfung

Neuen Export erzeugen, Dateigröße prüfen und die Datei in einem mobilen Viewport (375 px) durchklicken: Sprachwahl → Frage → Auflösung → Bild-Vollbild → Ergebnis → Neues Spiel.

## Technische Details

- `src/lib/quiz-export.template.ts`: Sprachauswahl als statisches Markup im `#app`-Container vorrendern; Hinweisbanner + `<noscript>`; Lightbox-Overlay (Markup, CSS, Handler, `role="button"`/`aria-label` am Bild); Vollbild-Button nur bei vorhandener Fullscreen-API einblenden.
- `src/lib/quiz-export.functions.ts`: Größenlimit pro Bild, Rückgabe um `bytes` und übersprungene Bilder erweitern.
- `src/components/admin/SettingsTab.tsx`: Dateigröße, Warnhinweis und iOS-Anleitung anzeigen.
- `src/components/quiz/RevealScreen.tsx`: gleiche Vollbild-Bildansicht im laufenden Quiz.
