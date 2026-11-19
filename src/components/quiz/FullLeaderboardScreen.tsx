import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getLeaderboard, getFullLeaderboard } from "@/lib/results.functions";
import { FanShape } from "./FanShape";
import { Podium } from "./Podium";

type Result = {
  id: string;
  nickname: string;
  score: number;
  total: number;
  created_at: string;
};

const STAGE_W = 1920;
const STAGE_H = 1080;

async function fetchAll(): Promise<Result[]> {
  try {
    return (await getFullLeaderboard()) as Result[];
  } catch (e) {
    console.error("Failed to load leaderboard:", e);
    return [];
  }
}

type Props = {
  onClose: () => void;
};

export function FullLeaderboardScreen({ onClose }: Props) {
  const [entries, setEntries] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchAll().then((r) => {
        if (!cancelled) {
          setEntries(r);
          setLoading(false);
        }
      });
    };
    load();
    const channel = window.setInterval(load, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(channel);
    };
  }, []);

  // Scale 1920x1080 stage to fit viewport (matches QuizFlow behavior).
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-signals-black animate-slide-up"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div className="relative h-full w-full bg-signals-white flex flex-col p-10 gap-6 overflow-hidden">
          <FanShape
            className="absolute -top-16 -right-16 w-[18vw] h-[18vw] opacity-90"
            color="var(--signals-yellow)"
          />

          <div className="flex-shrink-0 relative z-10">
            <h1 className="text-signals-black font-bold text-[clamp(3rem,6vw,4.8rem)] tracking-tighter leading-none">
              Gesamtes Ranking
            </h1>
            <p className="text-signals-gray-mid text-2xl font-medium mt-1">
              {entries.length}{" "}
              {entries.length === 1 ? "Teilnahme" : "Teilnahmen"} insgesamt
            </p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-signals-gray-mid font-bold text-3xl text-center animate-pulse">
                Lädt Teilnehmer …
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-signals-gray-mid font-bold text-3xl text-center">
                Noch keine Teilnahmen.
              </p>
            </div>
          ) : (
            <>
              <Podium
                entries={entries.slice(0, 3)}
                pointsLabel="Pkt."
                variant="compact"
              />

              {entries.length > 3 && (
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-2 relative z-10">
                  {entries.slice(3).map((e, i) => {
                    const rank = i + 4;
                    return (
                      <div
                        key={e.id}
                        className="flex items-center gap-6 px-6 py-4 border-4 bg-signals-gray-light border-signals-gray-light flex-shrink-0"
                      >
                        <span className="text-signals-black font-bold text-4xl tabular-nums w-16 shrink-0 text-center">
                          {rank}
                        </span>
                        <span className="text-signals-black font-bold text-3xl flex-1 min-w-0 truncate">
                          {e.nickname}
                        </span>
                        <span className="text-signals-black font-bold text-3xl tabular-nums shrink-0">
                          {e.score}/{e.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Schließen"
        className="absolute top-2 right-2 z-50 bg-signals-black text-signals-yellow border border-signals-yellow/40 shadow w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-signals-black"
      >
        ×
      </button>
    </div>
  );
}
