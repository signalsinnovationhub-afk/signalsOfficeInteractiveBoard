import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listQuestions } from "@/lib/questions.functions";
import { getMediaTiles } from "@/lib/media.functions";
import { getSettings } from "@/lib/settings.functions";
import { listInvestments } from "@/lib/investments.functions";
import { MediaVideoTile } from "@/components/dashboard/MediaVideoTile";
import { NewsCarouselTile } from "@/components/dashboard/NewsCarouselTile";
import { QuizRankingTile } from "@/components/dashboard/QuizRankingTile";
import { StartupTile } from "@/components/dashboard/StartupTile";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { FullLeaderboardScreen } from "@/components/quiz/FullLeaderboardScreen";
import videoPoster from "@/assets/video/bottom-poster.jpg.asset.json";


export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "signals KI Quiz – Innovation Hub" },
      { property: "og:title", content: "signals KI Quiz – Innovation Hub" },
      { property: "og:description", content: "Startups, KI-News und das interaktive signals KI Quiz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content:
          "Display-Dashboard mit Videos, Quiz und Live-Rangliste im signals Innovation Hub.",
      },
    ],
  }),
});

function DashboardPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizFullscreen, setQuizFullscreen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const fetchQuestions = useServerFn(listQuestions);
  const fetchMedia = useServerFn(getMediaTiles);
  const fetchSettings = useServerFn(getSettings);
  const fetchInvestments = useServerFn(listInvestments);

  const { data: questions } = useQuery({
    queryKey: ["questions"],
    queryFn: () => fetchQuestions(),
    staleTime: 30_000,
  });

  const { data: media } = useQuery({
    queryKey: ["media_tiles"],
    queryFn: () => fetchMedia(),
    staleTime: 30_000,
  });

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: () => fetchSettings(),
    staleTime: 30_000,
  });

  const { data: investments } = useQuery({
    queryKey: ["investments"],
    queryFn: () => fetchInvestments(),
    staleTime: 5 * 60_000,
  });


  const bottom = media?.find((m) => m.slot === "bottom");

  const videosPaused = quizOpen && quizFullscreen;

  const handleExit = () => {
    setQuizOpen(false);
    setQuizFullscreen(false);
  };

  return (
    <main className="h-screen w-screen overflow-hidden animate-signals-breathe p-4">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full w-full">

        <div className="relative overflow-hidden">
          <StartupTile items={investments} paused={videosPaused} />
        </div>

        <div className="relative overflow-hidden">
          {/* QuizFlow stays mounted across fullscreen toggle so progress is preserved. */}
          {quizOpen ? (
            <QuizFlow
              questions={questions}
              idleTimeoutSec={settings?.quiz_idle_timeout_sec ?? 30}
              countdownSec={settings?.quiz_countdown_sec ?? 10}
              finishReturnSec={settings?.quiz_finish_return_sec ?? 8}
              shuffleEnabled={settings?.quiz_shuffle_enabled ?? true}
              fullscreen={quizFullscreen}
              onToggleFullscreen={() => setQuizFullscreen((v) => !v)}
              onExit={handleExit}
            />
          ) : (
            <QuizRankingTile
              onStart={() => setQuizOpen(true)}
              onOpenRanking={() => setLeaderboardOpen(true)}
            />
          )}
        </div>

        <div className="relative overflow-hidden">
          <NewsCarouselTile paused={videosPaused} />
        </div>


        <div className="relative overflow-hidden">
          <MediaVideoTile
            src={bottom?.resolved_url ?? ""}
            poster={bottom?.poster_url || (bottom?.storage_path === "tiles/signals-loop-2026-11-19.mp4" ? videoPoster.url : undefined)}
            paused={videosPaused}
            placeholder="Video im Admin hinzufügen"
          />
        </div>
      </div>

      {leaderboardOpen && (
        <FullLeaderboardScreen onClose={() => setLeaderboardOpen(false)} />
      )}
    </main>
  );
}
