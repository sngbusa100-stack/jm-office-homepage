// 분야별 첫 회신 초안 — 접수 때 받은 답을 채워 쓰고, 이미 받은 답은 다시 묻지 않는다(GP-05).
// 설계: docs/2026-10-19-reply-draft-routing-plan.md. 홈페이지 /admin과 로컬 대기함(연동기 GET)이 같은 초안을 쓴다.
// 원칙: 결과를 예단·약속하지 않는다. 기한 날짜를 계산하지 않는다. 자동 발송하지 않는다(초안 → 행정사 검토 → 발송).
// 국적·출입국 위반 이력은 첫 회신에서 묻지도 되짚지도 않는다(두 번째 회신으로 미룸).
// 화면 번들에도 들어가므로 서버 전용 모듈(_validate 등)을 가져오지 않는다.

import LABELS from './_reply-labels.mjs';
import { isUrgent, urgentReasons } from './_urgency.mjs';

/**
 * 상담 분야 → 처리 경로. case는 로컬 행정심판 사건 유형으로 전환할 수 있는 분야, reply는 회신으로 처리하는 분야.
 * 키는 api/_validate.mjs TOPICS와 같아야 한다(테스트). 연동 계약 api/_inquiry-contract.json에도 실린다.
 */
export const TOPIC_ROUTES = {
  '음주운전 면허 구제': { route: 'case', caseType: 'driver_license' },
  '영업정지 · 행정심판': { route: 'case', caseType: 'business_suspension' },
  '인허가': { route: 'reply' },
  '출입국 · 비자': { route: 'reply' },
  '국가보훈': { route: 'reply' },
  '토지보상 · 내용증명 · 계약서': { route: 'reply' },
};

const UNANSWERED = ['unknown', 'unsure', ''];
const DATED_VISA_STAGES = ['supplement', 'denied', 'departure-notice'];
/** 접수 화면의 '누구의 일' 선택지는 고객 1인칭이라 회신에서는 사무소 표현으로 바꾼다. */
const REQUESTER_WORDING = {
  self: '본인',
  'family-sponsor': '가족 초청·동거',
  company: '회사의 외국인 직원 채용·관리',
  other: '그 밖의 분(지인 등)',
};

/*
 * 질문 항목
 * - ask: 묻는 문장
 * - from: [진단 문항 id, 되짚기 라벨, (선택) 값별 표현] 목록. 답한 문항은 되짚고, 모두 답했으면 질문을 뺀다.
 *   '모름'이면 다시 묻는다.
 * - recapOnly: 질문과 상관없이 답이 있으면 되짚는다(정확한 날짜처럼 다시 물어야 하는 항목에 쓴다).
 * - deadline: 기한 질문. 긴급 건이면 맨 앞에 둔다.
 * - when(answers): 이 조건일 때만 묻는다.
 */
