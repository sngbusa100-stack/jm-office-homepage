import { describe, expect, it, vi } from 'vitest';
import {
  createFunnelStore,
  emptyFunnelSummary,
  normalizeFunnelSource,
  sanitizeFunnelEvent,
} from './_funnel.mjs';

describe('개인정보 없는 퍼널 집계 저장소', () => {
  it('허용 이벤트·분야와 정규화된 유입 출처만 통과시킨다', () => {
    expect(sanitizeFunnelEvent({
      event: 'diagnosis_start',
      domain: 'dui',
      path: '/check/dui',
      journeyId: 'abc-1234-def',
      attribution: { source: 'naver', medium: 'blog', name: '홍길동' },
      phone: '010-1234-5678',
    })).toEqual({
      event: 'diagnosis_start',
      domain: 'dui',
      source: 'naver',
    });
    expect(sanitizeFunnelEvent({ event: 'phone_entered', domain: 'dui' })).toBeNull();
    expect(sanitizeFunnelEvent({ event: 'landing_view', domain: '홍길동' })).toBeNull();
  });

  it('개인정보·특수 키·고카디널리티 source는 other 하나로 묶는다', () => {
    expect(normalizeFunnelSource('naver')).toBe('naver');
    expect(normalizeFunnelSource('person@example.com')).toBe('other');
    expect(normalizeFunnelSource('01012345678')).toBe('other');
    expect(normalizeFunnelSource('__proto__')).toBe('other');
    expect(normalizeFunnelSource('constructor')).toBe('other');
    expect(normalizeFunnelSource('random-campaign-123')).toBe('other');
  });

  it('일별 해시를 한 번에 읽어 이벤트·분야·유입별로 집계한다', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url, options) => {
      const body = JSON.parse(options.body);
      if (String(url).endsWith('/multi-exec')) {
        return { ok: true, json: async () => body.map(() => ({ result: 1 })) };
      }
      if (String(url).endsWith('/pipeline')) {
        return {
          ok: true,
          json: async () => body.map((cmd) => ({
            result: cmd[1].endsWith('2026-07-25')
              ? ['landing_view|dui|naver', '10', 'diagnosis_start|dui|naver', '4', 'consult_view|dui|direct', '2']
              : [],
          })),
        };
      }
      throw new Error('unexpected');
    });
    const store = createFunnelStore({ url: 'https://redis.test', token: 'x' }, fetchMock);
    await store.increment(
      { event: 'landing_view', domain: 'dui', source: 'naver' },
      new Date('2026-07-25T01:00:00Z'),
    );
    const summary = await store.summary(2, new Date('2026-07-25T12:00:00Z'));

    expect(summary.totals).toMatchObject({ landing_view: 10, diagnosis_start: 4, consult_view: 2 });
    expect(summary.byDomain.dui).toMatchObject({ landing_view: 10, diagnosis_start: 4, consult_view: 2 });
    expect(summary.bySource).toMatchObject({ naver: 14, direct: 2 });
    expect(Object.getPrototypeOf(summary.bySource)).toBeNull();
    expect(summary.days).toBe(2);
  });

  it('빈 요약은 모든 공개 단계가 0이다', () => {
    expect(emptyFunnelSummary(30).totals).toMatchObject({
      landing_view: 0,
      diagnosis_start: 0,
      diagnosis_complete: 0,
      consult_view: 0,
      consult_submit: 0,
    });
  });
});
