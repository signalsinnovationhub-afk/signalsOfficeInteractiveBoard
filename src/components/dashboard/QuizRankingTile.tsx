import { useEffect, useState } from "react";
import { QuizTile } from "./QuizTile";
import { RankingTile } from "./RankingTile";

type Props = {
  onStart: () => void;
  onOpenRanking: () => void;
  intervalMs?: number;
};

export function QuizRankingTile({
  onStart,
  onOpenRanking,
  intervalMs = 10000,
}: Props) {
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    const id = window.setInterval(
      () => setShowRanking((v) => !v),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: showRanking ? 0 : 1,
          pointerEvents: showRanking ? "none" : "auto",
        }}
        aria-hidden={showRanking}
      >
        <QuizTile onStart={onStart} />
      </div>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: showRanking ? 1 : 0,
          pointerEvents: showRanking ? "auto" : "none",
        }}
        aria-hidden={!showRanking}
      >
        <RankingTile onOpenFull={onOpenRanking} />
      </div>
    </div>
  );
}
