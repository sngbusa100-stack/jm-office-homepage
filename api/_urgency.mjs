// 기한 우선(긴급) 판정 — 접수 알림·아침 요약·회신 초안·/admin·connector가 모두 이 함수 하나를 쓴다.
// 판정 결과는 레코드에 저장하지 않고 저장된 고객 답에서 매번 계산한다(예전 접수도 같은 식으로 판정).
// 로컬 행정심판 시스템은 connector GET의 urgentReasons를 받아 쓴다(docs/2026-10-21-deadline-signal-plan.md).

/** 긴급 근거. 순서가 표시 순서다. */
export const URGENT_REASONS = ['diagnosis', 'visaIntake', 'visaDiagnosis', 'selfReported'];

/** 상담 화면 '처분서·통지서에 적힌 기한' 자가 응답 값(출입국·비자 외 분야, 선택). */
export const DEADLINE_REPORTS = ['soon', 'later', 'unknown', 'none'];

/** 긴급으로 보는 자가 응답 — '2주 안이거나 지남', '모름'(음주운전 진단의 unknown 등급과 같은 기준). */
const URGENT_DEADLINE_REPORTS = ['soon', 'unknown'];

/**
 * @param {object | null | undefined} record 접수 레코드(또는 검증을 거친 접수 값)
 * @returns {string[]} URGENT_REASONS 순서의 근거 목록. 파기된 접수는 항상 빈 목록.
 */
export function urgentReasons(record) {
  if (!record || typeof record !== 'object' || record.purged) return [];
  const reasons = [];
  // 진단 counts는 서버가 검증된 답으로 다시 계산한 값이다(_validate.mjs sanitizeDiagnosis).
  if (Number(record.diagnosis?.counts?.urgent) > 0) reasons.push('diagnosis');
  if (record.visaIntake?.deadlineFirst === true) reasons.push('visaIntake');
  // 비자 사전진단 등급도 서버가 매긴다(_visa-handoff.mjs classify).
  if (record.visaDiagnosis?.level === 'urgent') reasons.push('visaDiagnosis');
  if (URGENT_DEADLINE_REPORTS.includes(record.deadlineReport)) reasons.push('selfReported');
  return reasons;
}

export function isUrgent(record) {
  return urgentReasons(record).length > 0;
}
