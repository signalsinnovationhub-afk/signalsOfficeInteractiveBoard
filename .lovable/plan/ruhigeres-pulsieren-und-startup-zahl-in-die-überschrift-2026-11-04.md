# Ruhigeres Pulsieren und Startup-Zahl in die Überschrift

- Der Hinweis „👆 Startups entdecken“ pulsiert deutlich langsamer und sanfter. Ein Durchlauf dauert etwa 4 Sekunden, und er wird dabei nur leicht durchsichtig statt fast unsichtbar.
- Das kleine Banner mit der Startup-Anzahl unten rechts im Bild entfällt, sowohl in der Diashow als auch auf den Titelseiten der Kategorien.
- Die Zahl steht stattdessen oben vor der Überschrift, zum Beispiel „9 STARTUPS“. Farbe, Stil und Größe bleiben wie bei der bisherigen Überschrift. In der Diashow wechselt die Zahl mit jedem Bild.

## Technische Details
- Nur `src/components/dashboard/StartupTile.tsx` und `src/styles.css`.
- Neue Keyframe-Animation `pulse-soft` mit Deckkraft von 1 bis 0,55, 4 s, ease-in-out, endlos. Sie ersetzt `animate-pulse` am Hinweis.
- Das Zähler-Badge in `CategoryVisual` wird entfernt.
- Überschrift in der Diashow: `{categories[slideIdx].entries.length} Startups`. Auf den Titelseiten: `{visual.count} Startups`.
