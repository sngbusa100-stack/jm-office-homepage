import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createVisaHandoffStore,
  sanitizeVisaHandoff,
  VISA_QUESTION_OPTIONS,
} from './_visa-handoff.mjs';

const contract = JSON.parse(
  readFileSync(join(process.cwd(), 'api', '_visa-handoff-contract.json'), 'utf8'),
);

const completeE7 = {
  schemaVersion: 1,
  visaSlug: 'e7',
  language: 'ko',
  consent: true,
  answers: {
    stayStatus: 'valid',
    violationStatus: 'none',
    e7Occupation: 'confirmed',
    e7Contract: 'ready',
    e7Wage: 'meets',
  },
};

describe('비자 진단 일회성 전달', () => {
  it('서버 검증 규격이 버전된 배포 계약과 같다', () => {
    expect(contract.schemaVersion).toBe(1);
    expect(VISA_QUESTION_OPTIONS).toEqual(contract.questions);
  });

  it('비자별 문항·선택지를 서버 규격으로 다시 검증하고 결과 수준을 계산한다', () => {
    expect(sanitizeVisaHandoff(completeE7)).toMatchObject({
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'ko',
      level: 'checked',
      questionCount: 5,
    });
    expect(sanitizeVisaHandoff({
      ...completeE7,
      answers: { ...completeE7.answers, stayStatus: 'expired' },
    }).level).toBe('urgent');
  });

  it('동의가 없거나 문항 누락·임의 문자열이 있으면 거부한다', () => {
    expect(sanitizeVisaHandoff({ ...completeE7, consent: false })).toBeNull();
    expect(sanitizeVisaHandoff({
      ...completeE7,
      answers: { stayStatus: 'valid' },
    })).toBeNull();
    expect(sanitizeVisaHandoff({
      ...completeE7,
      answers: { ...completeE7.answers, e7Wage: '홍길동' },
    })).toBeNull();
  });

  it('30분 TTL로 저장하고 GETDEL로 한 번만 소비한다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: 'OK' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: JSON.stringify({ visaSlug: 'e7' }) }) });
    const store = createVisaHandoffStore({ url: 'https://redis.test', token: 'x' }, fetchMock);
    await store.save('token-1234567890', { visaSlug: 'e7' });
    expect(await store.consume('token-1234567890')).toEqual({ visaSlug: 'e7' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
      'SET',
      'visa-handoff:token-1234567890',
      JSON.stringify({ visaSlug: 'e7' }),
      'NX',
      'EX',
      '1800',
    ]);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual([
      'GETDEL',
      'visa-handoff:token-1234567890',
    ]);
  });
});
