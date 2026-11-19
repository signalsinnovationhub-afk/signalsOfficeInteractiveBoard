function shuffleArray<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Shufflable = {
  answers: [string, string, string, string];
  answers_en?: [string, string, string, string] | null;
  correct: 0 | 1 | 2 | 3;
};

/**
 * Shuffle the list of questions and the answers within each question,
 * remapping the `correct` index so it still points to the correct option.
 * The English answers (if present) are reordered with the same permutation
 * so DE and EN stay aligned.
 */
export function shuffleQuiz<T extends Shufflable>(questions: readonly T[]): T[] {
  const shuffledList = shuffleArray(questions);
  return shuffledList.map((q) => {
    const indices = shuffleArray([0, 1, 2, 3]);
    const answers = indices.map((i) => q.answers[i]) as [
      string,
      string,
      string,
      string,
    ];
    const answers_en = q.answers_en
      ? (indices.map((i) => q.answers_en![i]) as [
          string,
          string,
          string,
          string,
        ])
      : q.answers_en ?? null;
    const correct = indices.indexOf(q.correct) as 0 | 1 | 2 | 3;
    return { ...q, answers, answers_en, correct };
  });
}
