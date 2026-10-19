import { afterEach, describe, expect, it, vi } from 'vitest';

// 회신 초안 계산이 예외를 내도 연동기 GET(접수 수집)은 멈추지 않아야 한다.
vi.mock('./_reply-draft.mjs', () => ({
  buildReplyDraft: () => {
    throw new Error('label drift');
  },
}));

const { default: handler } = await import('./connector.js');
const { buildInquiryRecord } = await import('./_store.mjs');

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('연동기 GET 회신 초안 보호', () => {
  it('초안 계산이 실패해도 접수 목록은 돌려주고 초안은 null로 둔다', async () => {
    vi.stubEnv('CONNECTOR_TOKEN', 'connector-secret');
    vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
    vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
    const record = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '인허가', message: 'm' },
      {},
      { id: 'JM-1', now: new Date('2026-10-20T00:00:00.000Z') },
    );
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      const cmd = JSON.parse(options.body);
      let result = 'OK';
      if (cmd[0] === 'ZRANGE') result = ['JM-1'];
      if (cmd[0] === 'MGET') result = [JSON.stringify(record)];
      return { ok: true, json: async () => ({ result }) };
    }));
    const res = { statusCode: 0, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
    await handler({ method: 'GET', headers: { authorization: 'Bearer connector-secret' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].replyDraft).toBeNull();
  });
});
