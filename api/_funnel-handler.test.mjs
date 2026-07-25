import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './funnel.js';

function response() {
  return {
    statusCode: 0,
    body: null,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

describe('퍼널 이벤트 API', () => {
  beforeEach(() => {
    vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
    vi.stubEnv('KV_REST_API_TOKEN', 'token');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('정상 이벤트를 집계하고 원문은 저장하지 않는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: 1 }, { result: 1 }],
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = response();
    await handler({
      method: 'POST',
      headers: { origin: 'http://localhost:5173', 'x-forwarded-for': '1.2.3.4' },
      body: {
        event: 'landing_view',
        domain: 'dui',
        path: '/services/dui',
        journeyId: 'abc-1234-def',
        attribution: { source: 'naver' },
        name: '홍길동',
      },
    }, res);
    expect(res.statusCode).toBe(202);
    const commands = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(JSON.stringify(commands)).not.toContain('홍길동');
    expect(JSON.stringify(commands)).not.toContain('abc-1234-def');
    expect(JSON.stringify(commands)).not.toContain('/services/dui');
  });

  it('허용되지 않은 이벤트는 400', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const res = response();
    await handler({
      method: 'POST',
      headers: { origin: '' },
      body: { event: 'phone_entered', domain: 'dui' },
    }, res);
    expect(res.statusCode).toBe(400);
  });
});
