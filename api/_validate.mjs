// 상담 접수 검증·포맷 (api/consult.js에서 사용, _접두사라 엔드포인트로 노출되지 않음)

export const TOPICS = [
  '음주운전 면허 구제',
  '영업정지 · 행정심판',
  '인허가',
  '출입국 · 비자',
  '국가보훈',
  '토지보상 · 내용증명 · 계약서',
];

export function validateConsultPayload(body) {
  const data = typeof body === 'object' && body !== null ? body : {};
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const topic = typeof data.topic === 'string' ? data.topic.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const consent = data.consent === true;
  const honeypot = typeof data.company === 'string' ? data.company.trim() : '';

  const errors = [];
  if (honeypot) errors.push('spam');
  if (name.length < 1 || name.length > 50) errors.push('name');
  if (!/^[0-9+\-\s()]{9,20}$/.test(phone)) errors.push('phone');
  if (!TOPICS.includes(topic)) errors.push('topic');
  if (message.length > 2000) errors.push('message');
  if (!consent) errors.push('consent');

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { name, phone, topic, message } };
}

export function formatTelegramMessage(value, meta = {}) {
  const lines = [
    '📥 새 상담 신청 (홈페이지)',
    ...(meta.inquiryId ? [`접수번호: ${meta.inquiryId}`] : []),
    `이름: ${value.name}`,
    `연락처: ${value.phone}`,
    `분야: ${value.topic}`,
  ];
  if (meta.storeError) {
    lines.push('⚠ 접수 저장 실패 — 이 알림이 유일한 기록입니다.');
  }
  if (value.message) {
    lines.push('', '상담 내용:', value.message);
  }
  if (meta.origin) {
    lines.push('', `출처: ${meta.origin}`);
  }
  return lines.join('\n');
}