export const REPLY_TEMPLATES = [
  {
    topic: '음주운전 면허 구제',
    domain: 'dui',
    intro: '음주운전 행정처분(면허 취소·정지) 관련으로 문의 주셨습니다.',
    items: [
      {
        ask: "처분 통지서를 받으신 정확한 날짜(아직 받지 않으셨다면 '아직'이라고 적어 주십시오)",
        deadline: true,
        recapOnly: [['dui-elapsed', '통지서를 받은 지']],
      },
      { ask: '받으신 처분이 면허 정지인지 취소인지', from: [['dui-disposition', '처분 종류']] },
      { ask: '단속 일시와 장소' },
      { ask: '측정된 혈중알코올농도 수치(채혈 측정 여부 포함)', from: [['dui-bac', '혈중알코올농도 구간']] },
      { ask: '최근 5년 안의 음주운전 이력', from: [['dui-history', '최근 5년 음주운전 이력']] },
      { ask: '운전이 생계에 필요한 사정(직업, 업무상 운전 필요성)', from: [['dui-livelihood', '운전의 생계 필요성']] },
      {
        ask: '이의신청·행정심판을 이미 진행하고 계신지',
        from: [['dui-procedure', '이의신청·행정심판 진행 여부', { no: '아직 진행하지 않음' }]],
      },
    ],
  },
  {
    topic: '영업정지 · 행정심판',
    domain: 'suspension',
    intro:
      '영업정지 등 행정처분 관련으로 문의 주셨습니다. 행정심판은 처분을 안 날부터 90일 이내에 청구해야 하므로(행정심판법 제27조) 통지서 수령일부터 확인이 필요합니다.',
    items: [
      {
        ask: '처분 통지서(또는 사전통지서)를 받으신 날짜',
        deadline: true,
        recapOnly: [['susp-elapsed', '확정 처분 통지를 받은 지']],
      },
      {
        ask: '사전통지서에 적힌 의견제출 기한',
        deadline: true,
        when: (a) => a['susp-stage'] === 'prenotice',
        recapOnly: [['susp-opinion-deadline', '의견제출 기한']],
      },
      {
        ask: '사전통지를 받으신 단계라면, 사전통지서에 적힌 의견제출 기한',
        deadline: true,
        when: (a) => !a['susp-stage'],
      },
      { ask: '처분 단계(사전통지를 받은 단계인지, 처분이 확정됐는지)', from: [['susp-stage', '처분 단계']] },
      { ask: '처분 내용(정지 기간 등)' },
      { ask: '처분 사유(위반 내용)', from: [['susp-reason', '처분 사유']] },
      { ask: '위반이 문제 된 당시 경위' },
      { ask: '업종과 영업 형태', from: [['susp-business', '업종']] },
      { ask: '이의신청·행정심판 등 이미 진행한 절차' },
      { ask: '영업 중단 시 예상되는 피해(직원 수, 매출 등)' },
    ],
  },
  {
    topic: '인허가',
    domain: 'permit',
    intro: '인허가 관련으로 문의 주셨습니다.',
    items: [
      { ask: '보완 요구서에 적힌 보완 기한', deadline: true, when: (a) => a['permit-stage'] === 'supplement' },
      { ask: '반려 통지서를 받으신 날짜', deadline: true, when: (a) => a['permit-stage'] === 'rejectedwithdoc' },
      { ask: '준비 중인 인허가 종류와 업종', from: [['permit-type', '인허가 종류']] },
      { ask: '사업장 소재지(관할 시·군·구)' },
      // 인허가 진단 선택지는 고객 1인칭이라 되짚을 때 사무소 표현으로 바꾼다.
      {
        ask: '사업장 확보 여부(임대차 계약 등)',
        from: [['permit-address', '사업장 확보', {
          candidate: '후보지만 정함(계약 전)',
          contracted: '임대차·매매 계약 완료',
          owned: '자가 부동산(장소 확정)',
          notyet: '아직 정하지 않음',
        }]],
      },
      {
        ask: '시설 기준과 자격·인력 요건 준비 상황',
        from: [
          ['permit-facility', '시설 기준 대조', {
            matched: '항목별 대조 완료, 모두 충족',
            gap: '대조 결과 부족한 항목 있음',
            seenonly: '기준은 확인, 시설과 대조 전',
            nowhere: '기준표 미확인',
          }],
          ['permit-staff', '자격·인력 요건', {
            ready: '요건 확인, 모두 갖춤',
            pending: '요건은 확인, 아직 갖추지 못함',
            noneneeded: '사람에 대한 요건 없음',
          }],
        ],
      },
      {
        ask: '희망하는 개업(운영 시작) 시기',
        from: [['permit-opening', '개업 예정 시기', {
          over3m: '3개월 이상 남음',
          m1to3: '1~3개월 남음',
          within1m: '1개월 이내',
          undecided: '아직 정하지 않음',
        }]],
      },
    ],
  },
  {
    topic: '출입국 · 비자',
    visa: true,
    intro: '출입국·체류자격 관련으로 문의 주셨습니다.',
  },
  {
    topic: '국가보훈',
    domain: 'veterans',
    intro: '국가보훈 등록 관련으로 문의 주셨습니다.',
    items: [
      {
        ask: '비해당 결정 통지를 받으신 날짜',
        deadline: true,
        when: (a) => a['vet-stage'] === 'rejected',
        recapOnly: [['vet-elapsed', '비해당 결정 통지를 받은 지']],
      },
      { ask: '신청 대상자와의 관계(본인 또는 유족)', from: [['vet-applicant', '신청인']] },
      { ask: '복무 기간과 소속(군별, 부대)' },
      { ask: '부상·질병의 발생 경위와 시기' },
      { ask: '진단서, 병상일지 등 의무기록 확보 여부', from: [['vet-records', '의무기록']] },
      { ask: '기존 보훈 신청·심사 이력', from: [['vet-history', '과거 등록 신청']] },
    ],
  },
  {
    topic: '토지보상 · 내용증명 · 계약서',
    intro: '토지보상·내용증명·계약서 관련으로 문의 주셨습니다. 사안 유형에 따라 절차가 달라 아래 내용을 확인 부탁드립니다.',
    items: [
      { ask: '사안 유형(토지보상 협의, 내용증명 발송, 계약서 작성·검토 중 해당 사항)' },
      { ask: '관련 문서 보유 여부(보상 통지서, 계약서 초안, 상대방 서면 등)' },
      { ask: '상대방(기관 또는 개인)과 현재 진행 상황' },
      { ask: '희망하는 처리 기한' },
    ],
  },
];

