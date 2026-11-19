type Props = {
  /** Seconds remaining, integer >= 0. */
  seconds: number;
  /** Total seconds the ring represents (for arc progress). */
  total: number;
};

/**
 * Small circular countdown displayed in a corner during auto-return.
 * Yellow ring shrinks as time runs out; large bold number in the middle.
 */
export function CountdownClock({ seconds, total }: Props) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, seconds / total));
  const dash = c * pct;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-pop-in">
      <div className="relative w-20 h-20 bg-signals-black border-4 border-signals-yellow shadow-[6px_6px_0_0_#0A0A0A] flex items-center justify-center">
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="rgba(250,240,92,0.2)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--signals-yellow)"
            strokeWidth="6"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={c / 4}
            strokeLinecap="square"
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dasharray 0.3s linear" }}
          />
        </svg>
        <span className="relative text-signals-yellow font-bold text-3xl tabular-nums leading-none">
          {seconds}
        </span>
      </div>
    </div>
  );
}
