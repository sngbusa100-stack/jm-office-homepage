import { describe, expect, it } from 'vitest';
import { findForbidden } from '../scripts/forbidden-phrases.mjs';
import LABELS from './_reply-labels.mjs';
import { REPLY_TEMPLATES, SPECIFIC_TEMPLATES, TOPIC_ROUTES, buildReplyDraft } from './_reply-draft.mjs';
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
    expect(text).toContain('정명 행정사사무소 대표 행정사 정재훈\n전화 02-899-1849 · 이메일 jungmyungoffice@naver.com');
    for (const secret of ['010-1234-5678', 'hong@example.com', '상담 내용 비밀 문장']) {
      expect(text).not.toContain(secret);
    }
  });

  it('마무리는 긍정형 다짐 한 문장이고 결과를 단정할 수 없다는 면책 문장은 쓰지 않는다(2026-11-23 주인님)', () => {
    for (const template of REPLY_TEMPLATES) {
      const { text } = buildReplyDraft(record(template.topic));
      expect(text, template.topic).toContain(
        '말씀해 주신 사정을 바탕으로 가장 좋은 결과가 나올 수 있는 길을 함께 찾겠습니다. 감사합니다.',
      );
      expect(text, template.topic).not.toMatch(/단정|어렵고/);
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
    expect(text).toContain('- 혈중알코올농도 구간: 0.08% 이상 ~ 0.1% 이하');
    expect(text).toContain('- 최근 5년 음주운전 이력: 없음');
    const qs = questions(text);
    expect(qs.some((q) => q.includes('혈중알코올농도'))).toBe(false);
    expect(qs.some((q) => q.includes('음주운전 이력'))).toBe(false);
  });

  it('여러 문항을 묶은 질문은 답한 부분을 되짚고, 하나라도 모르면 질문은 남긴다', () => {
    const { text } = buildReplyDraft(record('인허가', {
      diagnosis: { domain: 'permit', answers: { 'permit-facility-advice': 'pending', 'permit-personnel-advice': 'unknown' }, counts: {} },
    }));
    expect(text).toContain('- 시설 관련 안내: 안내받은 작업이 남아 있음');
    expect(text).not.toContain('- 교육·자격·직원 서류:');
    expect(questions(text).some((q) => q.includes('시설과 교육·자격·직원 서류'))).toBe(true);
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
    expect(text).toContain('- 사업장 확보: 이번에 쓸 장소를 새로 계약함');
    expect(text).toContain('- 시작·변경 희망 시기: 아직 정하지 않음');
    expect(text).not.toContain('새로 계약했어요');
  });

  it('선택지 목록에 없는 옛 값은 답하지 않은 것으로 보고 다시 묻는다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-bac': 'retired-option' }, counts: {} },
    }));
    expect(questions(text).some((q) => q.includes('혈중알코올농도'))).toBe(true);
    const visa = buildReplyDraft(record('출입국 · 비자', { visaIntake: { ...FULL_VISA, goal: 'retired-goal' } })).text;
    expect(questions(visa).some((q) => q.includes('원하시는 일'))).toBe(true);
  });

  it('옛 혈중알코올농도 답 high(0.1% 이상)는 새 구간(0.1% 초과)으로 읽지 않고 수치를 다시 묻는다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-bac': 'high' }, counts: {} },
    }));
    expect(text).not.toContain('0.1% 초과');
    expect(questions(text).some((q) => q.includes('혈중알코올농도'))).toBe(true);
  });

  it('이의신청 결과를 받은 고객에게는 결과 통보일과 결과 전 행정심판 청구 여부를 묻고, 아니면 묻지 않는다', () => {
    const ask = '이의신청 결과를 통보받으신 정확한 날짜';
    const result = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-procedure': 'objection-result' }, counts: {} },
    })).text;
    expect(questions(result).some((q) => q.includes(ask) && q.includes('행정심판을 이미 청구하셨는지'))).toBe(true);
    expect(result).toContain('- 이의신청·행정심판 진행 여부: 이의신청 결과를 받음');
    const pending = buildReplyDraft(record('음주운전 면허 구제', {
      diagnosis: { domain: 'dui', answers: { 'dui-procedure': 'objection' }, counts: {} },
    })).text;
    expect(questions(pending).some((q) => q.includes(ask))).toBe(false);
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

  it("고객이 기한 '급함·모름'을 고른 분야에 기한 질문이 없으면 기한 날짜를 첫 질문으로 묻는다", () => {
    const { text } = buildReplyDraft(record('토지보상 · 내용증명 · 계약서', { deadlineReport: 'soon' }));
    expect(text).toContain('날짜부터 먼저 여쭙습니다');
    expect(questions(text)[0]).toBe('1) 처분서·통지서에 적힌 기한 날짜');
    const permit = buildReplyDraft(record('인허가', { deadlineReport: 'unknown' })).text;
    expect(questions(permit)[0]).toBe('1) 처분서·통지서에 적힌 기한 날짜');
  });

  it('기한 질문이 이미 있는 분야는 자가 응답으로 질문을 늘리지 않고 그 질문을 앞에 둔다', () => {
    const { text } = buildReplyDraft(record('음주운전 면허 구제', { deadlineReport: 'soon' }));
    expect(text).not.toContain('처분서·통지서에 적힌 기한 날짜');
    expect(text).toContain('날짜부터 먼저 여쭙습니다');
    expect(questions(text)[0]).toContain('통지서를 받으신 정확한 날짜');
  });

  it("기한 자가 응답이 '여유 있음'·'통지서 없음'이면 긴급 회신이 아니다", () => {
    for (const deadlineReport of ['later', 'none']) {
      const { text } = buildReplyDraft(record('토지보상 · 내용증명 · 계약서', { deadlineReport }));
      expect(text).not.toContain('날짜부터 먼저 여쭙습니다');
      expect(text).not.toContain('처분서·통지서에 적힌 기한 날짜');
    }
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

describe('되짚기 문구는 사무소 말투다(2026-11-27)', () => {
  const templates = [...REPLY_TEMPLATES.filter((t) => t.domain), ...Object.values(SPECIFIC_TEMPLATES)];
  const pairs = templates.flatMap((t) =>
    t.items.flatMap((item) => [...(item.from ?? []), ...(item.recapOnly ?? [])].map((pair) => [t.domain, ...pair])),
  );

  it('되짚는 문항과 값별 표현은 지금 진단에 있는 문항·보기만 가리킨다', () => {
    for (const [domain, id, , wording] of pairs) {
      const options = LABELS.diagnosis[domain]?.[id]?.options;
      expect(options, `${domain}/${id}`).toBeTruthy();
      for (const value of Object.keys(wording ?? {})) {
        // 통지 경과 기간 표현은 세 진단이 함께 쓰므로 그 진단에 없는 값이 섞여 있다.
        if (id.endsWith('-elapsed')) continue;
        expect(options, `${domain}/${id}/${value}`).toHaveProperty(value);
      }
    }
  });

  it('고객이 고른 보기를 고객 말투("~했어요", "제 일") 그대로 되짚지 않는다', () => {
    for (const [domain, id, label, wording] of pairs) {
      for (const [value, optionLabel] of Object.entries(LABELS.diagnosis[domain][id].options)) {
        if (['unknown', 'unsure', 'na'].includes(value)) continue;
        const text = `${label}: ${wording?.[value] ?? optionLabel}`;
        expect(text, `${domain}/${id}/${value}`).not.toMatch(/(?<!필|중|수)요$|: 제 /);
      }
    }
  });

  it('행정구제 진단 답은 사무소 말투로 되짚는다', () => {
    const { text } = buildReplyDraft(record('영업정지 · 행정심판', {
      diagnosis: { domain: 'appeal', answers: { 'appeal-stage': 'decision' } },
    }));
    expect(text).toContain('- 현재 상황: 거절·취소·환수 등 결정 통지를 받음');
    expect(text).not.toContain('받았어요');
  });

  it('공공조달 진단 답은 고객 말투 보기 대신 제도명으로 되짚는다(2026-11-28)', () => {
    const { text } = buildReplyDraft(record('인허가', {
      diagnosis: { domain: 'procurement', answers: { 'procurement-topic': 'production' } },
    }));
    expect(text).toContain('- 준비할 업무: 직접생산확인');
    expect(text).not.toContain('받고 싶어요');
  });
});

describe('문항 판이 다른 옛 접수 기록(2026-11-27)', () => {
  it('같은 ID라도 뜻이 바뀌었을 수 있어 되짚지 않고 다시 묻는다', () => {
    const diagnosis = { domain: 'dui', answers: { 'dui-history': 'none' } };
    const current = buildReplyDraft(record('음주운전 면허 구제', { diagnosis })).text;
    expect(current).toContain('- 최근 5년 음주운전 이력: 없음');
    const old = buildReplyDraft(record('음주운전 면허 구제', { diagnosis: { ...diagnosis, form: 'old-form' } })).text;
    expect(old).not.toContain('최근 5년 음주운전 이력:');
    expect(questions(old).some((q) => q.includes('최근 5년 안의 음주운전 이력'))).toBe(true);
  });

  it('지금 판 표시가 붙은 기록은 되짚는다', () => {
    const form = LABELS.brief.checks.dui.form;
    const text = buildReplyDraft(record('음주운전 면허 구제', { diagnosis: { domain: 'dui', form, answers: { 'dui-history': 'none' } } })).text;
    expect(text).toContain('- 최근 5년 음주운전 이력: 없음');
  });
});
