import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listQuestions, type DbQuestion } from "@/lib/questions.functions";
import {
  listArchivedQuestions,
  restoreArchivedQuestion,
  deleteArchivedQuestion,
  type ArchivedQuestion,
} from "@/lib/question-archive.functions";

export function ArchiveTab() {
  const fetchArchive = useServerFn(listArchivedQuestions);
  const fetchQuestions = useServerFn(listQuestions);
  const restore = useServerFn(restoreArchivedQuestion);
  const remove = useServerFn(deleteArchivedQuestion);

  const [items, setItems] = useState<ArchivedQuestion[]>([]);
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [target, setTarget] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const [a, q] = await Promise.all([fetchArchive(), fetchQuestions()]);
    setItems(a);
    setQuestions(q);
  }

  useEffect(() => {
    reload()
      .catch((e) => setErr(e instanceof Error ? e.message : "Fehler"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRestore(item: ArchivedQuestion) {
    const targetId = target[item.id] ?? item.question_id ?? questions[0]?.id;
    if (!targetId) return;
    setBusyId(item.id);
    setErr(null);
    setNote(null);
    try {
      await restore({ data: { archiveId: item.id, targetQuestionId: targetId } });
      await reload();
      setNote("Frage wiederhergestellt.");
      setTimeout(() => setNote(null), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Wiederherstellen fehlgeschlagen");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: ArchivedQuestion) {
    setBusyId(item.id);
    setErr(null);
    try {
      await remove({ data: { id: item.id } });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-muted-foreground">Lädt…</p>;

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold">Fragen-Archiv</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Jedes Mal, wenn eine Frage gespeichert und damit überschrieben wird, landet
          die vorherige Version hier. Alte Fragen können jederzeit angesehen und in
          eine bestehende Frage zurückgespielt (recycelt) werden.
        </p>
      </div>

      {err && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          {err}
        </p>
      )}
      {note && <p className="text-sm text-green-600">{note}</p>}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine archivierten Versionen vorhanden.
        </p>
      )}

      {items.map((item) => (
        <section
          key={item.id}
          className="bg-card border border-border rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.position ? `Frage ${item.position} · ` : ""}
              archiviert am{" "}
              {new Date(item.archived_at).toLocaleString("de-DE")}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={target[item.id] ?? item.question_id ?? ""}
                onChange={(e) =>
                  setTarget((t) => ({ ...t, [item.id]: e.target.value }))
                }
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">Ziel-Frage wählen…</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    Frage {q.position}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRestore(item)}
                disabled={busyId === item.id}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {busyId === item.id ? "…" : "Wiederherstellen"}
              </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={busyId === item.id}
                className="h-9 px-3 rounded-md border border-border text-sm disabled:opacity-50"
              >
                Löschen
              </button>
            </div>
          </div>

          <p className="text-sm font-medium">{item.question}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {item.answers.map((a, i) => (
              <li key={i} className={i === item.correct ? "text-green-600" : ""}>
                {String.fromCharCode(65 + i)}. {a}
                {i === item.correct ? " ✓" : ""}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {item.explanation}
          </p>
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              className="max-h-40 rounded border border-border"
              loading="lazy"
            />
          )}
          {item.source && (
            <p className="text-xs text-muted-foreground break-all">
              Quelle: {item.source}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
