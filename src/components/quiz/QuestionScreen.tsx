import type { Question } from "@/lib/quiz/questions";
import { renderRich } from "@/lib/quiz/renderRich";
import { t, type Language } from "@/lib/quiz/i18n";

type Props = {
  language: Language;
  question: Question;
  index: number;
  total: number;
  score: number;
  onSelect: (i: number) => void;
};

export function QuestionScreen({ language, question, index, total, score, onSelect }: Props) {
  const progress = ((index) / total) * 100;
  const L = t(language);

  return (
    <div className="h-full w-full bg-signals-black flex flex-col p-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between text-signals-yellow font-bold text-xl mb-2 uppercase tracking-wider">
            <span>{L.question} {index + 1} / {total}</span>
          </div>
          <div className="h-4 bg-signals-gray-mid/30 border-2 border-signals-yellow">
            <div
              className="h-full bg-signals-yellow transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="bg-signals-yellow text-signals-black font-bold text-3xl px-6 py-3 border-2 border-signals-yellow">
          {score} {L.points}
        </div>
      </div>

      {/* Question */}
      <div className="bg-signals-white text-signals-black p-8 border-4 border-signals-yellow flex-shrink-0 animate-slide-up">
        <p className="text-[clamp(1.5rem,2.6vw,2.4rem)] font-bold leading-tight tracking-tight">
          {renderRich(question.question)}
        </p>
      </div>

      {/* Answers */}
      <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
        {question.answers.map((answer, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="bg-signals-gray-light text-signals-black border-4 border-signals-white hover:bg-signals-yellow hover:border-signals-yellow active:translate-y-1 transition-all p-6 text-left flex items-center gap-6 min-h-[140px]"
          >
            <span className="bg-signals-black text-signals-yellow w-16 h-16 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold leading-tight">
              {answer}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
