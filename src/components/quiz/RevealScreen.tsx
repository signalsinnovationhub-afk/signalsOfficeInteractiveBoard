import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Check, X, Lightbulb } from "lucide-react";
import type { Question } from "@/lib/quiz/questions";
import { renderRich } from "@/lib/quiz/renderRich";
import { FanShape } from "./FanShape";
import { t, type Language } from "@/lib/quiz/i18n";

type Props = {
  language: Language;
  question: Question;
  selectedAnswer: number;
  onNext: () => void;
  isLast: boolean;
};

/** Shrinks the explanation text until it fits its box (no scrolling needed). */
function useAutoFit(deps: unknown[]) {
  const boxRef = useRef<HTMLDivElement>(null);

  const fit = () => {
    const box = boxRef.current;
    if (!box) return;
    const target = box.querySelector<HTMLElement>("[data-autofit]");
    if (!target) return;
    const max = Math.min(Math.max(window.innerWidth * 0.017, 17.6), 25.6); // ~clamp(1.1rem,1.7vw,1.6rem)
    const min = 13.6; // 0.85rem
    let size = max;
    target.style.fontSize = `${size}px`;
    box.style.padding = "";
    let guard = 0;
    while (size > min && box.scrollHeight > box.clientHeight + 1 && guard++ < 60) {
      size -= 0.5;
      target.style.fontSize = `${size}px`;
      if (size < max * 0.8) box.style.padding = "0.75rem";
    }
  };

  useLayoutEffect(fit, deps);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(box);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { boxRef };
}

export function RevealScreen({ language, question, selectedAnswer, onNext, isLast }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const { boxRef } = useAutoFit([question.question, question.explanation, language]);
  const L = t(language);
  const isCorrect = selectedAnswer === question.correct;
  const source = question.source?.trim();
  const isUrl = !!source && /^https?:\/\//i.test(source);
  const image = question.image_url?.trim();
  const hasImage = !!image;

  return (
    <div
      className={`relative h-full w-full flex flex-col p-8 gap-5 overflow-hidden ${
        isCorrect ? "bg-signals-yellow" : "bg-signals-black"
      }`}
    >
      <FanShape
        className="absolute -top-10 -right-10 w-[20vw] h-[20vw] opacity-40 -z-10"
        color={isCorrect ? "var(--signals-black)" : "var(--signals-yellow)"}
      />

      {/* Feedback header */}
      <div className="flex items-center gap-6 animate-pop-in flex-shrink-0 relative z-10">
        <div
          className={`w-20 h-20 flex items-center justify-center border-4 ${
            isCorrect
              ? "bg-signals-black border-signals-black"
              : "bg-signals-yellow border-signals-yellow"
          }`}
        >
          {isCorrect ? (
            <Check className="!size-14 text-signals-yellow" strokeWidth={4} />
          ) : (
            <X className="!size-14 text-signals-black" strokeWidth={4} />
          )}
        </div>
        <h1
          className={`text-[clamp(2.6rem,5.4vw,4.4rem)] font-bold tracking-tighter leading-none ${
            isCorrect ? "text-signals-black" : "text-signals-yellow"
          }`}
        >
          {isCorrect ? L.correct : L.wrong}
        </h1>
      </div>

      {/* Question recap */}
      <div className="bg-signals-white text-signals-black p-5 border-4 border-signals-black flex-shrink-0 relative z-10">
        <p className="text-[clamp(1.2rem,2vw,1.8rem)] font-bold leading-tight tracking-tight">
          {renderRich(question.question)}
        </p>
      </div>

      {/* Answers recap */}
      <div className="grid grid-cols-2 gap-4 flex-shrink-0 relative z-10">
        {question.answers.map((answer, i) => {
          const isAnswerCorrect = i === question.correct;
          const isChosen = i === selectedAnswer;
          const styles = isAnswerCorrect
            ? "bg-signals-black text-signals-yellow border-signals-black"
            : isChosen
            ? "bg-signals-white text-signals-black border-destructive border-dashed"
            : "bg-signals-white/50 text-signals-black/50 border-signals-black/20";
          return (
            <div
              key={i}
              className={`border-4 p-3 flex items-center gap-3 min-h-[64px] ${styles}`}
            >
              <span className="w-9 h-9 flex items-center justify-center text-lg font-bold border-2 border-current flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-lg font-bold leading-tight">{answer}</span>
              {isAnswerCorrect && (
                <Check className="!size-6 ml-auto flex-shrink-0" strokeWidth={3} />
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation + image area (image column always reserved for consistent layout) */}
      <div className="flex gap-4 flex-1 min-h-0 relative z-10">
        <div
          ref={boxRef}
          className="flex-1 min-w-0 bg-signals-white text-signals-black border-4 border-signals-black p-5 overflow-auto animate-slide-up relative z-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="!size-7 text-signals-black" strokeWidth={2.5} fill="var(--signals-yellow)" />
          </div>
          <p data-autofit className="font-medium leading-snug whitespace-pre-line">
            {renderRich(question.explanation)}
          </p>
          {source && (
            <p className="text-sm text-signals-black/60 mt-3 leading-snug">
              {L.source}:{" "}
              {isUrl ? (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline break-all"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </p>
          )}
        </div>

        {hasImage && (
          <div className="h-full flex-shrink-0 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label={L.zoom}
              className="h-full min-h-0 flex items-center justify-end cursor-zoom-in"
            >
              <img
                src={image}
                alt=""
                className="h-full w-auto object-contain border-4 border-signals-black"
              />
            </button>
          </div>
        )}


      </div>

      {zoomed && image && (
        <div
          className="fixed inset-0 z-[60] bg-signals-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img src={image} alt="" className="max-h-full max-w-full object-contain" />
          <button
            type="button"
            aria-label="Schließen"
            onClick={() => setZoomed(false)}
            className="absolute top-3 right-3 w-14 h-14 bg-signals-yellow text-signals-black text-2xl font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end flex-shrink-0 relative z-10">
        <button
          onClick={onNext}
          className={`text-[clamp(1.4rem,2.3vw,1.9rem)] font-bold px-10 py-5 brand-press ${
            isCorrect
              ? "bg-signals-black text-signals-yellow"
              : "bg-signals-yellow text-signals-black"
          }`}
        >
          {isLast ? L.viewResult : L.nextQuestion}
        </button>
      </div>
    </div>
  );
}
