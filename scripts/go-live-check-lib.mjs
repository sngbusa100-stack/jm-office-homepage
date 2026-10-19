// 개업 전환 점검의 판정 함수(순수 함수). 입력 수집은 scripts/go-live-check.mjs가 한다.
// 설계: docs/2026-10-19-go-live-check-plan.md. 결과 status: ok · fail · manual(사람 확인) · skip(확인 불가)
import { findPreOpenPhrases } from './pre-open-phrases.mjs';

/** 개업 상태에서 반드시 채워야 하는 사무소 값. src/data/office.ts REQUIRED_WHEN_OPEN과 같아야 한다(테스트). */
export const REQUIRED_OFFICE_FIELDS = [
  'phone', 'kakaoChannelUrl', 'address', 'registrationNumber', 'businessNumber', 'formEndpoint',
];

/** 운영(Vercel Production)에 있어야 하는 환경변수 이름 */
export const REQUIRED_VERCEL_ENV = [
  'CONSULT_OPEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'KV_REST_API_URL', 'KV_REST_API_TOKEN',
  'CRON_SECRET', 'CONNECTOR_TOKEN', 'ADMIN_TOKEN', 'RATE_LIMIT_SECRET',
];

const HOUR = 60 * 60 * 1000;
const result = (id, title, status, detail = '') => ({ id, title, status, detail });

export function checkOffice(office) {
  const missing = [...REQUIRED_OFFICE_FIELDS, 'openedOn'].filter((key) => !office[key]);
  const title = `사무소 정보(office.json) — ${office.isOpen ? '개업 상태' : '개업 전'}`;
  if (missing.length > 0) {
    const prefix = office.isOpen ? '개업 상태인데 비어 있음' : '개업 전에 채울 값';
    return result('office', title, 'fail', `${prefix}: ${missing.join(', ')}`);
  }
  if (!office.isOpen) return result('office', title, 'fail', '값은 모두 있음 — 개업일에 isOpen을 true로 바꿈');
  return result('office', title, 'ok');
}

/** historyDates: PRIVACY_HISTORY의 날짜 목록 */
export function checkPolicy({ office, effectiveDate, consentVersion, historyDates = [] }) {
  const title = `개인정보처리방침 시행일 ${effectiveDate} · 동의 버전 ${consentVersion}`;
  if (effectiveDate !== consentVersion) {
    return result('policy', title, 'fail', 'PRIVACY_EFFECTIVE_DATE와 CONSENT_VERSION이 다름');
  }
  if (office.isOpen && (!office.openedOn || effectiveDate < office.openedOn)) {
    return result(
      'policy', title, 'fail',
      `개업으로 방침 문구가 바뀌었으니 시행일·동의 버전을 개업일(${office.openedOn ?? 'openedOn 없음'}) 이후로 갱신하고 변경 이력을 추가`,
    );
  }
  if (office.isOpen && !historyDates.includes(effectiveDate)) {
    return result('policy', title, 'fail', `PRIVACY_HISTORY(변경 이력)에 시행일 ${effectiveDate} 항목이 없음`);
  }
  return result('policy', title, 'ok');
}

/** pages: [{ path, text }] — 사전 렌더링 결과(dist)의 보이는 글. 없으면 null */
export function checkWording({ office, pages }) {
  const title = '사전 렌더링 결과(dist)의 개업 전 문구';
  if (!pages) return result('wording', title, 'skip', 'dist 없음 — npm run build 뒤 다시 실행');
  if (!office.isOpen) return result('wording', title, 'ok', '개업 전이라 개업 전 문구가 있는 것이 정상');
  const hits = pages
    .map(({ path, text }) => ({ path, phrases: findPreOpenPhrases(text) }))
    .filter((p) => p.phrases.length > 0);
  if (hits.length === 0) return result('wording', title, 'ok');
  return result('wording', title, 'fail', hits.map((h) => `${h.path} (${h.phrases.join(', ')})`).join(' · '));
}

/** probe: 운영 /api/consult에 빈 POST를 보낸 응답 { status, body } 또는 null(네트워크 생략) */
export function checkConsultApi({ office, probe }) {
  const title = '운영 상담 접수 API(/api/consult)';
  if (!probe) return result('consult-api', title, 'skip', '네트워크 확인 생략');
  const closed = probe.status === 503 && probe.body?.error === 'not_accepting';
  const open = probe.status === 400;
  if (!closed && !open) return result('consult-api', title, 'fail', `알 수 없는 응답 ${probe.status}`);
  if (!office.isOpen && open) {
    return result('consult-api', title, 'fail', '개업 전인데 접수가 열려 있음 — 업무신고 전 접수 위험. Vercel CONSULT_OPEN을 끄세요');
  }
  if (office.isOpen && closed) {
    return result('consult-api', title, 'fail', '개업 상태인데 접수가 닫혀 있음 — Vercel CONSULT_OPEN=true 설정 후 다시 배포');
  }
  return result('consult-api', title, 'ok', open ? '열림' : '닫힘');
}

/** statuses: { 경로: 인증 없이 받은 HTTP 상태 } 또는 null */
export function checkProtectedApis(statuses) {
  const title = '관리·연동·cron API가 인증 없이 막혀 있음';
  if (!statuses) return result('protected-api', title, 'skip', '네트워크 확인 생략');
  const open = Object.entries(statuses).filter(([, status]) => status !== 401);
  if (open.length === 0) return result('protected-api', title, 'ok');
  return result('protected-api', title, 'fail', open.map(([path, status]) => `${path} ${status}`).join(', '));
}

