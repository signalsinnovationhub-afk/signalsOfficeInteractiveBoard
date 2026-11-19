import { FanShape } from "@/components/quiz/FanShape";

export function QuizTile({ onStart }: { onStart: () => void }) {
  return (
    <button
      onClick={onStart}
      className="relative w-full h-full bg-signals-yellow overflow-hidden text-left brand-press flex flex-col justify-between p-8"
    >
      <FanShape className="absolute -top-12 -right-12 w-[40%] h-[40%]" />
      <FanShape
        className="absolute -bottom-16 -left-16 w-[35%] h-[35%]"
        rotation={180}
      />

      <div className="relative z-10">
        <div className="text-signals-black font-bold text-lg tracking-tight">
          signals
        </div>
        <h2 className="text-signals-black font-bold text-[clamp(2.5rem,5vw,5rem)] leading-[0.9] tracking-tighter mt-1">
          KI Quiz
        </h2>
        <p className="text-signals-black/80 text-lg font-medium mt-3 max-w-md">
          10 Fragen. 10 Aha-Momente. Wie gut kennst du den State of AI 2026?
        </p>
      </div>

      <div className="relative z-10 self-end">
        <span className="relative inline-block bg-signals-black text-signals-yellow text-[clamp(1.25rem,2vw,1.75rem)] font-bold px-8 py-4 animate-pulse-yellow">
          <span
            className="absolute -inset-3 animate-pulse-black"
            aria-hidden="true"
          />
          <span className="relative z-10">Jetzt starten →</span>
        </span>
      </div>
    </button>
  );
}
