import { describe, expect, it } from 'vitest';
import { TOPICS, formatTelegramMessage, validateConsultPayload } from './_validate.mjs';

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
});

describe('텔레그램 메시지 포맷', () => {
  it('이름·연락처·분야·내용을 담는다', () => {
    const text = formatTelegramMessage(
      { name: '홍길동', phone: '010-1234-5678', topic: TOPICS[0], message: '문의합니다' },
      { origin: 'https://example.com' },
    );
    expect(text).toContain('새 상담 신청');
    expect(text).toContain('홍길동');
    expect(text).toContain('010-1234-5678');
    expect(text).toContain(TOPICS[0]);
    expect(text).toContain('문의합니다');
    expect(text).toContain('https://example.com');
  });

  it('내용이 비면 상담 내용 줄을 생략한다', () => {
    const text = formatTelegramMessage({ name: 'a', phone: 'b', topic: 'c', message: '' });
    expect(text).not.toContain('상담 내용');
  });
});
