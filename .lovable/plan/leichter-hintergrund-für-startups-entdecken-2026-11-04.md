# Leichter Hintergrund für „Startups entdecken“

- Der Hinweis bekommt einen sehr durchsichtigen dunklen Hintergrund (etwa 25 % Schwarz). So bleiben weiße Schrift und Rand auch auf hellen Bildern lesbar, und das Bild schimmert weiter durch.
- Position, Form, Schrift und das ruhige Pulsieren bleiben unverändert.

## Technische Details
- Nur `src/components/dashboard/StartupTile.tsx`: Am Hinweis wird `bg-transparent` durch `bg-signals-black/25` ersetzt. Ohne Blur, damit es auf dem Smartboard sauber aussieht.
