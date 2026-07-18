// 상담 접수 검증·포맷 (api/consult.js에서 사용, _접두사라 엔드포인트로 노출되지 않음)

export const TOPICS = [
  '음주운전 면허 구제',
  '영업정지 · 행정심판',
  '인허가',
  '출입국 · 비자',
  '국가보훈',
  '토지보상 · 내용증명 · 계약서',
];

/**
 * 셀프 진단 첨부 데이터를 정리한다. 형식이 어긋나면 접수를 막지 않고
 * null을 돌려 조용히 제외한다(진단 없이도 접수는 유효).
 */
export function sanitizeDiagnosis(input) {
  if (typeof input !== 'object' || input === null) return null;
  const domain = typeof input.domain === 'string' ? input.domain.trim().slice(0, 40) : '';
  if (!domain) return null;

  const answersIn = typeof input.answers === 'object' && input.answers !== null ? input.answers : {};
  const answers = {};
  let count = 0;
  for (const [key, val] of Object.entries(answersIn)) {
    if (typeof val !== 'string') continue;
    if (count >= 40) break;
    answers[String(key).slice(0, 60)] = val.slice(0, 60);
    count += 1;
  }

  const countsIn = typeof input.counts === 'object' && input.counts !== null ? input.counts : {};
  const counts = {};
  for (const level of ['urgent', 'documents', 'official', 'ready']) {
    const n = countsIn[level];
    if (typeof n === 'number' && Number.isFinite(n) && n >= 0) counts[level] = Math.min(Math.floor(n), 99);
  }

  return { domain, answers, counts };
}

export function validateConsultPayload(body) {
  const data = typeof body === 'object' && body !== null ? body : {};
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const topic = typeof data.topic === 'string' ? data.topic.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const consent = data.consent === true;
  const honeypot = typeof data.company === 'string' ? data.company.trim() : '';
  const diagnosis = sanitizeDiagnosis(data.diagnosis);
  const sourcePath = typeof data.sourcePath === 'string' ? data.sourcePath.trim().slice(0, 120) : '';
  const utmSource = typeof data.utmSource === 'string' ? data.utmSource.trim().slice(0, 80) : '';

  const errors = [];
  if (honeypot) errors.push('spam');
  if (name.length < 1 || name.length > 50) errors.push('name');
  if (!/^[0-9+\-\s()]{9,20}$/.test(phone)) errors.push('phone');
  // 이메일은 선택 — 입력했는데 형식이 틀리면 오타 방지를 위해 오류로 잡는다.
  if (email && (email.length > 100 || !/^\S+@\S+\.\S+$/.test(email))) errors.push('email');
  if (!TOPICS.includes(topic)) errors.push('topic');
  if (message.length > 2000) errors.push('message');
  if (!consent) errors.push('consent');

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      phone,
      ...(email ? { email } : {}),
      topic,
      message,
      ...(diagnosis ? { diagnosis } : {}),
      ...(sourcePath ? { sourcePath } : {}),
      ...(utmSource ? { utmSource } : {}),
    },
  };
}

/**
 * 텔레그램(국외 사업자) 알림에는 개인정보(이름·연락처·분야·상담 내용)를 싣지 않는다.
 * 상세는 접근이 제한된 /admin 관리자 화면에서만 열람한다.
 * 예외: 저장 실패 시에는 이 알림이 유일한 기록이므로 유실 방지를 위해 전체 내용을 포함한다.
 */
export function formatTelegramMessage(value, meta = {}) {
  if (meta.storeError) {
    const lines = [
      '📥 새 상담 신청 (홈페이지)',
      '⚠ 접수 저장 실패 — 이 알림이 유일한 기록입니다.',
      ...(meta.inquiryId ? [`접수번호: ${meta.inquiryId}`] : []),
      `이름: ${value.name}`,
      `연락처: ${value.phone}`,
      ...(value.email ? [`이메일: ${value.email}`] : []),
      `분야: ${value.topic}`,
    ];
    if (value.message) {
      lines.push('', '상담 내용:', value.message);
    }
    if (meta.origin) {
      lines.push('', `출처: ${meta.origin}`);
    }
    return lines.join('\n');
  }

  const lines = ['📥 새 상담 접수'];
  if (meta.inquiryId) lines.push(`접수번호: ${meta.inquiryId}`);
  if (meta.urgent) lines.push('⏰ 기한 관련 긴급 확인 항목 포함');
  lines.push('상세는 관리자 화면(/admin)에서 확인하세요.');
  return lines.join('\n');
}
