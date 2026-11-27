// 상담 접수 검증·포맷 (api/consult.js에서 사용, _접두사라 엔드포인트로 노출되지 않음)
import { diagnosisTopicSlug, matchesAnswers } from './_diagnosis-routing.mjs';
import CHECK_LEVELS, { forms, overrides, visibility } from './_check-levels.mjs';
import { sanitizeVisaHandoff } from './_visa-handoff.mjs';
import { sanitizeVisaIntake } from './_visa-intake.mjs';
import { DEADLINE_REPORTS } from './_urgency.mjs';

/** 텔레그램 알림에서 바로 여는 관리 화면 주소. 뒤에 #접수번호를 붙이면 그 접수를 펼쳐 보여 준다(AdminPage). */
export const ADMIN_URL = 'https://jungmyungoffice.com/admin';

export const TOPICS = [
  '음주운전 면허 구제',
  '영업정지 · 행정심판',
  '인허가',
  '출입국 · 비자',
  '국가보훈',
  '토지보상 · 내용증명 · 계약서',
];

/** 셀프 진단 분야 → 상담 분야. 진단은 같은 분야 상담에만 붙인다(보고서 2-1 4번). */
const DIAGNOSIS_TOPIC = {
  dui: '음주운전 면허 구제',
  suspension: '영업정지 · 행정심판',
  permit: '인허가',
  land: '토지보상 · 내용증명 · 계약서',
  veterans: '국가보훈',
};

// 진단 정의(도메인→문항→선택지→등급). scripts/gen-check-levels.ts로 생성 —
// src/data/checks와의 동기화는 src/test/checkLevels.sync.test.ts가 보증한다.
/**
 * 셀프 진단 첨부 데이터를 실제 진단 정의와 대조해 정리한다.
 * - 존재하지 않는 도메인이면 진단 전체를 제외(null) — 접수는 막지 않는다.
 * - 문항 판 표시(form)가 지금 문항과 다르면 진단 전체를 제외한다.
 * - 존재하지 않는 문항·선택지는 버린다.
 * - counts는 클라이언트 값을 믿지 않고 검증된 답변의 등급으로 서버가 재계산한다
 *   (긴급 표시 위조 방지).
 */
export function sanitizeDiagnosis(input) {
  if (typeof input !== 'object' || input === null) return null;
  const domain = typeof input.domain === 'string' ? input.domain.trim() : '';
  const questions = CHECK_LEVELS[domain];
  if (!Object.hasOwn(CHECK_LEVELS, domain)) return null;
  // 지금 문항과 판이 다른 답(문항을 고치기 전에 열어 둔 화면에서 보낸 답)은 같은 ID라도 뜻이 다를 수 있어 받지 않는다.
  if (input.form !== forms[domain]) return null;

  const answersIn = typeof input.answers === 'object' && input.answers !== null ? input.answers : {};
  const answers = {};
  for (const [questionId, options] of Object.entries(questions)) {
    if (!matchesAnswers(visibility[domain]?.[questionId], answers)) continue;
    const optionId = answersIn[questionId];
    if (typeof optionId !== 'string') continue;
    if (!Object.hasOwn(options, optionId)) continue;
    answers[questionId] = optionId;
  }
  // 등급은 화면(src/domain/diagnosis.ts classifyAnswers)과 같이 덮어쓰기 규칙을 먼저 본다.
  const counts = {};
  for (const [questionId, optionId] of Object.entries(answers)) {
    const override = overrides[domain]?.find(
      (o) => o.questionId === questionId && Object.entries(o.when).every(([id, ids]) => ids.includes(answers[id])),
    );
    const level = override?.level ?? questions[questionId][optionId];
    counts[level] = (counts[level] ?? 0) + 1;
  }

  return { domain, form: forms[domain], answers, counts };
}

