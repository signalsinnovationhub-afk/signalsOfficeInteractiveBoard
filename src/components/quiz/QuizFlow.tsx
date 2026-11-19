import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuizState, questions as fallback } from "@/lib/quiz/useQuizState";
import { shuffleQuiz } from "@/lib/quiz/shuffle";
import { useIdleCountdown } from "@/lib/quiz/useIdleCountdown";
import { submitResult } from "@/lib/results.functions";
import type { DbQuestion } from "@/lib/questions.functions";
import { NicknameScreen } from "./NicknameScreen";
import { LanguageScreen } from "./LanguageScreen";
import { QuestionScreen } from "./QuestionScreen";
import { RevealScreen } from "./RevealScreen";
import { ScoreScreen } from "./ScoreScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { CountdownClock } from "./CountdownClock";
import { localizeQuestion } from "@/lib/quiz/localizeQuestion";

type Props = {
  questions: DbQuestion[] | undefined;
  idleTimeoutSec: number;
  countdownSec: number;
  finishReturnSec: number;
  shuffleEnabled: boolean;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onExit: () => void;
};

const STAGE_W = 1920;
const STAGE_H = 1080;

export function QuizFlow({
  questions: dbQuestions,
  idleTimeoutSec,
  countdownSec,
  finishReturnSec,
  shuffleEnabled,
  fullscreen,
  onToggleFullscreen,
  onExit,
}: Props) {
  const [state, dispatch] = useQuizState();
  const submit = useServerFn(submitResult);

  const sourceList = dbQuestions && dbQuestions.length > 0 ? dbQuestions : fallback;
  // Shuffle questions + answers once per quiz session (component mount), if enabled.
  const shuffled = useMemo(
    () => (shuffleEnabled ? shuffleQuiz(sourceList) : sourceList.slice()),
    [sourceList, shuffleEnabled],
  );
  // Localize per-session based on the language picked at the start.
  const list = useMemo(
    () => shuffled.map((q) => localizeQuestion(q, state.language)),
    [shuffled, state.language],
  );
  const currentQuestion = list[state.currentIndex];

  useEffect(() => {
    if (state.phase !== "score") return;
    if (!state.nickname) return;
    if (state.currentResultId) return;
    submit({
      data: {
        nickname: state.nickname,
        score: state.score,
        total: list.length,
      },
    })
      .then((res) => {
        if (res?.id) dispatch({ type: "SET_RESULT_ID", id: res.id });
      })
      .catch((e) => {
        console.error("Failed to submit quiz result:", e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "score" && state.phase !== "leaderboard") return;
    const t = window.setTimeout(() => onExit(), finishReturnSec * 1000);
    return () => window.clearTimeout(t);
  }, [state.phase, finishReturnSec, onExit]);

  const idleActive =
    state.phase === "language" ||
    state.phase === "nickname" ||
    state.phase === "question" ||
    state.phase === "reveal";

  const countdown = useIdleCountdown({
    idleTimeoutSec,
    countdownSec,
    onTimeout: onExit,
    resetKey: state.phase + ":" + state.currentIndex,
    paused: !idleActive,
  });

  // Measure container and compute scale to fit the 1920x1080 stage.
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
  }, [fullscreen]);

  const wrapperClass = fullscreen
    ? "fixed inset-0 z-40 bg-signals-black animate-slide-up"
    : "absolute inset-0 bg-signals-black overflow-hidden";

  return (
    <div ref={containerRef} className={wrapperClass}>
      {/* Scaled stage */}
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
        {state.phase === "language" && (
          <LanguageScreen
            onSelect={(language) => dispatch({ type: "SET_LANGUAGE", language })}
          />
        )}

        {state.phase === "nickname" && (
          <NicknameScreen
            language={state.language}
            onSubmit={(nickname) => dispatch({ type: "SET_NICKNAME", nickname })}
          />
        )}

        {state.phase === "question" && currentQuestion && (
          <QuestionScreen
            language={state.language}
            question={currentQuestion}
            index={state.currentIndex}
            total={list.length}
            score={state.score}
            onSelect={(answer) =>
              dispatch({
                type: "SELECT_ANSWER",
                answer,
                correct: currentQuestion.correct,
              })
            }
          />
        )}

        {state.phase === "reveal" &&
          currentQuestion &&
          state.selectedAnswer !== null && (
            <RevealScreen
              language={state.language}
              question={currentQuestion}
              selectedAnswer={state.selectedAnswer}
              onNext={() => dispatch({ type: "NEXT", total: list.length })}
              isLast={state.currentIndex === list.length - 1}
            />
          )}

        {state.phase === "score" && (
          <ScoreScreen
            language={state.language}
            score={state.score}
            total={list.length}
            nickname={state.nickname}
            onShowLeaderboard={() => dispatch({ type: "SHOW_LEADERBOARD" })}
          />
        )}

        {state.phase === "leaderboard" && (
          <LeaderboardScreen
            language={state.language}
            currentResultId={state.currentResultId}
            nickname={state.nickname}
            score={state.score}
            total={list.length}
            onRestart={onExit}
          />
        )}
      </div>

      {/* Fullscreen toggle */}
      <button
        onClick={onToggleFullscreen}
        aria-label={fullscreen ? "Vollbild verlassen" : "Vollbild öffnen"}
        className="absolute top-2 right-14 z-50 bg-signals-black text-signals-yellow border border-signals-yellow/40 shadow w-10 h-10 flex items-center justify-center hover:bg-signals-black"
      >
        {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      {/* Exit button */}
      <button
        onClick={onExit}
        aria-label="Quiz beenden"
        className="absolute top-2 right-2 z-50 bg-signals-black text-signals-yellow border border-signals-yellow/40 shadow w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-signals-black"
      >
        ×
      </button>

      {countdown !== null && (
        <CountdownClock seconds={countdown} total={countdownSec} />
      )}
    </div>
  );
}
