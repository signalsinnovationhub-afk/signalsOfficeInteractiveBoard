import { useEffect, useState } from "react";
import { getLeaderboard, getFullLeaderboard } from "@/lib/results.functions";
import { FanShape } from "@/components/quiz/FanShape";
import { Podium } from "@/components/quiz/Podium";

type Result = {
  id: string;
  nickname: string;
  score: number;
  total: number;
  created_at: string;
};
type Snapshot = {
  top3: Result[];
  todayBest: Result | null;
};

async function fetchSnapshot(): Promise<Snapshot> {
  try {
    return (await getLeaderboard()) as Snapshot;
  } catch {
    return { top3: [], todayBest: null };
  }
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

type Props = {
  onOpenFull?: () => void;
};

export function RankingTile({ onOpenFull }: Props) {
  const [snap, setSnap] = useState<Snapshot>({ top3: [], todayBest: null });

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchSnapshot().then((s) => {
        if (!cancelled) setSnap(s);
      });
    };
    load();
    const channel = window.setInterval(load, 10_000);
    const heartbeat = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
      window.clearInterval(channel);
    };
  }, []);

  const interactive = !!onOpenFull;

  return (
    <button
      type="button"
      onClick={onOpenFull}
      disabled={!interactive}
      aria-label={interactive ? "Gesamtes Ranking anzeigen" : undefined}
      className="relative w-full h-full bg-signals-gray-light p-6 flex flex-col gap-5 overflow-hidden text-left brand-press disabled:cursor-default"
      style={{ containerType: "inline-size" }}
    >
      <FanShape
        className="pointer-events-none absolute -bottom-20 -right-20 w-[70%] h-[70%] opacity-10 -z-0"
        rotation={180}
      />
      <div className="relative z-10">
        <h2 className="text-signals-black font-bold text-[clamp(1.75rem,3vw,2.5rem)] tracking-tighter leading-none">
          KI-Quiz-Ranking
        </h2>
        <p className="text-signals-gray-mid font-medium text-base mt-1">Allzeit Top 3</p>
      </div>
      {snap.top3.length === 0 ? (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <p className="text-signals-gray-mid font-bold text-xl text-center">
            Noch keine Teilnahmen.
            <br />
            Sei die/der Erste!
          </p>
        </div>
      ) : (
        <div
          className="relative z-10 flex-1 flex items-center justify-center min-h-0 w-full"
          style={{ containerType: "inline-size", marginBottom: "1.5cqw" }}
        >
          <Podium entries={snap.top3} variant="tile" pointsText={(e) => `${e.score}/${e.total}`} />
        </div>
      )}
      {snap.todayBest && (
        <div className="relative z-10 bg-signals-black flex items-center gap-4 px-4 py-3 w-full">
          <span className="text-signals-yellow font-bold text-xs uppercase tracking-widest shrink-0">Tagesbest</span>
          <span className="flex-1 min-w-0 truncate text-signals-white font-bold text-[clamp(1.1rem,1.8vw,1.5rem)]">
            {snap.todayBest.nickname}
          </span>
          <span className="text-signals-yellow font-bold text-[clamp(1.25rem,2vw,1.75rem)] tabular-nums shrink-0">
            {snap.todayBest.score}/{snap.todayBest.total}
          </span>
        </div>
      )}
    </button>
  );
}
