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
    // 2026-11-14 D13: 연락 버튼 누름 두 가지만 더 받는다. 번호 같은 다른 필드는 버린다.
    expect(sanitizeFunnelEvent({ event: 'contact_phone_click', domain: 'home', phone: '010-1234-5678' }))
      .toEqual({ event: 'contact_phone_click', domain: 'home', source: 'direct' });
    expect(sanitizeFunnelEvent({ event: 'contact_email_click', domain: 'visa' }))
      .toEqual({ event: 'contact_email_click', domain: 'visa', source: 'direct' });
    expect(sanitizeFunnelEvent({ event: 'contact_kakao_click', domain: 'home' })).toBeNull();
    expect(sanitizeFunnelEvent({ event: 'landing_view', domain: '홍길동' })).toBeNull();
  });

  it('개인정보·특수 키·고카디널리티 source는 other 하나로 묶는다', () => {
    expect(normalizeFunnelSource('naver')).toBe('naver');
    // 지도 장소 링크 묶음(화면 src/lib/funnel.ts funnelSourceOf)도 받는다.
    for (const place of ['naver_place', 'google_place', 'kakao_place']) expect(normalizeFunnelSource(place)).toBe(place);
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
              : cmd[1].endsWith('2026-07-24')
                ? ['consult_submit|permit|', '1', 'bogus|dui|naver', '9', 'landing_view|nowhere|naver', '3']
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

    // 날짜(KST)별 행을 그대로 내보내고, 모르는 이벤트·분야는 버리며 빈 출처는 direct로 본다.
    expect(summary).toEqual({
      days: 2,
      until: '2026-07-25',
      rows: [
        { date: '2026-07-25', event: 'landing_view', domain: 'dui', source: 'naver', count: 10 },
        { date: '2026-07-25', event: 'diagnosis_start', domain: 'dui', source: 'naver', count: 4 },
        { date: '2026-07-25', event: 'consult_view', domain: 'dui', source: 'direct', count: 2 },
        { date: '2026-07-24', event: 'consult_submit', domain: 'permit', source: 'direct', count: 1 },
      ],
    });
  });

  it('빈 요약은 기준일(KST)과 빈 행을 준다', () => {
    expect(emptyFunnelSummary(90, new Date('2026-07-25T20:00:00Z'))).toEqual({
      days: 90,
      until: '2026-07-26',
      rows: [],
    });
  });
});
