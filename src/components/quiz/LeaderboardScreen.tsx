import { useEffect, useMemo, useState } from "react";
import { getLeaderboard, getFullLeaderboard } from "@/lib/results.functions";
import { FanShape } from "./FanShape";
import { Podium } from "./Podium";
import { t, type Language } from "@/lib/quiz/i18n";

type Result = {
  id: string;
  nickname: string;
  score: number;
  total: number;
  created_at: string;
};

type Props = {
  language: Language;
  currentResultId: string | null;
  nickname: string;
  score: number;
  total: number;
  onRestart: () => void;
};

async function fetchAll(): Promise<Result[]> {
  try {
    return (await getFullLeaderboard()) as Result[];
  } catch (e) {
    console.error("Failed to load leaderboard:", e);
    return [];
  }
}

export function LeaderboardScreen({
  language,
  currentResultId,
  nickname,
  score,
  total: quizTotal,
  onRestart,
}: Props) {
  const L = t(language);
  const [entries, setEntries] = useState<Result[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchAll().then((r) => {
        if (!cancelled) setEntries(r);
      });
    };
    load();
    const channel = window.setInterval(load, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(channel);
    };
  }, []);

  // Identify the current user's entry. Prefer id; fallback to nickname+score
  // (most recent) while the inserted row is still in flight.
  const userIndex = useMemo(() => {
    if (currentResultId) {
      const i = entries.findIndex((e) => e.id === currentResultId);
      if (i !== -1) return i;
    }
    // Fallback: latest entry matching nickname + score.
    let bestIdx = -1;
    let bestTs = -Infinity;
    entries.forEach((e, i) => {
      if (e.nickname === nickname && e.score === score) {
        const ts = new Date(e.created_at).getTime();
        if (ts > bestTs) {
          bestTs = ts;
          bestIdx = i;
        }
      }
    });
    return bestIdx;
  }, [entries, currentResultId, nickname, score]);

  const total = entries.length;
  const userRank = userIndex + 1;
  const userEntry = userIndex >= 0 ? entries[userIndex] : null;
  const top3 = entries.slice(0, 3);
  const showsInTop = userRank > 0 && userRank <= 3;
  const restEntries = entries.slice(3);

  const isCurrent = (e: Result) =>
    userEntry ? e.id === userEntry.id : false;

  return (
    <div className="relative h-full w-full bg-signals-white flex flex-col p-8 gap-6 overflow-hidden">
      <FanShape
        className="absolute -top-16 -right-16 w-[18vw] h-[18vw] opacity-90"
        color="var(--signals-yellow)"
      />

      <div className="text-center flex-shrink-0">
        <h1 className="text-signals-black font-bold text-[clamp(3rem,6vw,4.8rem)] tracking-tighter leading-none">
          {L.leaderboard}
        </h1>
        <p className="text-signals-gray-mid text-2xl font-medium mt-1">
          {L.participations(total)}
        </p>
      </div>

      {top3.length > 0 && (
        <Podium
          entries={top3}
          currentEntryId={userEntry?.id ?? null}
          youLabel={L.you}
          pointsLabel={L.pointsShort}
          variant="default"
        />
      )}

      {/* User position banner */}
      {userEntry && !showsInTop && (
        <div className="bg-signals-black text-signals-yellow p-5 border-4 border-signals-black flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-base font-bold uppercase tracking-wider opacity-80">
              {L.yourPlacement}
            </div>
            <div className="text-4xl font-bold mt-1">
              {L.placeOf(userRank, total)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold uppercase tracking-wider opacity-80">
              {userEntry.nickname}
            </div>
            <div className="text-5xl font-bold mt-1">
              {userEntry.score} {L.points}
            </div>
          </div>
        </div>
      )}

      {!userEntry && (
        <div className="bg-signals-black text-signals-yellow p-5 border-4 border-signals-black flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-base font-bold uppercase tracking-wider opacity-80">
              {L.yourScore}
            </div>
            <div className="text-4xl font-bold mt-1">{L.saving}</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold uppercase tracking-wider opacity-80">
              {nickname}
            </div>
            <div className="text-5xl font-bold mt-1">
              {score}/{quizTotal}
            </div>
          </div>
        </div>
      )}

      {/* Full ranking list (scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-2">
        {restEntries.map((e) => {
          const rank = entries.indexOf(e) + 1;
          const mine = isCurrent(e);
          return (
            <div
              key={e.id}
              className={`flex items-center justify-between px-5 py-3 border-2 flex-shrink-0 ${
                mine
                  ? "bg-signals-yellow border-signals-black"
                  : "bg-signals-gray-light border-signals-gray-light"
              }`}
            >
              <div className="flex items-center gap-5">
                <span className="font-bold text-3xl w-12 tabular-nums">
                  {rank}.
                </span>
                <span className="font-bold text-2xl">
                  {e.nickname}
                  {mine && ` (${L.you})`}
                </span>
              </div>
              <span className="font-bold text-2xl">{e.score} {L.pointsShort}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center flex-shrink-0">
        <button
          onClick={onRestart}
          className="bg-signals-black text-signals-yellow text-3xl font-bold px-12 py-6 brand-press"
        >
          {L.newGame}
        </button>
      </div>
    </div>
  );
}
