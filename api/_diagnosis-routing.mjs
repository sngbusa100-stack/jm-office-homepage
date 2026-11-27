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
