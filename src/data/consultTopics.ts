// 상담 분야 슬러그 → 상담 분야 이름. 상담 화면 ?topic=슬러그 미리 선택과
// 상담 준비 메모(src/lib/replyLabels.ts → api/_reply-labels.mjs)의 분야별 업무 안내 연결이 함께 쓴다.
// 분야 이름은 서버 상담 분야(api/_validate.mjs TOPICS = api/_reply-draft.mjs TOPIC_ROUTES)와 같아야 한다(src/test/consultBrief.test.ts).
// 업무 상세(services.ts)의 consultTopic이 이 슬러그다.
export const CONSULT_TOPIC_BY_SLUG: Record<string, string> = {
  dui: '음주운전 면허 구제',
  suspension: '영업정지 · 행정심판',
  permit: '인허가',
  visa: '출입국 · 비자',
  veterans: '국가보훈',
  land: '토지보상 · 내용증명 · 계약서',
};
