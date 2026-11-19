# Tipp-Hinweis als Pille links unten

- Der Text wird auf „👆 Startups entdecken“ gekürzt.
- Der Hinweis sitzt links unten im Bild, mit etwas Abstand zum Rand.
- Die Form gleicht der Quellenangabe bei den News: abgerundete Pille mit dünnem weißen Rand, weiße Schrift und durchsichtiger Hintergrund.
- Das sanfte Pulsieren bleibt.

## Technische Details
- Nur `src/components/dashboard/StartupTile.tsx`, im Hinweis-Overlay der Diashow.
- Position: `absolute left-[4%] bottom-[5%]`.
- Stil wie die News-Quellen-Pille: `rounded-full border border-signals-white text-signals-white bg-transparent font-bold text-xs px-3 py-1`.
- Kein Blur, damit es auf dem Smartboard sauber dargestellt wird.
