import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { ArchivedQuestion } from "@/lib/question-archive.functions";

/** The archive table is not part of the generated types yet. */
export function archiveTable() {
  return (supabaseAdmin as unknown as {
    from: (t: string) => any;
  }).from("question_archive");
}

export async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: Admin role required");
}

function parseAnswers(raw: unknown): [string, string, string, string] | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  if (!raw.every((a) => typeof a === "string")) return null;
  return raw as [string, string, string, string];
}

export function toArchived(r: any): ArchivedQuestion {
  return {
    id: r.id,
    question_id: r.question_id ?? null,
    position: r.position ?? null,
    archived_at: r.archived_at,
    question: r.question,
    answers: (parseAnswers(r.answers) ?? ["", "", "", ""]) as [
      string,
      string,
      string,
      string,
    ],
    correct: (r.correct ?? 0) as 0 | 1 | 2 | 3,
    explanation: r.explanation ?? "",
    source: r.source ?? null,
    image_url: r.image_url ?? null,
    question_en: r.question_en ?? null,
    answers_en: parseAnswers(r.answers_en),
    explanation_en: r.explanation_en ?? null,
    source_en: r.source_en ?? null,
  };
}

/**
 * Snapshots the current state of a question into the archive.
 * Skips writing when the newest archived version is identical.
 */
export async function archiveQuestion(questionId: string) {
  const { data: current, error } = await supabaseAdmin
    .from("questions")
    .select(
      "id, position, question, answers, correct, explanation, source, image_url, question_en, answers_en, explanation_en, source_en",
    )
    .eq("id", questionId)
    .maybeSingle();
  if (error || !current) return;

  const { data: last } = await archiveTable()
    .select("question, answers, correct, explanation, source, image_url, question_en, answers_en, explanation_en, source_en")
    .eq("question_id", questionId)
    .order("archived_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const fingerprint = (o: any) =>
    JSON.stringify([
      o.question,
      o.answers,
      o.correct,
      o.explanation,
      o.source ?? null,
      o.image_url ?? null,
      o.question_en ?? null,
      o.answers_en ?? null,
      o.explanation_en ?? null,
      o.source_en ?? null,
    ]);
  if (last && fingerprint(last) === fingerprint(current)) return;

  await archiveTable().insert({
    question_id: current.id,
    position: current.position,
    question: current.question,
    answers: current.answers,
    correct: current.correct,
    explanation: current.explanation,
    source: current.source ?? null,
    image_url: current.image_url ?? null,
    question_en: current.question_en ?? null,
    answers_en: current.answers_en ?? null,
    explanation_en: current.explanation_en ?? null,
    source_en: current.source_en ?? null,
  });
}
