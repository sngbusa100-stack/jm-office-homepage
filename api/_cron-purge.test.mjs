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

const CRON_REQ = { method: 'GET', headers: { authorization: 'Bearer cron-secret' } };

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', 'cron-secret');
  vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
  vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
  vi.stubEnv('TELEGRAM_BOT_TOKEN', 'bot-token');
  vi.stubEnv('TELEGRAM_CHAT_ID', 'chat-id');
  vi.stubEnv('CONSULT_OPEN', 'false');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Redis REST와 Telegram을 흉내 낸다. 보낸 Telegram 본문은 sent에 쌓인다. */
function stubServices(records, { lastSeen = null, redisDown = false, telegramOk = true } = {}) {
  const sent = [];
  const fetch = vi.fn(async (url, init) => {
    if (String(url).startsWith('https://api.telegram.org/')) {
      sent.push({ url: String(url), body: JSON.parse(init.body) });
      return { ok: telegramOk, json: async () => ({ ok: telegramOk }) };
    }
    if (redisDown) throw new Error('redis down');
    const command = JSON.parse(init.body);
    if (String(url).endsWith('/multi-exec')) {
      for (const [name, key, value] of command) {
        if (name === 'SET') records.set(key.replace('inquiry:', ''), JSON.parse(value));
      }
      return { ok: true, json: async () => command.map(() => ({ result: 'OK' })) };
    }
    const [name, ...args] = command;
    if (name === 'ZRANGE') return { ok: true, json: async () => ({ result: [...records.keys()] }) };
    if (name === 'MGET') {
      const result = args.map((key) => JSON.stringify(records.get(key.replace('inquiry:', ''))));
      return { ok: true, json: async () => ({ result }) };
    }
    if (name === 'GET' && args[0] === 'connector:lastSeenAt') {
      return { ok: true, json: async () => ({ result: lastSeen }) };
    }
    throw new Error(`unsupported:${name}`);
  });
  vi.stubGlobal('fetch', fetch);
  return { sent };
}

function sampleRecords() {
  const oldDone = {
    id: 'JM-OLD', schemaVersion: 2, receivedAt: '2026-01-01T00:00:00.000Z',
    doneAt: '2026-01-10T00:00:00.000Z', status: 'done', topic: '음주운전 면허 구제',
    name: '삭제대상', phone: '010-0000-0000', memos: [],
  };
  const fresh = {
    id: 'JM-FRESH', schemaVersion: 2, receivedAt: '2026-07-18T22:00:00.000Z',
    status: 'new', topic: '출입국 · 비자', name: '유지', phone: '010-1111-1111', memos: [],
    pulledAt: '2026-07-18T22:30:00.000Z',
  };
  return new Map([['JM-FRESH', fresh], ['JM-OLD', oldDone]]);
}

describe('보존기간 자동 파기 cron', () => {
  it('GET과 올바른 cron 인증만 허용한다', async () => {
    const { sent } = stubServices(new Map());
    const wrongMethod = responseRecorder();
    await handler({ method: 'POST', headers: {} }, wrongMethod);
    expect(wrongMethod.statusCode).toBe(405);

    const unauthorized = responseRecorder();
    await handler({ method: 'GET', headers: {} }, unauthorized);
    expect(unauthorized.statusCode).toBe(401);
    expect(sent).toHaveLength(0);
  });

  it('전체 목록에서 120일 지난 완료 건만 파기한다', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T00:00:00.000Z'));
    const records = sampleRecords();
    stubServices(records, { lastSeen: '2026-07-18T23:45:00.000Z' });
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, scanned: 2, purged: 1, failed: [], summarySent: true });
    expect(records.get('JM-OLD').purged).toBe(true);
    expect(records.get('JM-OLD').name).toBeUndefined();
    expect(records.get('JM-FRESH').name).toBe('유지');
  });
});

