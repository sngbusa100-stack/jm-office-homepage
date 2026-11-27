// 진단과 상담 분야가 일치해야 답변을 첨부할 수 있다. 브라우저와 접수 API가 함께 사용한다.
export function diagnosisTopicSlug(domain, answers) {
  if (domain === 'land' && answers['land-topic'] === 'development') return 'permit';
  if (domain === 'procurement') return 'permit';
  if (domain === 'appeal') return 'suspension';
  return domain;
}

export function matchesAnswers(condition, answers) {
  return !condition || Object.entries(condition).every(([key, values]) => values.includes(answers[key]));
}

/**
 * 문항 판 표시 — 진단 정의(문항·보기·등급·분기·덮어쓰기)에서 만든 짧은 지문(FNV-1a 32비트).
 * 문항을 고치면 자동으로 바뀐다. 접수 API는 지금 판과 다른 진단 답을 받지 않고(옛 화면이 열린 채 보낸 답),
 * 관리 화면은 판이 다른 옛 접수 기록에 지금 문항의 등급·안내를 붙이지 않는다.
 * 브라우저(src/data/checks)와 서버(scripts/gen-check-levels.ts가 만든 api/_check-levels.mjs forms)가 같은 값을 쓴다.
 */
export function diagnosisForm(definition) {
  const text = JSON.stringify([definition.questions, definition.overrides ?? []]);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