const URGENT_LINE = '기한이 지나면 진행할 수 있는 절차가 줄어들 수 있어, 날짜부터 먼저 여쭙습니다.';
const SELF_REPORTED_DEADLINE_ASK = '처분서·통지서에 적힌 기한 날짜';
const CLOSING =
  '위 내용을 알려 주시면 확인 후 진행 가능한 절차와 준비 서류를 구체적으로 안내드리겠습니다. ' +
  '사안마다 사실관계가 달라 결과를 미리 단정해 드리기는 어렵고, 확인된 내용을 기준으로 정확하게 말씀드리겠습니다. 감사합니다.';
const CLOSING_NO_QUESTIONS =
  '알려 주신 내용을 확인해 진행 가능한 절차와 준비 서류를 안내드리겠습니다. ' +
  '사안마다 사실관계가 달라 결과를 미리 단정해 드리기는 어렵고, 확인된 내용을 기준으로 정확하게 말씀드리겠습니다. 감사합니다.';

function answered(value) {
  return typeof value === 'string' && !UNANSWERED.includes(value);
}

function diagnosisLabel(domain, questionId, value) {
  return LABELS.diagnosis[domain]?.[questionId]?.options[value];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** 마감일·목표 시점 특수값의 고객용 표현(src/data/visaIntake.ts SPECIAL_VALUES와 같은 뜻). */
const SPECIAL_WORDING = { none: '마감일 없음', undecided: '아직 정하지 않음' };

/** 진단 분야 템플릿 → 질문·되짚기 목록 */
function planDiagnosis(template, record) {
  const diag = record.diagnosis?.domain === template.domain ? record.diagnosis : null;
  const answers = diag?.answers && typeof diag.answers === 'object' ? diag.answers : {};
  // 선택지 목록에 없는 옛 값은 답하지 않은 것으로 본다(되짚을 라벨이 없으므로 다시 묻는다).
  const known = (id) => answered(answers[id]) && Boolean(diagnosisLabel(template.domain, id, answers[id]));
  const recap = [];
  const asks = [];
  const recapOf = (pairs) => {
    for (const [id, label, wording] of pairs) {
      const value = answers[id];
      const text = known(id) && value !== 'na'
        ? wording?.[value] ?? diagnosisLabel(template.domain, id, value)
        : null;
      if (text) recap.push(`${label}: ${text}`);
    }
  };
  for (const item of template.items) {
    if (item.when && !item.when(answers)) continue;
    if (item.recapOnly) recapOf(item.recapOnly);
    if (item.from) {
      recapOf(item.from);
      if (item.from.every(([id]) => known(id))) continue;
    }
    asks.push({ text: item.ask, deadline: Boolean(item.deadline) });
  }
  return { recap, asks, notes: [] };
}

function visaLabel(key, value) {
  const def = LABELS.visa[key];
  return def?.options ? def.options[value] : value;
}

/** 출입국 회신 순서: 기한 → 한국/해외 → 자격 → 원하는 도움 → 관계 → 기존 신청·안내 */
function planVisa(record) {
  const v = record.visaIntake && typeof record.visaIntake === 'object' ? record.visaIntake : {};
  // 선택지가 있는 항목은 라벨이 있는 값만 답으로 본다(옛 값이면 다시 묻는다).
  const has = (key) =>
    answered(v[key]) && v[key] !== 'declined' && (!LABELS.visa[key]?.options || Boolean(visaLabel(key, v[key])));
  const urgentStay = ['near-expiry', 'expired'].includes(v.stayStatus);
  const recap = [];
  const asks = [];
  const notes = [];
  const add = (key, label, text = visaLabel(key, v[key])) => {
    if (text) recap.push(`${label}: ${text}`);
  };

  // 1. 기한
  if (DATED_VISA_STAGES.includes(v.stage)) {
    const received = ISO_DATE.test(v.receivedDate ?? '');
    const deadline = ISO_DATE.test(v.deadlineDate ?? '') || v.deadlineDate === 'none';
    if (received) add('receivedDate', '안내문을 받은 날짜', v.receivedDate);
    if (deadline) add('deadlineDate', '문서에 적힌 마감일', SPECIAL_WORDING[v.deadlineDate] ?? v.deadlineDate);
    const missing = [!deadline && '마감일', !received && '받은 날짜'].filter(Boolean);
    if (missing.length > 0) asks.push({ text: `받으신 안내문에 적힌 ${missing.join('과 ')}`, deadline: true });
    asks.push({ text: '받으신 안내문에서 요구하는 내용(예: 보완 서류 목록, 출석 일시)', deadline: true });
  } else if (!has('stage')) {
    asks.push({
      text: '출입국에서 받은 안내문(보완 요구·불허·출국 안내 등)이 있다면 그 안내문에 적힌 마감일',
      deadline: true,
    });
  }

  // 2. 한국/해외 (잘 모르겠음이면 생략하지 않는다)
  if (has('stayStatus')) {
    add('stayStatus', '체류 상태');
    if (ISO_DATE.test(v.expiryDate ?? '')) add('expiryDate', '체류기간 만료일', v.expiryDate);
    // 만료 임박·만료면 만료일이 곧 기한이다.
    else if (v.stayStatus !== 'overseas') asks.push({ text: '체류기간 만료일(외국인등록증에 적힌 날짜)', deadline: urgentStay });
  } else {
    asks.push({ text: '지금 한국에 계신지 해외에 계신지, 한국에 계시면 체류기간 만료일', deadline: false });
  }

  // 3. 자격 — 외국인등록번호는 받지 않는다. 해외 체류자는 외국인등록증이 없으므로 묻지 않는다.
  if (has('currentStatus')) {
    const code = typeof v.currentStatusCode === 'string' && v.currentStatusCode ? ` (${v.currentStatusCode})` : '';
    add('currentStatus', '현재 체류자격', `${visaLabel('currentStatus', v.currentStatus)}${code}`);
  } else if (v.currentStatus !== 'declined' && v.stayStatus !== 'overseas') {
    asks.push({ text: '현재 체류자격(외국인등록증의 체류자격 코드만, 예: E-7 — 등록번호는 적지 마십시오)', deadline: false });
  }

  // 4. 원하는 도움
  if (has('goal')) {
    add('goal', '하려는 일');
    if (has('desiredStatusCode')) add('desiredStatusCode', '원하는 체류자격', v.desiredStatusCode);
    if (has('targetMonth')) add('targetMonth', '목표 시점', SPECIAL_WORDING[v.targetMonth] ?? v.targetMonth);
  } else {
    asks.push({ text: '원하시는 일(체류기간 연장, 체류자격 변경, 가족 초청 등)', deadline: false });
  }

  // 5. 관계
  if (has('requester')) {
    add('requester', '상담 대상', REQUESTER_WORDING[v.requester] ?? visaLabel('requester', v.requester));
    if (v.requester === 'company' && has('staffCount')) add('staffCount', '처리할 직원 수');
  } else {
    asks.push({ text: '누구의 일인지(본인, 가족 초청, 회사 직원 등)', deadline: false });
  }

  // 6. 기존 신청·안내
  if (has('stage')) add('stage', '진행 단계');
  else asks.push({ text: '이미 신청하셨거나 결과를 기다리고 계신지', deadline: false });

  if (has('language') && v.language !== 'ko') {
    const language = v.language === 'other' && has('languageOther') ? v.languageOther : visaLabel('language', v.language);
    notes.push(`연락 언어: ${language} — 발송 전 번역·검수 필요`);
  }
  return { recap, asks, notes };
}

/**
 * 첫 회신 초안을 만든다. 파기됐거나 이름이 없거나 모르는 분야면 null.
 * @returns {{ text: string, notes: string[] } | null} notes는 행정사용 내부 메모(발송 본문에 넣지 않음)
 */
export function buildReplyDraft(record) {
  if (!record || record.purged || !record.name) return null;
  const template = REPLY_TEMPLATES.find((t) => t.topic === record.topic);
  if (!template) return null;
  const { office } = LABELS;

  const plan = template.visa ? planVisa(record) : planDiagnosis(template, record);
  // 고객이 기한 '급함·모름'을 골랐는데 이 분야 질문에 기한 질문이 없으면 기한 날짜부터 묻는다.
  if (urgentReasons(record).includes('selfReported') && !plan.asks.some((a) => a.deadline)) {
    plan.asks.unshift({ text: SELF_REPORTED_DEADLINE_ASK, deadline: true });
  }
  const urgent = isUrgent(record) && plan.asks.some((a) => a.deadline);
  const asks = urgent
    ? [...plan.asks.filter((a) => a.deadline), ...plan.asks.filter((a) => !a.deadline)]
    : plan.asks;

  const lines = [
    `${record.name} 님, 안녕하세요. ${office.name} 대표 행정사 ${office.representative}입니다.`,
    `접수번호 ${record.id} 상담 신청 확인했습니다.`,
    '',
  ];
  if (urgent) lines.push(URGENT_LINE, '');
  lines.push(template.intro, '');
  if (plan.recap.length > 0) {
    lines.push('접수 때 알려 주신 내용(서류로 확인하기 전입니다)은 다음과 같습니다.');
    lines.push(...plan.recap.map((r) => `- ${r}`), '');
  }
  if (asks.length > 0) {
    lines.push('정확한 안내를 위해 아래 내용을 알려 주십시오.');
    lines.push(...asks.map((a, i) => `${i + 1}) ${a.text}`), '');
    lines.push(CLOSING);
  } else {
    lines.push(CLOSING_NO_QUESTIONS);
  }
  lines.push('', `${office.name} 대표 행정사 ${office.representative}`, `전화 ${office.phone} · 이메일 ${office.email}`);
  return { text: lines.join('\n'), notes: plan.notes };
}
