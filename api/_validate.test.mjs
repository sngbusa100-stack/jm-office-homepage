import { describe, expect, it } from 'vitest';
import { TOPICS, formatTelegramMessage, sanitizeDiagnosis, validateConsultPayload } from './_validate.mjs';

const valid = {
  name: '홍길동',
  phone: '010-1234-5678',
  topic: TOPICS[0],
  message: '음주운전 셀프 진단 후 문의드립니다.',
  consent: true,
  company: '',
};

describe('상담 접수 검증', () => {
  it('정상 입력을 통과시키고 값을 정리한다', () => {
    const result = validateConsultPayload({ ...valid, name: '  홍길동  ' });
    expect(result.ok).toBe(true);
    expect(result.value.name).toBe('홍길동');
  });

  it('허니팟이 채워지면 spam으로 분류한다', () => {
    const result = validateConsultPayload({ ...valid, company: 'http://spam' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('spam');
  });

  it.each([
    ['name', { name: '' }],
    ['phone', { phone: '123' }],
    ['topic', { topic: '없는 분야' }],
    ['consent', { consent: false }],
    ['message', { message: 'a'.repeat(2001) }],
  ])('%s 오류를 잡는다', (field, patch) => {
    const result = validateConsultPayload({ ...valid, ...patch });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain(field);
  });

  it('객체가 아닌 본문도 안전하게 처리한다', () => {
    expect(validateConsultPayload(null).ok).toBe(false);
    expect(validateConsultPayload('문자열').ok).toBe(false);
  });

  it('진단·유입경로가 있으면 정리해 담고, 없으면 필드를 만들지 않는다', () => {
    const withExtras = validateConsultPayload({
      ...valid,
      diagnosis: { domain: 'dui', answers: { q1: 'a' }, counts: { urgent: 1 } },
      sourcePath: '/check/dui/result',
      utmSource: 'naver_blog',
    });
    expect(withExtras.ok).toBe(true);
    expect(withExtras.value.diagnosis).toEqual({ domain: 'dui', answers: { q1: 'a' }, counts: { urgent: 1 } });
    expect(withExtras.value.sourcePath).toBe('/check/dui/result');
    expect(withExtras.value.utmSource).toBe('naver_blog');

    const without = validateConsultPayload(valid);
    expect(without.ok).toBe(true);
    expect(without.value).not.toHaveProperty('diagnosis');
    expect(without.value).not.toHaveProperty('sourcePath');
    expect(without.value).not.toHaveProperty('utmSource');
  });

  it('이메일은 선택이며, 입력 시 형식 오류를 잡고 정상이면 담는다', () => {
    expect(validateConsultPayload(valid).ok).toBe(true); // 이메일 없이 유효
    expect(validateConsultPayload(valid).value).not.toHaveProperty('email');

    const withEmail = validateConsultPayload({ ...valid, email: 'a@b.co' });
    expect(withEmail.ok).toBe(true);
    expect(withEmail.value.email).toBe('a@b.co');

    const bad = validateConsultPayload({ ...valid, email: '이상한값' });
    expect(bad.ok).toBe(false);
    expect(bad.errors).toContain('email');
  });

  it('손상된 진단 데이터는 접수를 막지 않고 제외한다', () => {
    const result = validateConsultPayload({ ...valid, diagnosis: '이상한 값' });
    expect(result.ok).toBe(true);
    expect(result.value).not.toHaveProperty('diagnosis');
  });
});

describe('진단 데이터 정리', () => {
  it('도메인 없는 입력은 null이다', () => {
    expect(sanitizeDiagnosis(null)).toBeNull();
    expect(sanitizeDiagnosis({})).toBeNull();
    expect(sanitizeDiagnosis({ answers: { q: 'a' } })).toBeNull();
  });

  it('답변 40개·문자열 60자 상한을 적용한다', () => {
    const answers = Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`q${i}`, 'x'.repeat(100)]),
    );
    const result = sanitizeDiagnosis({ domain: 'dui', answers, counts: {} });
    expect(Object.keys(result.answers)).toHaveLength(40);
    expect(Object.values(result.answers)[0]).toHaveLength(60);
  });

  it('counts는 알려진 등급의 유한 음이 아닌 수만 남긴다', () => {
    const result = sanitizeDiagnosis({
      domain: 'dui',
      answers: {},
      counts: { urgent: 2, documents: -1, official: Infinity, ready: 3.7, weird: 5 },
    });
    expect(result.counts).toEqual({ urgent: 2, ready: 3 });
  });

  it('문자열이 아닌 답변 값은 건너뛴다', () => {
    const result = sanitizeDiagnosis({ domain: 'dui', answers: { q1: 'ok', q2: 7, q3: null } });
    expect(result.answers).toEqual({ q1: 'ok' });
  });
});

describe('텔레그램 메시지 포맷', () => {
  const sample = { name: '홍길동', phone: '010-1234-5678', topic: TOPICS[0], message: '문의합니다' };

  it('정상 저장 시 개인정보(이름·연락처·분야·내용) 없이 접수번호만 알린다', () => {
    const text = formatTelegramMessage(sample, {
      origin: 'https://example.com',
      inquiryId: 'JM-20260718-AB12',
    });
    expect(text).toContain('새 상담 접수');
    expect(text).toContain('접수번호: JM-20260718-AB12');
    expect(text).toContain('관리자 화면');
    expect(text).not.toContain('홍길동');
    expect(text).not.toContain('010-1234-5678');
    expect(text).not.toContain(TOPICS[0]);
    expect(text).not.toContain('문의합니다');
    expect(text).not.toContain('https://example.com');
  });

  it('긴급 진단 항목이 있으면 긴급 표시 줄을 넣는다', () => {
    const urgent = formatTelegramMessage(sample, { inquiryId: 'JM-1', urgent: true });
    expect(urgent).toContain('긴급 확인 항목');
    const normal = formatTelegramMessage(sample, { inquiryId: 'JM-1' });
    expect(normal).not.toContain('긴급 확인 항목');
  });

  it('저장 실패 시에는 유실 방지를 위해 경고와 전체 내용을 담는다', () => {
    const failed = formatTelegramMessage(sample, {
      inquiryId: 'JM-20260718-AB12',
      storeError: true,
      origin: 'https://example.com',
    });
    expect(failed).toContain('저장 실패');
    expect(failed).toContain('접수번호: JM-20260718-AB12');
    expect(failed).toContain('홍길동');
    expect(failed).toContain('010-1234-5678');
    expect(failed).toContain(TOPICS[0]);
    expect(failed).toContain('문의합니다');
    expect(failed).toContain('https://example.com');
  });

  it('저장 실패 폴백에서 내용이 비면 상담 내용 줄을 생략한다', () => {
    const text = formatTelegramMessage(
      { name: 'a', phone: 'b', topic: 'c', message: '' },
      { storeError: true },
    );
    expect(text).not.toContain('상담 내용');
  });
});
