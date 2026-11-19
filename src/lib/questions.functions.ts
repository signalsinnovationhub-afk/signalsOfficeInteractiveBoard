import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { questions as defaultQuestions } from "@/lib/quiz/questions";

export type DbQuestion = {
  id: string;
  position: number;
  question: string;
  answers: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  source: string | null;
  image_url: string | null;
  question_en: string | null;
  answers_en: [string, string, string, string] | null;
  explanation_en: string | null;
  source_en: string | null;
};

function parseAnswersEn(raw: unknown): [string, string, string, string] | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  if (!raw.every((a) => typeof a === "string")) return null;
  return raw as [string, string, string, string];
}

export const listQuestions = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbQuestion[]> => {
    const { data, error } = await supabaseAdmin
      .from("questions")
      .select(
        "id, position, question, answers, correct, explanation, source, image_url, question_en, answers_en, explanation_en, source_en",
      )
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      position: r.position,
      question: r.question,
      answers: r.answers as [string, string, string, string],
      correct: r.correct as 0 | 1 | 2 | 3,
      explanation: r.explanation,
      source: (r as { source: string | null }).source ?? null,
      image_url: (r as { image_url: string | null }).image_url ?? null,
      question_en: (r as { question_en: string | null }).question_en ?? null,
      answers_en: parseAnswersEn((r as { answers_en: unknown }).answers_en),
      explanation_en: (r as { explanation_en: string | null }).explanation_en ?? null,
      source_en: (r as { source_en: string | null }).source_en ?? null,
    }));
  },
);

const updateSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1).max(2000),
  answers: z.tuple([
    z.string().min(1).max(500),
    z.string().min(1).max(500),
    z.string().min(1).max(500),
    z.string().min(1).max(500),
  ]),
  correct: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(4000),
  source: z.string().max(500).nullable().optional(),
  image_url: z.string().max(2000).nullable().optional(),
  question_en: z.string().max(2000).nullable().optional(),
  answers_en: z
    .tuple([
      z.string().max(500),
      z.string().max(500),
      z.string().max(500),
      z.string().max(500),
    ])
    .nullable()
    .optional(),
  explanation_en: z.string().max(4000).nullable().optional(),
  source_en: z.string().max(500).nullable().optional(),
});

export const updateQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Forbidden: Admin role required");

    const sourceClean = data.source?.trim();
    const imageClean = data.image_url?.trim();
    const questionEnClean = data.question_en?.trim();
    const explanationEnClean = data.explanation_en?.trim();
    const sourceEnClean = data.source_en?.trim();
    const answersEnClean = (() => {
      if (!data.answers_en) return null;
      const cleaned = data.answers_en.map((a) => a.trim());
      if (cleaned.every((a) => a.length === 0)) return null;
      return cleaned as [string, string, string, string];
    })();

    // Keep the previous version so old questions stay available for recycling.
    const { archiveQuestion } = await import("@/lib/question-archive.server");
    await archiveQuestion(data.id);

    const { error } = await supabaseAdmin
      .from("questions")
      .update({
        question: data.question,
        answers: data.answers,
        correct: data.correct,
        explanation: data.explanation,
        source: sourceClean ? sourceClean : null,
        image_url: imageClean ? imageClean : null,
        question_en: questionEnClean ? questionEnClean : null,
        answers_en: answersEnClean,
        explanation_en: explanationEnClean ? explanationEnClean : null,
        source_en: sourceEnClean ? sourceEnClean : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const seedDefaultQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Forbidden: Admin role required");

    const { count, error: countErr } = await supabaseAdmin
      .from("questions")
      .select("*", { count: "exact", head: true });
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) return { inserted: 0 };

    const rows = defaultQuestions.map((q, i) => ({
      position: i + 1,
      question: q.question,
      answers: q.answers,
      correct: q.correct,
      explanation: q.explanation,
      source: null as string | null,
    }));
    const { error } = await supabaseAdmin.from("questions").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });
