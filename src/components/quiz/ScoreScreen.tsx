import { useEffect, useState } from "react";
import { Confetti } from "./Confetti";
import { t, type Language } from "@/lib/quiz/i18n";

type Props = {
  language: Language;
  score: number;
  total: number;
  nickname: string;
  onShowLeaderboard: () => void;
};

function getMessage(score: number, total: number, lang: Language) {
  const pct = score / total;
  if (lang === "en") {
    if (pct === 1) return "Legend. You are the AI.";
    if (pct >= 0.8) return "Impressive. A true AI pro.";
    if (pct >= 0.6) return "Solid performance. Well done!";
    if (pct >= 0.4) return "Room to grow — but respectable.";
    return "Time for an Innovation Briefing!";
  }
  if (pct === 1) return "Legende. Du bist die KI.";
  if (pct >= 0.8) return "Beeindruckend. Echter KI-Profi.";
  if (pct >= 0.6) return "Solide Performance. Gut gemacht!";
  if (pct >= 0.4) return "Da geht noch was – aber respektabel.";
  return "Zeit für ein Innovation Briefing!";
}

export function ScoreScreen({ language, score, total, nickname, onShowLeaderboard }: Props) {
  const L = t(language);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const celebrate = score >= 7;

  return (
    <div className="relative h-full w-full bg-signals-yellow flex flex-col items-center justify-center px-8 gap-8">
      {celebrate && <Confetti />}

      <div className="text-center animate-slide-up">
        <p className="text-signals-black/70 text-3xl font-bold uppercase tracking-widest mb-2">
          {nickname}, {L.yourResult}
        </p>
        <div className="flex items-baseline justify-center gap-4 leading-none">
          <span className="text-signals-black font-bold text-[clamp(9.6rem,26vw,24rem)] tracking-tighter tabular-nums">
            {displayed}
          </span>
          <span className="text-signals-black/60 font-bold text-[clamp(3.6rem,9.6vw,9.6rem)] tracking-tighter">
            / {total}
          </span>
        </div>
        <p className="text-signals-black text-[clamp(1.8rem,3.6vw,3rem)] font-bold mt-4 max-w-3xl">
          {getMessage(score, total, language)}
        </p>
      </div>

      <button
        onClick={onShowLeaderboard}
        className="bg-signals-black text-signals-yellow text-[clamp(1.8rem,3vw,2.7rem)] font-bold px-16 py-8 brand-press mt-6"
      >
        {L.viewLeaderboard}
      </button>
    </div>
  );
}
