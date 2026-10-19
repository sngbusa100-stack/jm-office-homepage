import { describe, expect, it } from 'vitest';
import { findForbidden } from '../scripts/forbidden-phrases.mjs';
import { REPLY_TEMPLATES, TOPIC_ROUTES, buildReplyDraft } from './_reply-draft.mjs';
import { TOPICS } from './_validate.mjs';

function record(topic, overrides = {}) {
  return {
    id: 'JM-20261020-AB12',
    receivedAt: '2026-10-20T01:00:00.000Z',
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'hong@example.com',
    topic,
    message: '상담 내용 비밀 문장',
    status: 'new',
    ...overrides,
  };
}

/** 번호 매긴 질문 줄만 뽑는다. */
function questions(text) {
  return text.split('\n').filter((line) => /^\d+\) /.test(line));
}

describe('분야별 처리 경로', () => {
  it('상담 분야 6개 모두 경로와 회신 템플릿이 있다', () => {
    expect(Object.keys(TOPIC_ROUTES).sort()).toEqual([...TOPICS].sort());
    expect(REPLY_TEMPLATES.map((t) => t.topic).sort()).toEqual([...TOPICS].sort());
  });

  it('음주운전·영업정지만 사건 전환, 나머지 4개는 회신 처리다', () => {
    expect(TOPIC_ROUTES['음주운전 면허 구제']).toEqual({ route: 'case', caseType: 'driver_license' });
    expect(TOPIC_ROUTES['영업정지 · 행정심판']).toEqual({ route: 'case', caseType: 'business_suspension' });
    for (const topic of ['인허가', '출입국 · 비자', '국가보훈', '토지보상 · 내용증명 · 계약서']) {
      expect(TOPIC_ROUTES[topic]).toEqual({ route: 'reply' });
    }
  });
});

describe('회신 초안 공통', () => {
  it('대표 행정사 인사와 사무실 전화·이메일 서명을 넣고, 이름·접수번호 외 개인정보는 넣지 않는다', () => {
    const { text } = buildReplyDraft(record('인허가'));
    const lines = text.split('\n');
    expect(lines[0]).toBe('홍길동 님, 안녕하세요. 정명 행정사사무소 대표 행정사 정재훈입니다.');
    expect(lines[1]).toBe('접수번호 JM-20261020-AB12 상담 신청 확인했습니다.');
    expect(text).toContain('정명 행정사사무소 대표 행정사 정재훈\n전화 02-897-6251 · 이메일 sngbusa10@naver.com');
    for (const secret of ['010-1234-5678', 'hong@example.com', '상담 내용 비밀 문장']) {
      expect(text).not.toContain(secret);
    }
  });

  it('파기됐거나 이름이 없거나 모르는 분야면 초안을 만들지 않는다', () => {
    expect(buildReplyDraft(record('인허가', { purged: true }))).toBeNull();
    expect(buildReplyDraft(record('인허가', { name: '' }))).toBeNull();
    expect(buildReplyDraft(record('없는 분야'))).toBeNull();
    expect(buildReplyDraft(null)).toBeNull();
  });

  it('모든 분야 초안에 금지 표현이 없다(답변이 없을 때·있을 때 모두)', () => {
    for (const template of REPLY_TEMPLATES) {
      const plain = buildReplyDraft(record(template.topic)).text;
      expect(findForbidden(plain), template.topic).toEqual([]);
    }
    const answered = buildReplyDraft(record('출입국 · 비자', { visaIntake: FULL_VISA })).text;
    expect(findForbidden(answered)).toEqual([]);
  });
});

