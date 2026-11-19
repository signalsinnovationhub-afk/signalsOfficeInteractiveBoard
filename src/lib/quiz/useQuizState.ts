import { useReducer } from "react";
import { questions as fallbackQuestions } from "./questions";
import type { Question } from "./questions";
import type { Language } from "./i18n";

export type Phase =
  | "language"
  | "nickname"
  | "question"
  | "reveal"
  | "score"
  | "leaderboard";

export type QuizState = {
  phase: Phase;
  language: Language;
  nickname: string;
  currentIndex: number;
  selectedAnswer: number | null;
  score: number;
  currentResultId: string | null;
};

type Action =
  | { type: "SET_LANGUAGE"; language: Language }
  | { type: "SET_NICKNAME"; nickname: string }
  | { type: "SELECT_ANSWER"; answer: number; correct: 0 | 1 | 2 | 3 }
  | { type: "NEXT"; total: number }
  | { type: "SET_RESULT_ID"; id: string }
  | { type: "SHOW_LEADERBOARD" }
  | { type: "RESET" };

const initial: QuizState = {
  phase: "language",
  language: "de",
  nickname: "",
  currentIndex: 0,
  selectedAnswer: null,
  score: 0,
  currentResultId: null,
};

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { ...state, language: action.language, phase: "nickname" };
    case "SET_NICKNAME":
      return { ...state, nickname: action.nickname, phase: "question" };
    case "SELECT_ANSWER": {
      const correct = action.answer === action.correct;
      return {
        ...state,
        selectedAnswer: action.answer,
        score: correct ? state.score + 1 : state.score,
        phase: "reveal",
      };
    }
    case "NEXT": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= action.total) {
        return { ...state, phase: "score" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        selectedAnswer: null,
        phase: "question",
      };
    }
    case "SET_RESULT_ID":
      return { ...state, currentResultId: action.id };
    case "SHOW_LEADERBOARD":
      return { ...state, phase: "leaderboard" };
    case "RESET":
      return { ...initial };
    default:
      return state;
  }
}

export function useQuizState() {
  return useReducer(reducer, initial);
}

export const questions = fallbackQuestions;
export type { Question };
