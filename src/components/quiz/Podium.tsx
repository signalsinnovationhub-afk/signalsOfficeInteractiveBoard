import type { CSSProperties } from "react";

type Entry = {
  id: string;
  nickname: string;
  score: number;
  total: number;
  created_at: string;
};
type Props = {
  entries: Entry[];
  currentEntryId?: string | null;
  youLabel?: string;
  pointsLabel?: string;
  pointsText?: (entry: Entry) => string;
  variant?: "default" | "compact" | "tile";
};
const SIZES = {
  default: {
    h1: "h-72",
    h2: "h-56",
    h3: "h-44",
    width: "w-56",
    gap: "gap-6",
    rank: "text-8xl",
    points: "text-3xl",
    name: "text-3xl",
    namePad: "px-4 py-2",
    border: "border-4",
  },
  compact: {
    h1: "h-40",
    h2: "h-32",
    h3: "h-24",
    width: "w-40",
    gap: "gap-3",
    rank: "text-5xl",
    points: "text-xl",
    name: "text-xl",
    namePad: "px-3 py-1",
    border: "border-2",
  },
} as const;

// Tile variant uses container-query units (cqw) via inline styles so it scales
// with the parent tile (which sets `containerType: inline-size`) regardless of
// screen resolution. This avoids fixed px widths that don't grow on 4K displays.
const TILE = {
  col: 20,
  gap: 1.8,
  h1: 25.2,
  h2: 19.2,
  h3: 13.2,
  rank: 6,
  points: 2.2,
  name: 2.2,
  namePadX: 1,
  namePadY: 0.3,
  border: 0.35,
} as const;

export function Podium({ entries, currentEntryId, youLabel, pointsLabel, pointsText, variant = "default" }: Props) {
  const top3 = entries.slice(0, 3);
  const order = [
    { entry: top3[1] ?? null, rank: 2, h: "h2", bg: "bg-signals-gray-light" as const },
    { entry: top3[0] ?? null, rank: 1, h: "h1", bg: "bg-signals-yellow" as const },
    { entry: top3[2] ?? null, rank: 3, h: "h3", bg: "bg-signals-gray-light" as const },
  ];
  const isCurrent = (e: Entry) => (currentEntryId ? e.id === currentEntryId : false);

  if (variant === "tile") {
    const colStyle: CSSProperties = { width: `${TILE.col}cqw` };
    const heightFor = (h: string) =>
      h === "h1" ? `${TILE.h1}cqw` : h === "h2" ? `${TILE.h2}cqw` : `${TILE.h3}cqw`;
    const borderStyle: CSSProperties = {
      borderWidth: `${TILE.border}cqw`,
      borderStyle: "solid",
      borderColor: "hsl(var(--signals-black, 0 0% 0%))",
    };
    // Fallback to literal black via Tailwind class to avoid relying on CSS var
    return (
      <div
        className="flex items-end justify-center w-full"
        style={{ gap: `${TILE.gap}cqw` }}
      >
        {order.map(({ entry, rank, h, bg }) => (
          <div key={rank} className="flex flex-col items-center" style={colStyle}>
            {entry ? (
              <>
                <div
                  className={`border-signals-black font-bold truncate max-w-full text-center ${
                    isCurrent(entry) ? "bg-signals-yellow" : "bg-signals-white"
                  }`}
                  style={{
                    marginBottom: `${TILE.gap / 2}cqw`,
                    paddingInline: `${TILE.namePadX}cqw`,
                    paddingBlock: `${TILE.namePadY}cqw`,
                    borderWidth: `${TILE.border}cqw`,
                    borderStyle: "solid",
                    fontSize: `${TILE.name}cqw`,
                    lineHeight: 1.2,
                  }}
                >
                  {entry.nickname}
                  {isCurrent(entry) && youLabel ? ` (${youLabel})` : ""}
                </div>
                <div
                  className={`w-full border-signals-black flex flex-col items-center justify-center animate-slide-up ${bg}`}
                  style={{
                    height: heightFor(h),
                    borderWidth: `${TILE.border}cqw`,
                    borderStyle: "solid",
                  }}
                >
                  <span
                    className="text-signals-black font-bold leading-none tracking-tighter"
                    style={{ fontSize: `${TILE.rank}cqw` }}
                  >
                    {rank}
                  </span>
                  <span
                    className="text-signals-black font-bold"
                    style={{ fontSize: `${TILE.points}cqw`, marginTop: `${TILE.gap / 4}cqw` }}
                  >
                    {pointsText ? pointsText(entry) : `${entry.score}${pointsLabel ? ` ${pointsLabel}` : ""}`}
                  </span>
                </div>
              </>
            ) : (
              // invisible placeholder so rank 1 stays centered
              <div aria-hidden style={{ visibility: "hidden", height: heightFor(h) }} className="w-full" />
            )}
          </div>
        ))}
      </div>
    );
  }

  const s = SIZES[variant];
  return (
    <div className={`flex items-end justify-center ${s.gap} flex-shrink-0`}>
      {order.map(({ entry, rank, h, bg }) =>
        entry ? (
          <div key={rank} className={`flex flex-col items-center ${s.width}`}>
            <div
              className={`mb-2 ${s.namePad} ${s.border} border-signals-black font-bold ${s.name} truncate max-w-full ${
                isCurrent(entry) ? "bg-signals-yellow" : "bg-signals-white"
              }`}
            >
              {entry.nickname}
              {isCurrent(entry) && youLabel ? ` (${youLabel})` : ""}
            </div>
            <div
              className={`${h === "h1" ? s.h1 : h === "h2" ? s.h2 : s.h3} w-full ${bg} ${s.border} border-signals-black flex flex-col items-center justify-center animate-slide-up`}
            >
              <span className={`text-signals-black font-bold ${s.rank} leading-none tracking-tighter`}>{rank}</span>
              <span className={`text-signals-black font-bold ${s.points} mt-1`}>
                {pointsText ? pointsText(entry) : `${entry.score}${pointsLabel ? ` ${pointsLabel}` : ""}`}
              </span>
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