describe('이미 받은 답은 다시 묻지 않는다(GP-05)', () => {
  it('진단 답변이 없으면 기본 질문을 모두 묻는다', () => {
    const qs = questions(buildReplyDraft(record('음주운전 면허 구제')).text);
    expect(qs.some((q) => q.includes('혈중알코올농도'))).toBe(true);
    expect(qs.some((q) => q.includes('음주운전 이력'))).toBe(true);
  });

  it('답한 문항은 "알려 주신 내용"으로 되짚고 질문에서 뺀다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: {
        domain: 'dui',
        answers: { 'dui-bac': 'mid', 'dui-history': 'none', 'dui-elapsed': 'within30' },
        counts: { ready: 2, official: 1 },
      },
    }));
    expect(text).toContain('접수 때 알려 주신 내용(서류로 확인하기 전입니다)');
    expect(text).toContain('- 혈중알코올농도 구간: 0.08% 이상 ~ 0.1% 미만');
    expect(text).toContain('- 최근 5년 음주운전 이력: 없음 (이번이 처음)');
    const qs = questions(text);
    expect(qs.some((q) => q.includes('혈중알코올농도'))).toBe(false);
    expect(qs.some((q) => q.includes('음주운전 이력'))).toBe(false);
  });

  it('여러 문항을 묶은 질문은 답한 부분을 되짚고, 하나라도 모르면 질문은 남긴다', () => {
    const { text } = buildReplyDraft(record('인허가', {
      diagnosis: { domain: 'permit', answers: { 'permit-facility': 'gap', 'permit-staff': 'unknown' }, counts: {} },
    }));
    expect(text).toContain('- 시설 기준 대조: 대조 결과 부족한 항목 있음');
    expect(text).not.toContain('자격·인력 요건: 있는지 없는지 모른다');
    expect(questions(text).some((q) => q.includes('시설 기준과 자격·인력 요건'))).toBe(true);
  });

  it('되짚는 말은 행정사가 고객에게 쓰는 표현으로 바꾼다', () => {
    const dui = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-procedure': 'no' }, counts: {} },
    })).text;
    expect(dui).toContain('- 이의신청·행정심판 진행 여부: 아직 진행하지 않음');
    const visa = buildReplyDraft(record('출입국 · 비자', { visaIntake: FULL_VISA })).text;
    expect(visa).toContain('- 상담 대상: 본인');
    expect(visa).not.toContain('제 비자 문제입니다');
  });

  it('인허가 진단의 1인칭 선택지는 사무소 표현으로 되짚는다', () => {
    const { text } = buildReplyDraft(record('인허가', {
      diagnosis: { domain: 'permit', answers: { 'permit-address': 'contracted', 'permit-opening': 'undecided' }, counts: {} },
    }));
    expect(text).toContain('- 사업장 확보: 임대차·매매 계약 완료');
    expect(text).toContain('- 개업 예정 시기: 아직 정하지 않음');
    expect(text).not.toContain('계약을 했다');
  });

  it('선택지 목록에 없는 옛 값은 답하지 않은 것으로 보고 다시 묻는다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-bac': 'retired-option' }, counts: {} },
    }));
    expect(questions(text).some((q) => q.includes('혈중알코올농도'))).toBe(true);
    const visa = buildReplyDraft(record('출입국 · 비자', { visaIntake: { ...FULL_VISA, goal: 'retired-goal' } })).text;
    expect(questions(visa).some((q) => q.includes('원하시는 일'))).toBe(true);
  });

  it('"모름"으로 답한 문항은 다시 묻는다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-bac': 'unknown' }, counts: {} },
    }));
    expect(text).not.toContain('혈중알코올농도 구간: 모름');
    expect(questions(text).some((q) => q.includes('혈중알코올농도'))).toBe(true);
  });

  it('정확한 날짜는 진단에서 기간 구간만 받았어도 다시 묻는다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-elapsed': 'within30' }, counts: {} },
    }));
    expect(questions(text).some((q) => q.includes('통지서를 받으신 정확한 날짜'))).toBe(true);
  });

  it('다른 분야의 진단은 쓰지 않는다', () => {
    const { text } = buildReplyDraft(record('인허가', {
      diagnosis: { domain: 'dui', answers: { 'dui-bac': 'mid' }, counts: {} },
    }));
    expect(text).not.toContain('혈중알코올농도');
  });
});

describe('기한 우선', () => {
  it('긴급 건은 인사 다음에 기한 안내를 두고 날짜 질문을 맨 앞에 둔다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-elapsed': 'd60to90' }, counts: { urgent: 1 } },
    }));
    const lines = text.split('\n');
    expect(lines[3]).toBe('기한이 지나면 진행할 수 있는 절차가 줄어들 수 있어, 날짜부터 먼저 여쭙습니다.');
    expect(questions(text)[0]).toContain('통지서를 받으신 정확한 날짜');
  });

  it('긴급이 아니면 기한 안내 문장이 없다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제'));
    expect(text).not.toContain('날짜부터 먼저 여쭙습니다');
  });

  it('기한 날짜를 계산해 적지 않는다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', { visaIntake: { ...FULL_VISA, deadlineFirst: true } }));
    expect(text).not.toMatch(/\d+일 (남|이내에 청구)/);
  });
});

describe('영업정지', () => {
  it('사전통지 단계면 의견제출 기한을 묻고, 확정 처분이면 묻지 않는다', () => {
    const prenotice = buildReplyDraft(record('영업정지 · 행정심판', {
      diagnosis: { domain: 'suspension', answers: { 'susp-stage': 'prenotice' }, counts: {} },
    })).text;
    expect(questions(prenotice).some((q) => q.includes('의견제출 기한'))).toBe(true);

    const confirmed = buildReplyDraft(record('영업정지 · 행정심판', {
      diagnosis: { domain: 'suspension', answers: { 'susp-stage': 'confirmed' }, counts: {} },
    })).text;
    expect(questions(confirmed).some((q) => q.includes('의견제출 기한'))).toBe(false);
  });

  it('진단이 없으면 사전통지 단계인 경우를 전제로 의견제출 기한을 묻는다', () => {
    const { text } = buildReplyDraft(record('영업정지 · 행정심판'));
    expect(questions(text).some((q) => q.includes('사전통지를 받으신 단계라면'))).toBe(true);
  });
});

