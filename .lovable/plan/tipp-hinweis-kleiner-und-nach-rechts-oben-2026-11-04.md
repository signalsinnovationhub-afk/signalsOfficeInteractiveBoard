# Tipp-Hinweis kleiner und nach rechts oben

- Der Hinweis „👆 Tippen, um die Startups zu entdecken“ bekommt dieselbe kleine Schrift wie die Startup-Anzahl unten rechts. Schwarzer Grund und gelbe Schrift bleiben gleich (Schriftgröße 10 px, fett, wenig Innenabstand).
- Er wandert in die rechte obere Ecke des Bildes, gegenüber der gelben Kategorie-Box.
- Das sanfte Pulsieren bleibt erhalten, damit er weiter auffällt.

## Technische Details
- Nur `src/components/dashboard/StartupTile.tsx`, im Hinweis-Overlay der Diashow.
- Positionierung `absolute top-0 right-0`. Stil: `bg-signals-black text-signals-yellow font-bold text-[10px] px-1.5 py-0.5`, dazu weiterhin `animate-pulse-yellow`.
