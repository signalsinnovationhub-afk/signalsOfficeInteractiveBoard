import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getSettings,
  updateSettings,
  type AppSettings,
} from "@/lib/settings.functions";
import { exportQuizHtml } from "@/lib/quiz-export.functions";

export function SettingsTab() {
  const fetchSettings = useServerFn(getSettings);
  const save = useServerFn(updateSettings);
  const runExport = useServerFn(exportQuizHtml);

  const [values, setValues] = useState<AppSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportInfo, setExportInfo] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setErr(null);
    setExportInfo(null);
    try {
      const res = await runExport();
      const blob = new Blob([res.html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `signals-ki-quiz-${date}.html`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      const mb = res.bytes / 1_000_000;
      const parts = [
        `${res.imagesEmbedded} Bild${res.imagesEmbedded === 1 ? "" : "er"} eingebettet`,
        `${mb.toFixed(1)} MB`,
      ];
      if (res.imagesSkipped > 0) {
        parts.push(`${res.imagesSkipped} zu groß und übersprungen`);
      }
      if (mb > 20) {
        parts.push("Achtung: sehr groß, kann auf Handys nicht laden");
      }
      setExportInfo(`Heruntergeladen (${parts.join(", ")})`);
      setTimeout(() => setExportInfo(null), 12000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export fehlgeschlagen");
    } finally {
      setExporting(false);
    }
  }


  useEffect(() => {
    fetchSettings()
      .then(setValues)
      .catch((e) => setErr(e instanceof Error ? e.message : "Fehler"));
  }, [fetchSettings]);

  if (!values) return <p className="text-muted-foreground">Lädt…</p>;

  async function handleSave() {
    if (!values) return;
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      await save({ data: values });
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  function field(
    key: keyof AppSettings,
    label: string,
    hint: string,
    min: number,
    max: number,
  ) {
    const v = values![key] as number;
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          value={v}
          onChange={(e) =>
            setValues({ ...values!, [key]: Number(e.target.value) })
          }
          className="w-32 h-10 px-3 rounded-md border border-input bg-background"
        />
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {err && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          {err}
        </p>
      )}

      {field(
        "quiz_idle_timeout_sec",
        "Inaktivitäts-Timeout (Sekunden)",
        "Nach so vielen Sekunden ohne Interaktion springt das Quiz zurück ins Menü. (15–300)",
        15,
        300,
      )}
      {field(
        "quiz_countdown_sec",
        "Countdown-Vorwarnung (Sekunden)",
        "In den letzten n Sekunden vor dem Rücksprung wird die Uhr eingeblendet. (3–60)",
        3,
        60,
      )}
      {field(
        "quiz_finish_return_sec",
        "Auto-Return nach Quiz-Ende (Sekunden)",
        "Wie lange Score- und Ranglisten-Screen sichtbar bleiben, bevor das Menü zurückkehrt. (3–60)",
        3,
        60,
      )}

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={values.quiz_shuffle_enabled}
            onChange={(e) =>
              setValues({ ...values!, quiz_shuffle_enabled: e.target.checked })
            }
            className="h-4 w-4"
          />
          Fragen &amp; Antworten zufällig anordnen
        </label>
        <p className="text-xs text-muted-foreground">
          Wenn aktiviert, werden Fragen und Antworten beim Quizstart zufällig
          gemischt. Andernfalls erscheinen sie in der festen Reihenfolge.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={busy}
          className="h-10 px-5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {busy ? "Speichere…" : "Einstellungen speichern"}
        </button>
        {ok && <span className="text-sm text-green-600">Gespeichert ✓</span>}
      </div>

      <div className="pt-6 border-t border-border space-y-2">
        <h2 className="text-sm font-medium">Quiz offline weitergeben</h2>
        <p className="text-xs text-muted-foreground">
          Lädt das komplette KI-Quiz als einzelne HTML-Datei herunter – inklusive
          aller Fragen, Übersetzungen und Bilder (eingebettet). Läuft lokal per
          Doppelklick, ohne Internet. Ohne Rangliste.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="h-10 px-5 rounded-md border border-border font-medium disabled:opacity-50"
          >
            {exporting ? "Erstelle Datei…" : "Quiz als HTML herunterladen"}
          </button>
          {exportInfo && (
            <span className="text-sm text-green-600">{exportInfo}</span>
          )}
        </div>
        <div className="rounded-md bg-muted/50 border border-border p-3 space-y-1">
          <p className="text-xs font-medium">Auf iPhone / iPad öffnen</p>
          <p className="text-xs text-muted-foreground">
            Die Vorschau der Dateien-App führt kein JavaScript aus – dort bleibt
            das Quiz leer. Datei in der Dateien-App antippen, dann
            <strong> Teilen-Symbol → „In Safari öffnen“</strong>. Am Computer
            genügt ein Doppelklick.
          </p>
        </div>
      </div>

    </div>
  );
}
