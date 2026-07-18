import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './cron-purge.js';

function responseRecorder() {
  return {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', 'cron-secret');
  vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
  vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('보존기간 자동 파기 cron', () => {
  it('GET과 올바른 cron 인증만 허용한다', async () => {
    const wrongMethod = responseRecorder();
    await handler({ method: 'POST', headers: {} }, wrongMethod);
    expect(wrongMethod.statusCode).toBe(405);

    const unauthorized = responseRecorder();
    await handler({ method: 'GET', headers: {} }, unauthorized);
    expect(unauthorized.statusCode).toBe(401);
  });

  it('전체 목록에서 120일 지난 완료 건만 파기한다', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T00:00:00.000Z'));
    const oldDone = {
      id: 'JM-OLD', schemaVersion: 2, receivedAt: '2026-01-01T00:00:00.000Z',
      doneAt: '2026-01-10T00:00:00.000Z', status: 'done', topic: '음주운전 면허 구제',
      name: '삭제대상', phone: '010-0000-0000', memos: [],
    };
    const fresh = {
      id: 'JM-FRESH', schemaVersion: 2, receivedAt: '2026-07-01T00:00:00.000Z',
      status: 'new', topic: '출입국 · 비자', name: '유지', phone: '010-1111-1111', memos: [],
    };
    const records = new Map([['JM-OLD', oldDone], ['JM-FRESH', fresh]]);
    const fetch = vi.fn(async (url, init) => {
      const command = JSON.parse(init.body);
      if (String(url).endsWith('/multi-exec')) {
        for (const [name, key, value] of command) {
          if (name === 'SET') records.set(key.replace('inquiry:', ''), JSON.parse(value));
        }
        return { ok: true, json: async () => command.map(() => ({ result: 'OK' })) };
      }
      const [name, ...args] = command;
      if (name === 'ZRANGE') return { ok: true, json: async () => ({ result: ['JM-FRESH', 'JM-OLD'] }) };
      if (name === 'MGET') {
        const result = args.map((key) => JSON.stringify(records.get(key.replace('inquiry:', ''))));
        return { ok: true, json: async () => ({ result }) };
      }
      throw new Error(`unsupported:${name}`);
    });
    vi.stubGlobal('fetch', fetch);
    const res = responseRecorder();
    await handler({ method: 'GET', headers: { authorization: 'Bearer cron-secret' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, scanned: 2, purged: 1, failed: [] });
    expect(records.get('JM-OLD').purged).toBe(true);
    expect(records.get('JM-OLD').name).toBeUndefined();
    expect(records.get('JM-FRESH').name).toBe('유지');
  });
});
