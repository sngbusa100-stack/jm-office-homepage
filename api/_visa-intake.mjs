// 출입국·비자 상담 접수 필수 질문 검증 (_접두사라 엔드포인트로 노출되지 않음)
// 설계: docs/2026-10-18-visa-intake-questions.md
// 화면 선택지(src/data/visaIntake.ts)와 값 목록이 같은지는 src/test/visaIntake.sync.test.ts가 보증한다.

export const VISA_INTAKE_VALUES = {
  requester: ['self', 'family-sponsor', 'company', 'other'],
  staffCount: ['1', '2-5', '6plus'],
  stayStatus: ['overseas', 'valid', 'near-expiry', 'expired', 'unsure'],
  currentStatus: ['visa-free-short', 'study', 'job-seeking', 'work', 'family-residence', 'other', 'unsure', 'declined'],
  goal: ['first-entry', 'extend', 'change', 'permanent', 'family', 'unsure'],
  stage: ['not-applied', 'waiting', 'supplement', 'denied', 'departure-notice', 'appeal-ongoing', 'unsure'],
  violation: ['none', 'past', 'current', 'unsure'],
  language: ['ko', 'en', 'zh', 'vi', 'ja', 'other'],
};

/** 비자 진단에서 넘어온 경우 물을 수 있는 목적(비자 종류는 이미 정해져 있음). */
export const GOALS_WITH_VISA_DIAGNOSIS = ['first-entry', 'extend', 'change', 'unsure'];

/** 받은 날짜와 마감일을 함께 물어야 하는 진행 단계. */
export const DATED_STAGES = ['supplement', 'denied', 'departure-notice'];

const STATUS_CODE = /^[A-Z]{1,2}-?\d{1,2}(-\d{1,2})?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

function pick(input, key) {
  const value = input[key];
  return typeof value === 'string' ? value.trim() : '';
}

function oneOf(value, list) {
  return list.includes(value) ? value : '';
}

function validDate(value) {
  if (!ISO_DATE.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function validMonth(value) {
  if (!ISO_MONTH.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

/**
 * 비자 접수 질문을 허용값으로 정리한다.
 * - 진단에서 넘어온 stayStatus·violationStatus가 있으면 그 값을 쓰고 화면 입력은 무시한다.
 * - 날짜·코드·자유 입력은 형식과 길이를 제한해 다른 개인정보가 섞이지 않게 한다.
 * - deadlineFirst: 만료·임박, 보완·불허·출국 안내, 해결 안 된 위반이 있으면 기한 우선 확인 대상.
 * @returns {{ok:true, value:object} | {ok:false, errors:string[]}}
 */
export function sanitizeVisaIntake(input, { visaDiagnosis } = {}) {
  const data = typeof input === 'object' && input !== null ? input : {};
  const errors = [];
  const V = VISA_INTAKE_VALUES;
  const diagnosisAnswers = visaDiagnosis?.answers ?? {};

  const requester = oneOf(pick(data, 'requester'), V.requester);
  if (!requester) errors.push('requester');
  const subjectNotified = data.subjectNotified === true;
  if (requester && requester !== 'self' && !subjectNotified) errors.push('subjectNotified');
  const staffCount = requester === 'company' ? oneOf(pick(data, 'staffCount'), V.staffCount) : '';

  const stayFromDiagnosis = oneOf(diagnosisAnswers.stayStatus ?? '', V.stayStatus);
  const stayStatus = stayFromDiagnosis || oneOf(pick(data, 'stayStatus'), V.stayStatus);
  if (!stayStatus) errors.push('stayStatus');
  const inKorea = stayStatus !== '' && stayStatus !== 'overseas';

  const rawExpiry = pick(data, 'expiryDate');
  const expiryDate = inKorea && rawExpiry && validDate(rawExpiry) ? rawExpiry : '';
  if (inKorea && rawExpiry && !expiryDate) errors.push('expiryDate');

  let currentStatus = '';
  let currentStatusCode = '';
  if (inKorea) {
    currentStatus = oneOf(pick(data, 'currentStatus'), V.currentStatus);
    if (!currentStatus) errors.push('currentStatus');
    if (currentStatus === 'other') {
      const code = pick(data, 'currentStatusCode').toUpperCase();
      if (code && !STATUS_CODE.test(code)) errors.push('currentStatusCode');
      else currentStatusCode = code;
    }
  }

  const goalList = visaDiagnosis ? GOALS_WITH_VISA_DIAGNOSIS : V.goal;
  const goal = oneOf(pick(data, 'goal'), goalList);
  if (!goal) errors.push('goal');
  const rawDesired = pick(data, 'desiredStatusCode').toUpperCase();
  if (rawDesired && !STATUS_CODE.test(rawDesired)) errors.push('desiredStatusCode');
  const desiredStatusCode = rawDesired && STATUS_CODE.test(rawDesired) ? rawDesired : '';

  const asksArrival = stayStatus === 'overseas' || goal === 'first-entry';
  const rawTarget = pick(data, 'targetMonth');
  let targetMonth = '';
  if (asksArrival && rawTarget) {
    if (rawTarget === 'undecided' || validMonth(rawTarget)) targetMonth = rawTarget;
    else errors.push('targetMonth');
  }

  const stage = oneOf(pick(data, 'stage'), V.stage);
  if (!stage) errors.push('stage');
  let receivedDate = '';
  let deadlineDate = '';
  if (DATED_STAGES.includes(stage)) {
    receivedDate = pick(data, 'receivedDate');
    if (!(receivedDate === 'unsure' || validDate(receivedDate))) errors.push('receivedDate');
    deadlineDate = pick(data, 'deadlineDate');
    if (!(deadlineDate === 'none' || deadlineDate === 'unsure' || validDate(deadlineDate))) errors.push('deadlineDate');
  }

  const violationFromDiagnosis = oneOf(diagnosisAnswers.violationStatus ?? '', V.violation);
  const violation = violationFromDiagnosis || oneOf(pick(data, 'violation'), V.violation);

  const language = oneOf(pick(data, 'language'), V.language);
  if (!language) errors.push('language');
  let languageOther = '';
  if (language === 'other') {
    languageOther = pick(data, 'languageOther').slice(0, 30);
    if (/\d/.test(languageOther)) errors.push('languageOther');
  }

  let nationality = '';
  if (asksArrival) {
    const raw = pick(data, 'nationality');
    if (raw && (raw.length > 40 || /[\d@]/.test(raw))) errors.push('nationality');
    else nationality = raw;
  }

  if (errors.length > 0) return { ok: false, errors };

  const deadlineFirst = ['expired', 'near-expiry'].includes(stayStatus)
    || DATED_STAGES.includes(stage)
    || violation === 'current';

  return {
    ok: true,
    value: {
      requester,
      ...(requester !== 'self' ? { subjectNotified: true } : {}),
      ...(staffCount ? { staffCount } : {}),
      stayStatus,
      ...(stayFromDiagnosis ? { stayStatusFrom: 'visaDiagnosis' } : {}),
      ...(expiryDate ? { expiryDate } : {}),
      ...(currentStatus ? { currentStatus } : {}),
      ...(currentStatusCode ? { currentStatusCode } : {}),
      goal,
      ...(desiredStatusCode ? { desiredStatusCode } : {}),
      ...(targetMonth ? { targetMonth } : {}),
      stage,
      ...(receivedDate ? { receivedDate } : {}),
      ...(deadlineDate ? { deadlineDate } : {}),
      ...(violation ? { violation } : {}),
      language,
      ...(languageOther ? { languageOther } : {}),
      ...(nationality ? { nationality } : {}),
      deadlineFirst,
    },
  };
}
