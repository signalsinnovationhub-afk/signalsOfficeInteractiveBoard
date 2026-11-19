export type Language = "de" | "en";

type Dict = {
  nicknameTitle: string;
  nicknameHint: string;
  question: string;
  points: string;
  correct: string;
  wrong: string;
  source: string;
  nextQuestion: string;
  viewResult: string;
  yourResult: string;
  viewLeaderboard: string;
  leaderboard: string;
  participations: (n: number) => string;
  yourPlacement: string;
  placeOf: (rank: number, total: number) => string;
  pointsShort: string;
  saving: string;
  yourScore: string;
  newGame: string;
  you: string;
  spaceKey: string;
  deleteKey: string;
  goSubmit: string;
  langTitle: string;
  langSubtitle: string;
  german: string;
  english: string;
  zoom: string;
};

const de: Dict = {
  nicknameTitle: "Wie heißt du?",
  nicknameHint: "Dein Nickname für die Rangliste (2–16 Zeichen)",
  question: "Frage",
  points: "Punkte",
  correct: "Richtig!",
  wrong: "Leider falsch.",
  source: "Quelle",
  nextQuestion: "Nächste Frage →",
  viewResult: "Ergebnis ansehen →",
  yourResult: "dein Ergebnis",
  viewLeaderboard: "Rangliste ansehen →",
  leaderboard: "Rangliste",
  participations: (n) => `${n} ${n === 1 ? "Teilnahme" : "Teilnahmen"} insgesamt`,
  yourPlacement: "Deine Platzierung",
  placeOf: (r, t) => `Platz ${r} von ${t}`,
  pointsShort: "Pkt.",
  saving: "wird gespeichert…",
  yourScore: "Dein Ergebnis",
  newGame: "Neues Spiel →",
  you: "Du",
  spaceKey: "Leerzeichen",
  deleteKey: "Löschen",
  goSubmit: "Los geht's",
  langTitle: "Sprache wählen",
  langSubtitle: "Choose your language",
  german: "Deutsch",
  english: "English",
  zoom: "Zum Vergrößern tippen",
};

const en: Dict = {
  nicknameTitle: "What's your name?",
  nicknameHint: "Your nickname for the leaderboard (2–16 characters)",
  question: "Question",
  points: "Points",
  correct: "Correct!",
  wrong: "Wrong answer.",
  source: "Source",
  nextQuestion: "Next question →",
  viewResult: "View result →",
  yourResult: "your result",
  viewLeaderboard: "View leaderboard →",
  leaderboard: "Leaderboard",
  participations: (n) => `${n} ${n === 1 ? "participation" : "participations"} total`,
  yourPlacement: "Your placement",
  placeOf: (r, t) => `Rank ${r} of ${t}`,
  pointsShort: "pts",
  saving: "saving…",
  yourScore: "Your score",
  newGame: "New game →",
  you: "You",
  spaceKey: "Space",
  deleteKey: "Delete",
  goSubmit: "Let's go",
  langTitle: "Choose language",
  langSubtitle: "Sprache wählen",
  german: "Deutsch",
  english: "English",
  zoom: "Tap to enlarge",
};

export function t(lang: Language): Dict {
  return lang === "en" ? en : de;
}