const FULL_VISA = {
  requester: 'self',
  stayStatus: 'near-expiry',
  expiryDate: '2026-11-30',
  currentStatus: 'work',
  currentStatusCode: 'E-7',
  goal: 'extend',
  stage: 'not-applied',
  violation: 'past',
  nationality: '베트남',
  language: 'vi',
};

describe('출입국·비자', () => {
  it('접수 질문이 없으면 기한 → 한국/해외 → 자격 → 원하는 도움 → 관계 → 기존 신청 순서로 묻는다', () => {
    const qs = questions(buildReplyDraft(record('출입국 · 비자')).text);
    const order = ['마감일', '한국에 계신지', '체류자격', '원하시는 일', '누구의 일', '이미 신청'];
    const positions = order.map((word) => qs.findIndex((q) => q.includes(word)));
    expect(positions.every((p) => p >= 0), JSON.stringify(qs)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('국적과 위반 이력은 첫 회신에서 묻지도 되짚지도 않는다', () => {
    const empty = buildReplyDraft(record('출입국 · 비자')).text;
    const full = buildReplyDraft(record('출입국 · 비자', { visaIntake: FULL_VISA })).text;
    for (const text of [empty, full]) {
      expect(text).not.toContain('국적');
      expect(text).not.toContain('위반');
      expect(text).not.toContain('출입국 관련 기록');
    }
    expect(full).not.toContain('베트남');
  });

  it('받은 답은 되짚고, 연락 언어가 한국어가 아니면 내부 메모로 번역 검수를 알린다', () => {
    const draft = buildReplyDraft(record('출입국 · 비자', { visaIntake: FULL_VISA }));
    expect(draft.text).toContain('- 체류기간 만료일: 2026-11-30');
    expect(draft.text).toContain('- 현재 체류자격: 취업(E-7·E-9·H-2 등) (E-7)');
    expect(draft.text).toContain('- 하려는 일: 지금 체류기간 늘리기(연장)');
    expect(questions(draft.text).some((q) => q.includes('체류자격'))).toBe(false);
    expect(draft.notes).toContain('연락 언어: Tiếng Việt — 발송 전 번역·검수 필요');
    expect(draft.text).not.toContain('Tiếng Việt');
  });

  it('해외에 있는 고객에게는 외국인등록증 체류자격을 묻지 않는다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', {
      visaIntake: { requester: 'self', stayStatus: 'overseas', goal: 'first-entry', stage: 'not-applied', language: 'ko' },
    }));
    expect(text).not.toContain('외국인등록증');
  });

  it('목표 시점이 미정이면 영어 값 대신 "아직 정하지 않음"으로 적는다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', { visaIntake: { ...FULL_VISA, targetMonth: 'undecided' } }));
    expect(text).toContain('- 목표 시점: 아직 정하지 않음');
    expect(text).not.toContain('undecided');
  });

  it('만료 임박인데 만료일을 모르고 기한 우선이면 만료일 질문을 맨 앞에 둔다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', {
      visaIntake: { ...FULL_VISA, stayStatus: 'near-expiry', expiryDate: 'unsure', deadlineFirst: true },
    }));
    expect(text).toContain('날짜부터 먼저 여쭙습니다');
    expect(questions(text)[0]).toContain('체류기간 만료일');
  });

  it('마감일이 없다고 답했거나 받은 날짜를 이미 적었으면 다시 묻지 않는다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', {
      visaIntake: { ...FULL_VISA, stage: 'supplement', receivedDate: '2026-10-15', deadlineDate: 'none' },
    }));
    expect(text).toContain('- 문서에 적힌 마감일: 마감일 없음');
    expect(text).toContain('- 안내문을 받은 날짜: 2026-10-15');
    expect(questions(text).some((q) => q.includes('마감일') || q.includes('받은 날짜'))).toBe(false);
    expect(questions(text)[0]).toContain('안내문에서 요구하는 내용');
  });

  it('"잘 모르겠음"으로 답한 체류 상태는 한국/해외 질문을 다시 한다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', {
      visaIntake: { ...FULL_VISA, stayStatus: 'unsure', expiryDate: '' },
    }));
    expect(questions(text).some((q) => q.includes('한국에 계신지'))).toBe(true);
  });

  it('마감일이 있는 안내를 받았으면 마감일을 되짚고 긴급이면 맨 앞에 둔다', () => {
    const { text } = buildReplyDraft(record('출입국 · 비자', {
      visaIntake: {
        ...FULL_VISA, stage: 'supplement', receivedDate: '2026-10-15', deadlineDate: '2026-10-29', deadlineFirst: true,
      },
    }));
    expect(text).toContain('- 문서에 적힌 마감일: 2026-10-29');
    expect(text).toContain('날짜부터 먼저 여쭙습니다');
    expect(questions(text)[0]).toContain('안내문');
  });
});
