function norm(s) {
  return String(s == null ? '' : s).trim().toLowerCase();
}

function answersMatch(expected, given, qtype) {
  const g = norm(given);
  const parts = String(expected || '')
    .split('|')
    .map(norm)
    .filter(Boolean);
  if (!g) return false;
  if (qtype === 'fill') return parts.includes(g);
  return parts[0] === g;
}

function gradeQuiz(questions, answers) {
  const list = Array.isArray(questions) ? questions : [];
  const ans = answers && typeof answers === 'object' ? answers : {};
  let correct = 0;
  const detail = list.map((q, i) => {
    const key = String(q.sort_order != null ? q.sort_order : i + 1);
    const given = ans[q.id] != null ? ans[q.id] : ans[key];
    const ok = answersMatch(q.answer, given, q.qtype);
    if (ok) correct += 1;
    return { id: q.id, sort_order: q.sort_order, ok };
  });
  const total = list.length || 1;
  const score = Math.round((correct / total) * 100);
  return { score, correct, total: list.length, detail };
}

module.exports = { answersMatch, gradeQuiz };
