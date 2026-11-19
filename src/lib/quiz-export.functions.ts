import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildQuizHtml, type ExportQuestion } from "@/lib/quiz-export.template";

export const exportQuizHtml = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({
    context,
  }): Promise<{
    html: string;
    imagesEmbedded: number;
    imagesSkipped: number;
    bytes: number;
  }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Forbidden: Admin role required");

    const { data, error } = await supabaseAdmin
      .from("questions")
      .select(
        "position, question, answers, correct, explanation, source, image_url, question_en, answers_en, explanation_en, source_en",
      )
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: settingRow } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "quiz_shuffle_enabled")
      .maybeSingle();
    const shuffle = (() => {
      const raw = (settingRow as { value: unknown } | null)?.value;
      if (typeof raw === "boolean") return raw;
      if (typeof raw === "string") return raw !== "false";
      return true;
    })();

    // Download each image once and inline it as a data URI so the exported
    // file works fully offline.
    // Cap per image so the file stays openable in mobile Safari.
    const MAX_IMAGE_BYTES = 1_500_000;
    const cache = new Map<string, string | null>();
    let imagesEmbedded = 0;
    let imagesSkipped = 0;

    async function inlineImage(url: string | null): Promise<string | null> {
      const clean = url?.trim();
      if (!clean) return null;
      if (clean.startsWith("data:")) return clean;
      if (cache.has(clean)) return cache.get(clean) ?? null;
      let result: string | null = null;
      try {
        const res = await fetch(clean);
        if (res.ok) {
          const buf = new Uint8Array(await res.arrayBuffer());
          if (buf.length > MAX_IMAGE_BYTES) {
            imagesSkipped++;
            cache.set(clean, null);
            return null;
          }
          const type = res.headers.get("content-type") ?? "image/jpeg";
          let binary = "";
          const chunk = 0x8000;
          for (let i = 0; i < buf.length; i += chunk) {
            binary += String.fromCharCode(...buf.subarray(i, i + chunk));
          }
          result = `data:${type};base64,${btoa(binary)}`;
          imagesEmbedded++;
        }
      } catch {
        result = null;
      }
      cache.set(clean, result);
      return result;
    }

    const rows = data ?? [];
    const questions: ExportQuestion[] = [];
    for (const r of rows) {
      const answersEnRaw = (r as { answers_en: unknown }).answers_en;
      const answersEn =
        Array.isArray(answersEnRaw) &&
        answersEnRaw.length === 4 &&
        answersEnRaw.every((a) => typeof a === "string")
          ? (answersEnRaw as [string, string, string, string])
          : null;
      questions.push({
        question: r.question,
        answers: r.answers as [string, string, string, string],
        correct: r.correct as 0 | 1 | 2 | 3,
        explanation: r.explanation,
        source: (r as { source: string | null }).source ?? null,
        image: await inlineImage((r as { image_url: string | null }).image_url ?? null),
        question_en: (r as { question_en: string | null }).question_en ?? null,
        answers_en: answersEn,
        explanation_en: (r as { explanation_en: string | null }).explanation_en ?? null,
        source_en: (r as { source_en: string | null }).source_en ?? null,
      });
    }

    const html = buildQuizHtml(questions, { shuffle });
    return {
      html,
      imagesEmbedded,
      imagesSkipped,
      bytes: new TextEncoder().encode(html).length,
    };
  });
