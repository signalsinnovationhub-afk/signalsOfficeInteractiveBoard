import { FanShape } from "./FanShape";

export function IdleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative h-full w-full bg-signals-yellow flex flex-col items-center justify-center overflow-hidden">
      <FanShape className="absolute -top-20 -right-20 w-[min(45vw,55vh)] h-[min(45vw,55vh)]" />
      <FanShape
        className="absolute -bottom-32 -left-32 w-[min(35vw,45vh)] h-[min(35vw,45vh)]"
        rotation={180}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-8 animate-slide-up">
        <div className="text-signals-black font-bold text-[clamp(2rem,3vw,3rem)] tracking-tight mb-2">
          signals
        </div>
        <h1 className="text-signals-black font-bold text-[clamp(4rem,10vw,10rem)] leading-[0.9] tracking-tighter mb-4">
          KI Quiz
        </h1>
        <div className="mb-16" />

        <button
          onClick={onStart}
          className="bg-signals-black text-signals-yellow text-[clamp(2rem,4vw,3.5rem)] font-bold px-20 py-10 brand-press animate-pulse-yellow"
          style={{ boxShadow: "8px 8px 0 0 #0A0A0A" }}
        >
          Quiz starten →
        </button>

        <p className="mt-12 text-signals-black/80 text-[clamp(1.25rem,2vw,2rem)] max-w-3xl font-medium">
          10 Fragen. 10 Aha-Momente. Wie gut kennst du den State of AI 2026?
        </p>
      </div>
    </div>
  );
}
