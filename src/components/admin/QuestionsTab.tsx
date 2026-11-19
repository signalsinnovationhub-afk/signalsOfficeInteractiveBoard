import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  listQuestions,
  updateQuestion,
  seedDefaultQuestions,
  type DbQuestion,
} from "@/lib/questions.functions";

export function QuestionsTab() {
  const fetchList = useServerFn(listQuestions);
  const saveQuestion = useServerFn(updateQuestion);
  const seedQuestions = useServerFn(seedDefaultQuestions);

  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [savedAll, setSavedAll] = useState(false);

  async function handleSaveAll() {
    setSavingAll(true);
    setErr(null);
    setSavedAll(false);
    try {
      for (const q of questions) {
        await saveQuestion({
          data: {
            id: q.id,
            question: q.question,
            answers: q.answers,
            correct: q.correct,
            explanation: q.explanation,
            source: q.source ?? null,
            image_url: q.image_url ?? null,
            question_en: q.question_en ?? null,
            answers_en: q.answers_en ?? null,
            explanation_en: q.explanation_en ?? null,
            source_en: q.source_en ?? null,
          },
        });
      }
      setSavedAll(true);
      setTimeout(() => setSavedAll(false), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSavingAll(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setErr(null);
    try {
      await seedQuestions();
      const list = await fetchList();
      setQuestions(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Standardfragen konnten nicht geladen werden");
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => {
    fetchList()
      .then((list) => setQuestions(list))
      .catch((e) => setErr(e instanceof Error ? e.message : "Fehler"))
      .finally(() => setLoading(false));
  }, [fetchList]);

  function updateLocal(id: string, patch: Partial<DbQuestion>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  async function handleSave(q: DbQuestion) {
    setSavingId(q.id);
    setErr(null);
    setSavedId(null);
    try {
      await saveQuestion({
        data: {
          id: q.id,
          question: q.question,
          answers: q.answers,
          correct: q.correct,
          explanation: q.explanation,
          source: q.source ?? null,
          image_url: q.image_url ?? null,
          question_en: q.question_en ?? null,
          answers_en: q.answers_en ?? null,
          explanation_en: q.explanation_en ?? null,
          source_en: q.source_en ?? null,
        },
      });
      setSavedId(q.id);
      setTimeout(() => setSavedId((s) => (s === q.id ? null : s)), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSavingId(null);
    }
  }

  async function handleImageUpload(q: DbQuestion, file: File) {
    setErr(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `questions/${q.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      updateLocal(q.id, { image_url: data.publicUrl });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bild-Upload fehlgeschlagen");
    }
  }

  if (loading) return <p className="text-muted-foreground">Lädt…</p>;

  return (
    <div className="space-y-6">
      {err && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          {err}
        </p>
      )}
      {questions.length > 0 && (
        <div className="sticky top-0 z-10 -mx-2 px-2 py-3 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {questions.length} Frage{questions.length === 1 ? "" : "n"}
          </span>
          <div className="flex items-center gap-3">
            {savedAll && (
              <span className="text-sm text-green-600">Alle gespeichert ✓</span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={savingAll}
              className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {savingAll ? "Speichere alle…" : "Alle speichern"}
            </button>
          </div>
        </div>
      )}
      {questions.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <h2 className="text-lg font-semibold">Keine Fragen vorhanden</h2>
          <p className="text-sm text-muted-foreground">
            Die Fragen-Datenbank ist leer. Lade die 10 Standardfragen, um loszulegen.
            Danach kannst du sie wie gewohnt bearbeiten.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {seeding ? "Lade…" : "Standardfragen laden"}
          </button>
        </div>
      )}
      {questions.map((q) => (
        <section
          key={q.id}
          className="bg-card border border-border rounded-lg p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Frage {q.position}</h2>
            <div className="flex items-center gap-3">
              {savedId === q.id && (
                <span className="text-sm text-green-600">Gespeichert ✓</span>
              )}
              <button
                onClick={() => handleSave(q)}
                disabled={savingId === q.id}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {savingId === q.id ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Fragetext</label>
            <textarea
              value={q.question}
              onChange={(e) => updateLocal(q.id, { question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Tipp: <code>Fett: **Wort**</code>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Antworten (richtige Antwort markieren)
            </label>
            {q.answers.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correct === i}
                  onChange={() =>
                    updateLocal(q.id, { correct: i as 0 | 1 | 2 | 3 })
                  }
                  className="size-4"
                />
                <input
                  type="text"
                  value={a}
                  onChange={(e) => {
                    const next = [...q.answers] as [
                      string,
                      string,
                      string,
                      string,
                    ];
                    next[i] = e.target.value;
                    updateLocal(q.id, { answers: next });
                  }}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Erklärung (Aha-Moment)</label>
            <textarea
              value={q.explanation}
              onChange={(e) => updateLocal(q.id, { explanation: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Tipp: <code>Fett: **Wort**</code>
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Quelle (optional)</label>
            <input
              type="text"
              value={q.source ?? ""}
              onChange={(e) => updateLocal(q.id, { source: e.target.value })}
              placeholder="z. B. Studie XY, 2024 oder https://example.com/artikel"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Wird klein und grau unter der Erklärung angezeigt. Links (http/https) werden anklickbar.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Englische Version (optional)
              </h3>
              <span className="text-xs text-muted-foreground">
                Leer lassen → deutsche Version wird als Fallback angezeigt
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Fragetext (EN)</label>
              <textarea
                value={q.question_en ?? ""}
                onChange={(e) => updateLocal(q.id, { question_en: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Tipp: <code>Fett: **Wort**</code>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Antworten (EN) – gleiche Reihenfolge wie oben
              </label>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`size-6 flex items-center justify-center text-xs font-bold rounded ${
                      q.correct === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={q.answers_en?.[i] ?? ""}
                    onChange={(e) => {
                      const base = (q.answers_en ?? ["", "", "", ""]) as [
                        string,
                        string,
                        string,
                        string,
                      ];
                      const next = [...base] as [string, string, string, string];
                      next[i] = e.target.value;
                      updateLocal(q.id, { answers_en: next });
                    }}
                    className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Erklärung (EN)</label>
              <textarea
                value={q.explanation_en ?? ""}
                onChange={(e) => updateLocal(q.id, { explanation_en: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Tipp: <code>Fett: **Wort**</code>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Quelle (EN, optional)</label>
              <input
                type="text"
                value={q.source_en ?? ""}
                onChange={(e) => updateLocal(q.id, { source_en: e.target.value })}
                placeholder="e.g. Study XY, 2024 or https://example.com/article"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bild (optional)</label>
            <input
              type="url"
              value={q.image_url ?? ""}
              onChange={(e) => updateLocal(q.id, { image_url: e.target.value })}
              placeholder="https://… oder via Upload unten"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(q, f);
              }}
              className="block w-full text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Erscheint rechts neben der Erklärung (ca. 40 % Breite). Ohne Bild nutzt die Erklärung die volle Breite.
            </p>
            {q.image_url && (
              <div className="flex items-start gap-3">
                <img
                  src={q.image_url}
                  alt=""
                  className="max-h-32 border border-border rounded"
                />
                <button
                  type="button"
                  onClick={() => updateLocal(q.id, { image_url: null })}
                  className="text-xs text-destructive underline"
                >
                  Bild entfernen
                </button>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
