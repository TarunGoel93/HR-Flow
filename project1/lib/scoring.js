/**
 * Currently supports MCQ only.
 * test.questions: [{ _id, correctOptionIndex, marks }]
 * attempt.answers: [{ questionId, answer }] where answer is optionIndex (number)
 */
export function scoreAttempt(testDoc, attemptDoc) {
  const qMap = new Map();
  let maxScore = 0;

  for (const q of testDoc.questions) {
    qMap.set(String(q._id), q);
    maxScore += Number(q.marks || 1);
  }

  let score = 0;

  for (const a of attemptDoc.answers || []) {
    const q = qMap.get(String(a.questionId));
    if (!q) continue;

    const marks = Number(q.marks || 1);

    // MCQ: answer must be a number
    const ans = typeof a.answer === "number" ? a.answer : Number(a.answer);

    if (Number.isFinite(ans) && ans === q.correctOptionIndex) {
      score += marks;
    }
  }

  return { score, maxScore };
}
