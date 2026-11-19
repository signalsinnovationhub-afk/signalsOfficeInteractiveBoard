import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listResults,
  deleteResult,
  resetResults,
  type QuizResult,
} from "@/lib/results.functions";

export function RankingTab() {
  const fetchList = useServerFn(listResults);
  const remove = useServerFn(deleteResult);
  const reset = useServerFn(resetResults);

  const [rows, setRows] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function load() {
    setLoading(true);
    fetchList()
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Fehler"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [fetchList]);

  async function handleDelete(id: string) {
    try {
      await remove({ data: { id } });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  async function handleReset() {
    try {
      await reset();
      setRows([]);
      setConfirmReset(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Zurücksetzen fehlgeschlagen");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} Ergebnisse (max. 500 angezeigt)
        </p>
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-destructive">Sicher?</span>
            <button
              onClick={handleReset}
              className="h-9 px-3 rounded-md bg-destructive text-destructive-foreground text-sm"
            >
              Ja, alles löschen
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="h-9 px-3 rounded-md border border-border text-sm"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="h-9 px-3 rounded-md border border-destructive text-destructive text-sm"
          >
            Alle Ergebnisse zurücksetzen
          </button>
        )}
      </div>

      {err && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          {err}
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground">Lädt…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Noch keine Teilnahmen.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Nickname</th>
                <th className="text-left px-4 py-2 font-medium">Score</th>
                <th className="text-left px-4 py-2 font-medium">Wann</th>
                <th className="text-right px-4 py-2 font-medium">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{r.nickname}</td>
                  <td className="px-4 py-2 tabular-nums">
                    {r.score}/{r.total}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("de-DE")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-destructive hover:underline text-sm"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
