import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ArchivedQuestion = {
  id: string;
  question_id: string | null;
  position: number | null;
  archived_at: string;
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

export const listArchivedQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ArchivedQuestion[]> => {
    const { assertAdmin, archiveTable, toArchived } = await import(
      "@/lib/question-archive.server"
    );
    await assertAdmin(context.userId);
    const { data, error } = await archiveTable()
      .select("*")
      .order("archived_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toArchived);
  });

export const deleteArchivedQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, archiveTable } = await import(
      "@/lib/question-archive.server"
    );
    await assertAdmin(context.userId);
    const { error } = await archiveTable().delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Copies an archived version back onto a live question (recycling). */
export const restoreArchivedQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ archiveId: z.string().uuid(), targetQuestionId: z.string().uuid() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, archiveTable, toArchived, archiveQuestion } = await import(
      "@/lib/question-archive.server"
    );
    await assertAdmin(context.userId);

    const { data: row, error } = await archiveTable()
      .select("*")
      .eq("id", data.archiveId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Archivierte Frage nicht gefunden");
    const a = toArchived(row);

    // Keep the version we are about to overwrite.
    await archiveQuestion(data.targetQuestionId);

    const { error: upErr } = await supabaseAdmin
      .from("questions")
      .update({
        question: a.question,
        answers: a.answers,
        correct: a.correct,
        explanation: a.explanation,
        source: a.source,
        image_url: a.image_url,
        question_en: a.question_en,
        answers_en: a.answers_en,
        explanation_en: a.explanation_en,
        source_en: a.source_en,
      })
      .eq("id", data.targetQuestionId);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });
