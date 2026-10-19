// 출입국·비자 상담 접수 질문 — 설계: docs/2026-10-18-visa-intake-questions.md
// 값 목록은 api/_visa-intake.mjs와 같아야 한다(src/test/visaIntake.sync.test.ts).
// 질문은 늘 '비자를 받을 분'을 주어로 하고, 누가 문의하는지(requester)에 따라 문구만 바꾼다.

export type Requester = 'self' | 'family-sponsor' | 'company' | 'other';

export interface IntakeOption { value: string; label: string }

export interface VisaIntakeAnswers {
  requester: string;
  subjectNotified: boolean;
  staffCount: string;
  stayStatus: string;
  expiryDate: string;
  currentStatus: string;
  currentStatusCode: string;
  goal: string;
  desiredStatusCode: string;
  targetMonth: string;
  stage: string;
  receivedDate: string;
  deadlineDate: string;
  violation: string;
  language: string;
  languageOther: string;
  nationality: string;
}

export const EMPTY_VISA_INTAKE: VisaIntakeAnswers = {
  requester: '',
  subjectNotified: false,
  staffCount: '',
  stayStatus: '',
  expiryDate: '',
  currentStatus: '',
  currentStatusCode: '',
  goal: '',
  desiredStatusCode: '',
  targetMonth: '',
  stage: '',
  receivedDate: '',
  deadlineDate: '',
  violation: '',
  language: 'ko',
  languageOther: '',
  nationality: '',
};

export const REQUESTER_OPTIONS: IntakeOption[] = [
  { value: 'self', label: '제 비자 문제입니다' },
  { value: 'family-sponsor', label: '한국에 사는 가족(배우자 등)을 초청하거나 함께 살려고 합니다' },
  { value: 'company', label: '회사에서 외국인 직원을 채용하거나 관리합니다' },
  { value: 'other', label: '그 밖의 사람(지인 등)입니다' },
];

export const REQUESTER_HEADLINE: Record<Requester, string> = {
  self: '',
  'family-sponsor': '아래 질문은 초청하려는 가족(외국인) 기준으로 답해 주세요. 신청하시는 분의 정보는 적지 않으셔도 됩니다.',
  company: '아래 질문은 비자를 받을 직원 기준으로 답해 주세요. 직원이 여러 명이면 대표적인 한 명 기준으로 답하고, 나머지는 상담 내용 칸에 인원과 상황만 적어 주세요.',
  other: '아래 질문은 비자를 받을 분 기준으로 답해 주세요.',
};

export const STAFF_COUNT_OPTIONS: IntakeOption[] = [
  { value: '1', label: '1명' },
  { value: '2-5', label: '2~5명' },
  { value: '6plus', label: '6명 이상' },
];

// 비자 진단 사이트(src/data/questions.ts stayStatus)와 같은 말을 쓴다.
export const STAY_STATUS_OPTIONS: IntakeOption[] = [
  { value: 'overseas', label: '현재 해외에 있음' },
  { value: 'valid', label: '한국에 있음 · 체류기간이 유효함' },
  { value: 'near-expiry', label: '한국에 있음 · 만료가 임박함(약 2개월 이내, 사무소 안내 기준)' },
  { value: 'expired', label: '한국에 있음 · 이미 만료됨' },
  { value: 'unsure', label: '잘 모르겠음' },
];

export const CURRENT_STATUS_OPTIONS: IntakeOption[] = [
  { value: 'visa-free-short', label: '비자 없이 입국(무비자) 또는 짧은 방문(C-3·C-4)' },
  { value: 'study', label: '유학·어학연수(D-2·D-4)' },
  { value: 'job-seeking', label: '구직(D-10)' },
  { value: 'work', label: '취업(E-7·E-9·H-2 등)' },
  { value: 'family-residence', label: '결혼·거주·동포·영주(F-2·F-4·F-5·F-6)' },
  { value: 'other', label: '그 밖의 자격(코드 직접 입력)' },
  { value: 'unsure', label: '잘 모르겠음' },
  { value: 'declined', label: '답하지 않음' },
];

export const GOAL_OPTIONS: IntakeOption[] = [
  { value: 'first-entry', label: '처음 한국에 오기(비자 받기·초청)' },
  { value: 'extend', label: '지금 체류기간 늘리기(연장)' },
  { value: 'change', label: '다른 체류자격으로 바꾸기(변경)' },
  { value: 'permanent', label: '영주(F-5) 또는 귀화' },
  { value: 'family', label: '가족을 초청하거나 함께 지내기' },
  { value: 'unsure', label: '잘 모르겠음' },
];

/** 비자 진단에서 넘어오면 비자 종류는 이미 정해져 있어 이것만 묻는다(api GOALS_WITH_VISA_DIAGNOSIS). */
export const GOALS_WITH_VISA_DIAGNOSIS = ['first-entry', 'extend', 'change', 'unsure'];

export const STAGE_OPTIONS: IntakeOption[] = [
  { value: 'not-applied', label: '아직 신청 전' },
  { value: 'waiting', label: '신청하고 결과를 기다리는 중' },
  { value: 'supplement', label: '서류를 더 내라는 요청(보완)이나 출석 요청을 받음' },
  { value: 'denied', label: '허가되지 않았다(불허)는 결과를 받음' },
  { value: 'departure-notice', label: '출국하라는 안내(출국기한·출국명령)를 받음' },
  { value: 'appeal-ongoing', label: '행정심판이나 소송을 이미 하고 있음' },
  { value: 'unsure', label: '잘 모르겠음' },
];

export const DATED_STAGES = ['supplement', 'denied', 'departure-notice'];

// 비자 진단 violationStatus(none/past/current/unsure)와 같은 값. '상담 때 말씀하겠음'은 빈 값으로 보낸다.
export const VIOLATION_OPTIONS: IntakeOption[] = [
  { value: 'none', label: '없음' },
  { value: 'past', label: '예전에 있었고 끝남' },
  { value: 'current', label: '지금 해결되지 않은 문제가 있음' },
  { value: 'unsure', label: '잘 모르겠음' },
  { value: '', label: '상담 때 말씀하겠음' },
];

export const LANGUAGE_OPTIONS: IntakeOption[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ja', label: '日本語' },
  { value: 'other', label: '그 밖의 언어' },
];

/** 누가 문의하느냐에 따라 바뀌는 질문 문구. */
export function intakeWording(requester: string) {
  const company = requester === 'company';
  const family = requester === 'family-sponsor';
  const proxy = requester !== '' && requester !== 'self';
  const who = company ? '직원' : family ? '초청하려는 가족' : proxy ? '비자를 받을 분' : '';
  return {
    stay: who
      ? `${who}은 지금 어디에 있나요? 한국에 있다면 체류기간은 어떤가요?`
      : '지금 어디에 계신가요? 체류기간(한국에 머물 수 있는 기간)은 어떤가요?',
    currentStatus: who ? `${who}의 지금 체류자격(비자 종류)은 무엇인가요?` : '지금 가지고 있는 체류자격(비자 종류)은 무엇인가요?',
    goal: company ? '직원에게 어떤 절차가 필요하신가요?' : family ? '가족에게 어떤 절차가 필요하신가요?' : '무엇을 하려고 하시나요?',
    target: company ? '언제부터 근무해야 하나요?' : family ? '언제부터 함께 지내려고 하시나요?' : '언제까지 한국에 와야 하나요?',
    stage: `${proxy ? '(비자를 받을 분이) ' : ''}이미 신청했거나 출입국 기관에서 받은 연락·문서가 있나요?`,
    violation: `${proxy ? '(비자를 받을 분이) ' : ''}체류기간을 넘긴 적이 있거나, 출입국 기관에서 출국명령·과태료·범칙금 통지를 받은 적이 있나요?`,
    language: proxy ? '신청하시는 분께 어떤 언어로 연락드릴까요? (보통 한국어)' : '어떤 언어로 연락받기 편하신가요?',
    nationality: proxy ? '비자를 받을 분의 국적은 어디인가요?' : '국적은 어디인가요?',
    messageExample: company
      ? '예: 베트남 엔지니어 2명을 E-7으로 채용하려고 해요. 입사 예정은 3월이에요.'
      : family
        ? '예: 혼인신고를 마친 배우자를 F-6로 초청하려고 해요.'
        : '예: 다음 달에 체류기간이 끝나는데 회사를 옮겨야 해요.',
  };
}

/** 서버로 보낼 값 — 화면 조건에 맞지 않는 칸은 보내지 않는다. */
export function buildVisaIntakePayload(
  answers: VisaIntakeAnswers,
  diagnosisStayStatus = '',
): Record<string, string | boolean> {
  const stay = diagnosisStayStatus || answers.stayStatus;
  const inKorea = stay !== '' && stay !== 'overseas';
  const asksArrival = stay === 'overseas' || answers.goal === 'first-entry';
  const payload: Record<string, string | boolean> = {
    requester: answers.requester,
    stayStatus: answers.stayStatus,
    goal: answers.goal,
    stage: answers.stage,
    language: answers.language,
  };
  if (answers.requester && answers.requester !== 'self') payload.subjectNotified = answers.subjectNotified;
  if (answers.requester === 'company' && answers.staffCount) payload.staffCount = answers.staffCount;
  if (inKorea) {
    payload.currentStatus = answers.currentStatus;
    if (answers.expiryDate) payload.expiryDate = answers.expiryDate;
    if (answers.currentStatus === 'other' && answers.currentStatusCode) payload.currentStatusCode = answers.currentStatusCode;
  }
  if (answers.desiredStatusCode) payload.desiredStatusCode = answers.desiredStatusCode;
  if (asksArrival) {
    if (answers.targetMonth) payload.targetMonth = answers.targetMonth;
    if (answers.nationality) payload.nationality = answers.nationality;
  }
  if (DATED_STAGES.includes(answers.stage)) {
    payload.receivedDate = answers.receivedDate;
    payload.deadlineDate = answers.deadlineDate === 'date-pending' ? '' : answers.deadlineDate;
  }
  if (answers.violation) payload.violation = answers.violation;
  if (answers.language === 'other' && answers.languageOther) payload.languageOther = answers.languageOther;
  return payload;
}

/** 관리자 화면 표시용 라벨. */
export const VISA_INTAKE_LABELS: Record<string, { question: string; options?: IntakeOption[] }> = {
  requester: { question: '누구의 일', options: REQUESTER_OPTIONS },
  staffCount: { question: '처리할 직원 수', options: STAFF_COUNT_OPTIONS },
  stayStatus: { question: '체류 상태', options: STAY_STATUS_OPTIONS },
  expiryDate: { question: '체류기간 만료일' },
  currentStatus: { question: '현재 체류자격', options: CURRENT_STATUS_OPTIONS },
  currentStatusCode: { question: '현재 체류자격 코드' },
  goal: { question: '하려는 일', options: GOAL_OPTIONS },
  desiredStatusCode: { question: '원하는 체류자격' },
  targetMonth: { question: '목표 시점' },
  stage: { question: '진행 단계', options: STAGE_OPTIONS },
  receivedDate: { question: '받은 날짜' },
  deadlineDate: { question: '문서에 적힌 마감일' },
  violation: { question: '출입국 관련 기록', options: VIOLATION_OPTIONS.filter((o) => o.value) },
  language: { question: '연락 언어', options: LANGUAGE_OPTIONS },
  languageOther: { question: '그 밖의 언어' },
  nationality: { question: '국적' },
};

const SPECIAL_VALUES: Record<string, string> = { unsure: '잘 모르겠음', none: '마감일 없음', undecided: '아직 정해지지 않음' };

export function describeVisaIntake(intake: Record<string, unknown>): { key: string; question: string; answer: string }[] {
  return Object.entries(VISA_INTAKE_LABELS)
    .filter(([key]) => typeof intake[key] === 'string' && intake[key] !== '')
    .map(([key, def]) => {
      const raw = intake[key] as string;
      const option = def.options?.find((o) => o.value === raw);
      return { key, question: def.question, answer: option?.label ?? SPECIAL_VALUES[raw] ?? raw };
    });
}
