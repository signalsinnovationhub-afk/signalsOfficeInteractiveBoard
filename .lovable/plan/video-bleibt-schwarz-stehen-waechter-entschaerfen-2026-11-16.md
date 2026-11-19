# Video bleibt schwarz stehen – Waechter entschaerfen

## Vermutete Ursache (noch nicht bestaetigt)
Der neue Waechter im Video unten rechts kann sich selbst blockieren: Nach einem Neuladen beginnt das Video bei 0 und braucht Zeit zum Laden. Der Waechter misst in dieser Zeit "kein Fortschritt", springt vor oder laedt erneut – das Video kommt nie ins Laufen und bleibt schwarz. Zusaetzlich kann ein Ladefehler wiederholt Neuladen ausloesen.

## Loesung
1. Waechter greift nur, wenn das Video wirklich spielbereit ist (genug geladen). Waehrend es noch laedt, wird gewartet statt eingegriffen.
2. Nach einem Neuladen gibt es eine Schonfrist (ca. 15 Sek.), in der nicht erneut eingegriffen wird.
3. Neuladen hoechstens alle 30 Sek., mit zunehmender Wartezeit bei wiederholten Fehlern – keine Endlosschleife.
4. Als letzte Stufe wird das Video-Element komplett neu aufgebaut (frische Verbindung zur Videodatei), statt nur neu zu laden.
5. Vorschaubild bleibt sichtbar, solange kein Bild da ist, damit nie eine reine schwarze Flaeche entsteht.

## Pruefung
In der Vorschau: normales Abspielen, simuliertes Einfrieren, simulierter Ladefehler und langsames Laden – Video laeuft jedes Mal wieder an, kein Dauer-Schwarz.

## Technische Details
- Nur `src/components/dashboard/MediaVideoTile.tsx`.
- `check()` ueberspringt bei `readyState < 3` oder `seeking`; Zeitstempel `lastRecoveryAt` fuer Grace/Backoff.
- Stufe 3: `key`-Wechsel am `<video>` plus Cache-Buster-Query an `src`.