/** names: Vercel Production 환경변수 이름 목록 또는 null(조회 실패) */
export function checkVercelEnv(names, office, { offline = false } = {}) {
  const title = 'Vercel 운영 환경변수(이름만 확인)';
  if (offline) return result('vercel-env', title, 'skip', '확인 생략(--offline)');
  if (!names) return result('vercel-env', title, 'skip', 'vercel env ls 조회 실패(로그인 확인)');
  const missing = REQUIRED_VERCEL_ENV.filter((name) => !names.includes(name));
  // CONSULT_OPEN은 없으면 접수가 닫힌 것으로 동작한다(api/consult.js). 개업 전에는 없는 것이 정상이다.
  const blocking = office.isOpen ? missing : missing.filter((name) => name !== 'CONSULT_OPEN');
  if (blocking.length > 0) return result('vercel-env', title, 'fail', `없음: ${blocking.join(', ')}`);
  if (missing.includes('CONSULT_OPEN')) {
    return result('vercel-env', title, 'ok', 'CONSULT_OPEN 없음(접수 닫힘) — 개업일에 CONSULT_OPEN=true 추가');
  }
  return result('vercel-env', title, 'ok');
}

/** text: 운영 첫 화면의 보이는 글 또는 null */
export function checkLiveSite({ office, text }) {
  const title = '운영 홈페이지 화면(jungmyungoffice.com)';
  if (text == null) return result('live-site', title, 'skip', '네트워크 확인 생략');
  const phrases = findPreOpenPhrases(text);
  const showsNumber = text.includes('행정사 등록번호 ') && !text.includes('등록번호·사업자등록번호는 정식 개업 후');
  if (office.isOpen) {
    if (phrases.length > 0) return result('live-site', title, 'fail', `개업 전 문구가 남음: ${phrases.join(', ')} — 배포됐는지 확인`);
    if (!showsNumber) return result('live-site', title, 'fail', '행정사 등록번호가 보이지 않음 — 배포됐는지 확인');
    return result('live-site', title, 'ok');
  }
  if (showsNumber || phrases.length === 0) {
    return result('live-site', title, 'fail', '개업 전인데 운영 화면이 개업 상태 — 배포 상태와 office.json이 어긋남');
  }
  return result('live-site', title, 'ok', '개업 전 화면');
}

/** text: 비자 사이트 화면 번들(JS)의 글 또는 null */
export function checkVisaSite({ office, text }) {
  const title = '비자 사이트(visa.jungmyungoffice.com) 개업 전 문구';
  if (text == null) return result('visa-site', title, 'skip', '네트워크 확인 생략');
  if (!office.isOpen) return result('visa-site', title, 'ok', '개업 전이라 개업 전 문구가 있는 것이 정상');
  const phrases = findPreOpenPhrases(text);
  if (phrases.length === 0) return result('visa-site', title, 'ok');
  return result('visa-site', title, 'fail', `개업 전 문구가 남음: ${phrases.join(', ')} — 비자 사이트 문구 전환(별도 과제, 5개 언어)`);
}

/** envKeys: 로컬 .env 키 이름 목록, task: { lastResult, lastRunTime(ISO) } — 각각 없으면 null */
export function checkLocalConnector({ envKeys, task, now = new Date() }) {
  const title = '로컬 연동기(행정심판 시스템)';
  if (!envKeys && !task) return result('local-connector', title, 'skip', '로컬 설정·작업 스케줄러를 읽을 수 없음');
  const problems = [];
  const missing = ['CONNECTOR_BASE_URL', 'CONNECTOR_TOKEN'].filter((k) => !(envKeys ?? []).includes(k));
  if (missing.length > 0) problems.push(`.env에 없음: ${missing.join(', ')}`);
  if (!task) {
    problems.push('작업 스케줄러 JM_Homepage_Pull을 읽을 수 없음');
  } else {
    // 267009(0x41301) = 지금 실행 중
    if (task.lastResult !== 0 && task.lastResult !== 267009) problems.push(`마지막 실행 결과 ${task.lastResult}`);
    const last = Date.parse(task.lastRunTime ?? '');
    if (!Number.isFinite(last) || now.getTime() - last > HOUR) problems.push('1시간 넘게 실행되지 않음');
  }
  return problems.length === 0 ? result('local-connector', title, 'ok') : result('local-connector', title, 'fail', problems.join(' · '));
}

/** 자동으로 확인할 수 없어 사람이 확인할 일 */
export function manualItems() {
  return [
    '행정사 업무신고 수리(행정사법 제10조) — 수리 전 상담 응대는 제36조②1 처벌 대상',
    '대한행정사회 가입(행정사법 제26조의2)',
    '사업자등록 — 사업자등록번호를 office.json에 입력',
    '카카오 채널 개설 — 주소를 office.json kakaoChannelUrl에 입력',
    '시험 접수 1건 왕복: Telegram 알림 → 로컬 대기함 → 회신 초안 → 종결 → 시험 건 파기',
    '네이버 서치어드바이저·구글 서치콘솔 재수집 요청, 카카오 공유 캐시 초기화',
    '명함·블로그 표기(등록번호·연락처) 확인',
  ].map((title, i) => result(`manual-${i + 1}`, title, 'manual'));
}

/** strict에서는 확인하지 못한 항목(skip)도 통과로 보지 않는다(망 장애·로그인 풀림을 합격으로 오인하지 않게). */
export function summarizeChecks(results, { strict = false } = {}) {
  const count = (status) => results.filter((r) => r.status === status).length;
  const summary = { ok: count('ok'), fail: count('fail'), manual: count('manual'), skip: count('skip') };
  return { ...summary, exitCode: strict && summary.fail + summary.skip > 0 ? 1 : 0 };
}