describe('매일 아침 운영 요약', () => {
  it('파기 뒤 같은 대화방으로 요약을 보내고 개인정보는 넣지 않는다', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T00:00:00.000Z')); // 7/19(일) 09:00 KST
    const { sent } = stubServices(sampleRecords(), { lastSeen: '2026-07-18T23:45:00.000Z' });
    const res = responseRecorder();
    await handler(CRON_REQ, res);

    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe('https://api.telegram.org/botbot-token/sendMessage');
    expect(sent[0].body.chat_id).toBe('chat-id');
    const text = sent[0].body.text;
    expect(text.split('\n')[0]).toBe('[정명 운영 요약] 7/19(일) 09:00 — 이상 없음');
    expect(text).toContain('미처리 1건');
    expect(text).toContain('연동기 마지막 접속 7/19 08:45 (15분 전)');
    expect(text).toContain('자동 파기 오늘 1건 (실패 0)');
    expect(text).toContain('상담 접수: 닫힘(개업 전)');
    for (const secret of ['삭제대상', '유지', '010-0000-0000', '010-1111-1111']) {
      expect(text).not.toContain(secret);
    }
  });

  it('저장소 연결에 실패하면 경고를 보내고 502로 답한다', async () => {
    const { sent } = stubServices(new Map(), { redisDown: true });
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(502);
    expect(res.body).toMatchObject({ ok: false, error: 'storage_error', summarySent: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].body.text).toContain('저장소(Upstash) 연결 실패');
  });

  it('저장소 설정이 없어도 경고를 보낸다', async () => {
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    const { sent } = stubServices(new Map());
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({ ok: false, error: 'storage_not_configured', summarySent: true });
    expect(sent[0].body.text).toContain('저장소(Upstash) 연결 실패');
  });

  it('연동기 접속 시각을 읽지 못해도 파기와 요약은 진행한다', async () => {
    const records = sampleRecords();
    const { sent } = stubServices(records);
    const inner = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      if (!String(url).startsWith('https://api.telegram.org/')) {
        const command = JSON.parse(init.body);
        if (command[0] === 'GET') throw new Error('redis get failed');
      }
      return inner(url, init);
    }));
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(200);
    expect(records.get('JM-OLD').purged).toBe(true);
    expect(sent[0].body.text).toContain('⚠️ 연동기 접속 시각 조회 실패(저장소)');
  });

  it('파기 저장에 실패하면 요약에 실패 건수를 싣고 502로 답한다', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T00:00:00.000Z'));
    const records = sampleRecords();
    const { sent } = stubServices(records, { lastSeen: '2026-07-18T23:45:00.000Z' });
    const inner = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      if (String(url).endsWith('/multi-exec')) throw new Error('redis write failed');
      return inner(url, init);
    }));
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(502);
    expect(res.body).toMatchObject({ ok: false, purged: 0, failed: ['JM-OLD'], summarySent: true });
    expect(records.get('JM-OLD').purged).toBeUndefined();
    expect(sent[0].body.text).toContain('⚠️ 자동 파기 오늘 0건 (실패 1)');
    expect(sent[0].body.text).not.toContain('JM-OLD');
  });

  it('Telegram 요청에는 제한시간을 건다', async () => {
    const { sent } = stubServices(sampleRecords());
    const calls = [];
    const inner = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      if (String(url).startsWith('https://api.telegram.org/')) calls.push(init);
      return inner(url, init);
    }));
    await handler(CRON_REQ, responseRecorder());
    expect(sent).toHaveLength(1);
    expect(calls[0].signal).toBeInstanceOf(AbortSignal);
  });

  it('Telegram 발송이 실패하면 파기는 유지하고 502로 답한다', async () => {
    const records = sampleRecords();
    stubServices(records, { telegramOk: false });
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(502);
    expect(res.body).toMatchObject({ ok: false, purged: 1, summarySent: false });
    expect(records.get('JM-OLD').purged).toBe(true);
  });

  it('Telegram 설정이 없으면 파기만 하고 502로 답한다', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');
    const records = sampleRecords();
    const { sent } = stubServices(records);
    const res = responseRecorder();
    await handler(CRON_REQ, res);
    expect(res.statusCode).toBe(502);
    expect(res.body).toMatchObject({ ok: false, purged: 1, summarySent: false, summaryError: 'telegram_not_configured' });
    expect(sent).toHaveLength(0);
    expect(records.get('JM-OLD').purged).toBe(true);
  });
});
