import type { Language } from "./i18n";

type Localizable = {
  question: string;
  answers: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  source?: string | null;
  question_en?: string | null;
  answers_en?: [string, string, string, string] | null;
  explanation_en?: string | null;
  source_en?: string | null;
};

/**
 * Returns the question localized for the given language. Falls back to the
 * German fields when the English alternative is missing/empty, so the layout
 * never breaks.
 */
export function localizeQuestion<T extends Localizable>(q: T, lang: Language): T {
  if (lang !== "en") return q;

  const answersEn = q.answers_en;
  const answers =
    answersEn &&
    answersEn.length === 4 &&
    answersEn.every((a) => typeof a === "string" && a.trim().length > 0)
      ? (answersEn as [string, string, string, string])
      : q.answers;

  return {
    ...q,
    question: q.question_en?.trim() ? q.question_en : q.question,
    answers,
    explanation: q.explanation_en?.trim() ? q.explanation_en : q.explanation,
    source: q.source_en?.trim() ? q.source_en : q.source ?? null,
  };
}