/** 상담과 함께 저장되는 유입 식별자. 허용 키 4종 외 값은 버린다. */
export function sanitizeAttribution(input) {
  if (typeof input !== 'object' || input === null) return null;
  const clean = {};
  for (const key of ['source', 'medium', 'campaign', 'content']) {
    const value = typeof input[key] === 'string' ? input[key].trim().slice(0, 80) : '';
    if (value) clean[key] = value;
  }
  return Object.keys(clean).length > 0 ? clean : null;
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
  const visaDiagnosis = sanitizeVisaHandoff(data.visaDiagnosis);
  // 셀프 진단은 상담 분야와 같은 분야일 때만 담는다. 다른 분야의 예전 진단이나
  // 비자 진단과 함께 온 메인 진단은 긴급 판정을 바꾸므로 버린다(접수는 막지 않음).
  const rawDiagnosis = sanitizeDiagnosis(data.diagnosis);
  const diagnosis = rawDiagnosis && !visaDiagnosis && DIAGNOSIS_TOPIC[diagnosisTopicSlug(rawDiagnosis.domain, rawDiagnosis.answers)] === topic
    ? rawDiagnosis
    : null;
  const rawSourcePath = typeof data.sourcePath === 'string' ? data.sourcePath.trim().slice(0, 120) : '';
  const sourcePath = !diagnosis && rawSourcePath.startsWith('/check/') ? '' : rawSourcePath;
  const utmSource = typeof data.utmSource === 'string' ? data.utmSource.trim().slice(0, 80) : '';
  const attribution = sanitizeAttribution(data.attribution);
  // 멱등성 키 — 응답 유실 후 재제출을 같은 접수로 묶는다. 형식이 틀리면 무시(선택 값).
  const rawSubmissionId = typeof data.submissionId === 'string' ? data.submissionId.trim() : '';
  const submissionId = /^[A-Za-z0-9-]{8,64}$/.test(rawSubmissionId) ? rawSubmissionId : '';

  const errors = [];
  if (honeypot) errors.push('spam');
  if (name.length < 1 || name.length > 50) errors.push('name');
  if (!/^[0-9+\-\s()]{9,20}$/.test(phone)) errors.push('phone');
  // 이메일은 선택 — 입력했는데 형식이 틀리면 오타 방지를 위해 오류로 잡는다.
  if (email && (email.length > 100 || !/^\S+@\S+\.\S+$/.test(email))) errors.push('email');
  if (!TOPICS.includes(topic)) errors.push('topic');
  if (visaDiagnosis && topic !== '출입국 · 비자' && !errors.includes('topic')) errors.push('topic');
  // 출입국·비자 분야는 설계안(docs/2026-10-18-visa-intake-questions.md)의 필수 질문을 함께 받는다.
  let visaIntake = null;
  if (topic === '출입국 · 비자') {
    const intake = sanitizeVisaIntake(data.visaIntake, { visaDiagnosis });
    if (intake.ok) visaIntake = intake.value;
    else errors.push('visaIntake');
  }
  // 처분서·통지서 기한 자가 응답(선택). 비자는 접수 질문이 따로 있어 받지 않는다. 틀린 값은 버린다.
  const deadlineReport = topic !== '출입국 · 비자' && DEADLINE_REPORTS.includes(data.deadlineReport)
    ? data.deadlineReport
    : '';
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
      ...(attribution ? { attribution } : {}),
      ...(visaDiagnosis ? { visaDiagnosis } : {}),
      ...(visaIntake ? { visaIntake } : {}),
      ...(deadlineReport ? { deadlineReport } : {}),
      ...(submissionId ? { submissionId } : {}),
    },
  };
}

/**
 * 텔레그램(국외 사업자) 알림에는 개인정보(이름·연락처·분야·상담 내용)를 싣지 않는다.
 * 상세는 접근이 제한된 /admin 관리자 화면에서만 열람한다.
 * 장애 때는 운영자가 대조할 번호와 장애 상태만 보낸다.
 * 긴급 건(meta.urgentReasons, _urgency.mjs)은 근거를 나누지 않고 한 줄만 넣는다.
 * '고객 직접 선택'은 비자 외 분야에만 있어 따로 적으면 분야가 드러나기 때문이다. 근거는 /admin에서 본다.
 */
export function formatTelegramMessage(value, meta = {}) {
  const urgentLines = urgentNoticeLines(meta.urgentReasons);
  if (meta.storeError) {
    return ['⚠ 홈페이지 접수 저장 확인 필요', meta.inquiryId && `확인번호: ${meta.inquiryId}`]
      .filter(Boolean).join('\n');
  }

  const lines = ['📥 새 상담 접수'];
  if (meta.inquiryId) lines.push(`접수번호: ${meta.inquiryId}`);
  lines.push(...urgentLines);
  if (meta.indexWarning) lines.push('⚠ 접수 목록 인덱스 확인 필요');
  // 주소 끝 #접수번호는 서버로 가지 않고 관리 화면이 그 접수를 펼치는 데만 쓴다(개인정보 아님).
  lines.push(`상세 보기: ${ADMIN_URL}${meta.inquiryId ? `#${meta.inquiryId}` : ''}`);
  return lines.join('\n');
}

function urgentNoticeLines(reasons = []) {
  return Array.isArray(reasons) && reasons.length > 0 ? ['⏰ 기한 우선 확인 — 근거는 관리 화면에서'] : [];
}
