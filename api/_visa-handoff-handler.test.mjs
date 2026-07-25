import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './visa-handoff.js';

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

describe('비자 진단 일회 전달 API', () => {
  beforeEach(() => {
    vi.stubEnv('CONSULT_OPEN', 'true');
    vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
    vi.stubEnv('KV_REST_API_TOKEN', 'token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('서버에서 다시 검증한 답변만 30분 토큰으로 저장한다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ result: 1 }, { result: 1 }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: 'OK' }) });
    vi.stubGlobal('fetch', fetchMock);
    const res = response();
    await handler({
      method: 'POST',
      headers: { origin: 'http://localhost:5173', 'x-forwarded-for': '1.2.3.4' },
      body: completeE7,
    }, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toMatch(/^[A-Za-z0-9_-]{20,80}$/);
    const setCommand = JSON.parse(fetchMock.mock.calls[1][1].body);
    const stored = JSON.parse(setCommand[2]);
    expect(stored).toMatchObject({
      visaSlug: 'e7',
      level: 'checked',
      questionCount: 5,
      consent: true,
    });
    expect(stored).not.toHaveProperty('name');
  });

  it('토큰은 부작용 없는 POST 요청 안에서 GETDEL로 한 번 소비하고 두 번째에는 404를 반환한다', async () => {
    const stored = JSON.stringify({
      ...completeE7,
      level: 'checked',
      questionCount: 5,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: stored }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: null }) });
    vi.stubGlobal('fetch', fetchMock);

    const first = response();
    await handler({
      method: 'POST',
      headers: { origin: 'http://localhost:5173' },
      body: { action: 'consume', token: 'abcdefghijklmnopqrstuvwx' },
    }, first);
    expect(first.statusCode).toBe(200);
    expect(first.headers['Cache-Control']).toBe('no-store, private');

    const second = response();
    await handler({
      method: 'POST',
      headers: { origin: 'http://localhost:5173' },
      body: { action: 'consume', token: 'abcdefghijklmnopqrstuvwx' },
    }, second);
    expect(second.statusCode).toBe(404);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)[0]).toBe('GETDEL');
  });

  it('접수 비활성·무동의·잘못된 토큰을 거부한다', async () => {
    vi.stubEnv('CONSULT_OPEN', 'false');
    const closed = response();
    await handler({ method: 'POST', headers: { origin: '' }, body: completeE7 }, closed);
    expect(closed.statusCode).toBe(503);

    vi.stubEnv('CONSULT_OPEN', 'true');
    vi.stubGlobal('fetch', vi.fn());
    const invalid = response();
    await handler({
      method: 'POST',
      headers: { origin: '' },
      body: { ...completeE7, consent: false },
    }, invalid);
    expect(invalid.statusCode).toBe(400);

    const badToken = response();
    await handler({
      method: 'POST',
      headers: { origin: '' },
      body: { action: 'consume', token: '../secret' },
    }, badToken);
    expect(badToken.statusCode).toBe(400);

    const get = response();
    await handler({ method: 'GET', headers: { origin: '' }, query: {} }, get);
    expect(get.statusCode).toBe(405);
    expect(get.headers['Cache-Control']).toBe('no-store, private');
  });
});
