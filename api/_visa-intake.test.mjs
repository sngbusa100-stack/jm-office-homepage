import { describe, expect, it } from 'vitest';
import { sanitizeVisaIntake } from './_visa-intake.mjs';
import { validateConsultPayload, formatTelegramMessage } from './_validate.mjs';

const base = {
  requester: 'self',
  stayStatus: 'valid',
  currentStatus: 'work',
  goal: 'change',
  stage: 'not-applied',
  language: 'ko',
};

const consult = {
  name: '홍길동',
  phone: '010-1234-5678',
  topic: '출입국 · 비자',
  message: '',
  consent: true,
  company: '',
};

const e7Diagnosis = {
  schemaVersion: 1,
  visaSlug: 'e7',
  language: 'vi',
  consent: true,
  answers: {
    stayStatus: 'near-expiry',
    violationStatus: 'past',
    e7Occupation: 'confirmed',
    e7Contract: 'ready',
    e7Wage: 'meets',
  },
};

describe('비자 접수 필수 질문 검증', () => {
  it('국내 본인 문의의 필수 답만으로 통과하고 기한 우선 표시는 꺼진다', () => {
    const result = sanitizeVisaIntake(base);
    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({ requester: 'self', stayStatus: 'valid', currentStatus: 'work', deadlineFirst: false });
    expect(result.value).not.toHaveProperty('subjectNotified');
  });

  it.each(['requester', 'stayStatus', 'goal', 'stage', 'language'])('필수 %s가 없으면 거부한다', (key) => {
    const result = sanitizeVisaIntake({ ...base, [key]: '' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain(key);
  });

  it('잘 모르겠음은 필수 질문의 정상 답이다', () => {
    const result = sanitizeVisaIntake({ ...base, stayStatus: 'unsure', currentStatus: 'unsure', goal: 'unsure', stage: 'unsure' });
    expect(result.ok).toBe(true);
  });

  it('한국에 있으면 현재 체류자격이 필수이고, 해외면 묻지 않는다', () => {
    expect(sanitizeVisaIntake({ ...base, currentStatus: '' }).errors).toContain('currentStatus');
    const overseas = sanitizeVisaIntake({ ...base, stayStatus: 'overseas', currentStatus: 'work', expiryDate: '2027-01-01' });
    expect(overseas.ok).toBe(true);
    expect(overseas.value).not.toHaveProperty('currentStatus');
    expect(overseas.value).not.toHaveProperty('expiryDate');
  });

  it('본인이 아니면 당사자에게 알렸다는 확인이 있어야 한다', () => {
    expect(sanitizeVisaIntake({ ...base, requester: 'company' }).errors).toContain('subjectNotified');
    const ok = sanitizeVisaIntake({ ...base, requester: 'company', subjectNotified: true, staffCount: '2-5' });
    expect(ok.ok).toBe(true);
    expect(ok.value).toMatchObject({ subjectNotified: true, staffCount: '2-5' });
  });

  it('직원 수는 회사 문의에서만 저장한다', () => {
    const result = sanitizeVisaIntake({ ...base, staffCount: '6plus' });
    expect(result.value).not.toHaveProperty('staffCount');
  });

  it('보완·불허·출국 안내는 받은 날짜와 마감일(모름 허용)이 필수이고 기한 우선으로 표시된다', () => {
    expect(sanitizeVisaIntake({ ...base, stage: 'denied' }).errors).toEqual(expect.arrayContaining(['receivedDate', 'deadlineDate']));
    const result = sanitizeVisaIntake({ ...base, stage: 'departure-notice', receivedDate: '2026-10-10', deadlineDate: 'unsure' });
    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({ receivedDate: '2026-10-10', deadlineDate: 'unsure', deadlineFirst: true });
  });

  it('만료·임박과 해결 안 된 위반도 기한 우선으로 표시한다', () => {
    expect(sanitizeVisaIntake({ ...base, stayStatus: 'expired' }).value.deadlineFirst).toBe(true);
    expect(sanitizeVisaIntake({ ...base, stayStatus: 'near-expiry' }).value.deadlineFirst).toBe(true);
    expect(sanitizeVisaIntake({ ...base, violation: 'current' }).value.deadlineFirst).toBe(true);
    expect(sanitizeVisaIntake({ ...base, violation: 'past' }).value.deadlineFirst).toBe(false);
  });

  it('없는 날짜·잘못된 코드·숫자가 든 국적은 거부해 다른 정보가 섞이지 않게 한다', () => {
    expect(sanitizeVisaIntake({ ...base, expiryDate: '2026-02-30' }).errors).toContain('expiryDate');
    expect(sanitizeVisaIntake({ ...base, currentStatus: 'other', currentStatusCode: '123456-1234567' }).errors).toContain('currentStatusCode');
    expect(sanitizeVisaIntake({ ...base, goal: 'first-entry', nationality: 'M12345678' }).errors).toContain('nationality');
  });

  it('국적과 목표 입국 시점은 해외이거나 처음 오는 경우에만 저장한다', () => {
    const domestic = sanitizeVisaIntake({ ...base, nationality: '베트남', targetMonth: '2027-03' });
    expect(domestic.value).not.toHaveProperty('nationality');
    expect(domestic.value).not.toHaveProperty('targetMonth');
    const first = sanitizeVisaIntake({ ...base, stayStatus: 'overseas', goal: 'first-entry', nationality: '베트남', targetMonth: '2027-03' });
    expect(first.value).toMatchObject({ nationality: '베트남', targetMonth: '2027-03' });
  });

  it('비자 진단 값이 있으면 체류 상태·위반 이력은 진단 값을 쓰고, 목적은 처음·연장·변경만 허용한다', () => {
    const result = sanitizeVisaIntake(
      { ...base, stayStatus: 'valid', violation: 'none', goal: 'extend' },
      { visaDiagnosis: e7Diagnosis },
    );
    expect(result.value).toMatchObject({ stayStatus: 'near-expiry', stayStatusFrom: 'visaDiagnosis', violation: 'past', deadlineFirst: true });
    expect(sanitizeVisaIntake({ ...base, goal: 'permanent' }, { visaDiagnosis: e7Diagnosis }).errors).toContain('goal');
  });
});

describe('상담 접수에 비자 질문 연결', () => {
  it('출입국·비자 분야는 비자 질문 없이는 접수하지 않는다', () => {
    const result = validateConsultPayload(consult);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('visaIntake');
  });

  it('출입국·비자 분야는 검증된 비자 질문을 함께 담는다', () => {
    const result = validateConsultPayload({ ...consult, visaIntake: base });
    expect(result.ok).toBe(true);
    expect(result.value.visaIntake).toMatchObject({ requester: 'self', goal: 'change' });
  });

  it('다른 분야에 붙은 비자 질문은 버린다', () => {
    const result = validateConsultPayload({ ...consult, topic: '인허가', visaIntake: base });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('visaIntake');
  });

  it('비자 분야에 붙어 온 기한 자가 응답은 버린다(비자는 접수 질문이 따로 있다)', () => {
    const result = validateConsultPayload({ ...consult, visaIntake: base, deadlineReport: 'soon' });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('deadlineReport');
  });

  it('텔레그램 알림에는 비자 답변을 싣지 않고 기한 우선 표시만 한 줄 남긴다', () => {
    const text = formatTelegramMessage({ ...consult, visaIntake: { ...base, nationality: '베트남' } }, { inquiryId: 'JM-1', urgentReasons: ['visaIntake'] });
    expect(text).toContain('기한 우선 확인');
    expect(text).not.toContain('베트남');
    expect(text).not.toContain('work');
  });
});
