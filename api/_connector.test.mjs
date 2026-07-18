import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './connector.js';
import { applyConnectorAck, buildInquiryRecord } from './_store.mjs';

const NOW = new Date('2026-07-19T03:00:00.000Z');

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

/** Redis REST 흉내 — 단일 명령과 multi-exec 트랜잭션 모두 처리. */
function stubRedis(data = new Map(), index = []) {
  function apply(cmd) {
    let result = null;
    if (cmd[0] === 'GET') result = data.get(cmd[1]) ?? null;
    if (cmd[0] === 'SET') {
      data.set(cmd[1], cmd[2]);
      result = 'OK';
    }
    if (cmd[0] === 'ZADD') {
      if (!index.includes(cmd[3])) index.push(cmd[3]);
      result = 1;
    }
    if (cmd[0] === 'ZRANGE') result = [...index].reverse();
    if (cmd[0] === 'MGET') result = cmd.slice(1).map((k) => data.get(k) ?? null);
    return result;
  }
  const fetchMock = vi.fn().mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url).endsWith('/multi-exec')) {
      return { ok: true, json: async () => body.map((cmd) => ({ result: apply(cmd) })) };
    }
    return { ok: true, json: async () => ({ result: apply(body) }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return { data, index };
}

const AUTH = { authorization: 'Bearer connector-secret' };

const value = { name: '홍길동', phone: '010-1234-5678', topic: '음주운전 면허 구제', message: 'm' };

describe('연동기 ACK 로직', () => {
  it('pulledAt과 localCaseId를 기록하고 원본은 바꾸지 않는다', () => {
    const record = buildInquiryRecord(value, {}, { now: NOW });
    const result = applyConnectorAck(record, 'CASE-2026-0001', NOW);
    expect(result.ok).toBe(true);
    expect(result.value.pulledAt).toBe(NOW.toISOString());
    expect(result.value.localCaseId).toBe('CASE-2026-0001');
    expect(record.pulledAt).toBeUndefined();
  });

  it('이미 ACK된 레코드는 멱등으로 그대로 돌려준다', () => {
    const record = buildInquiryRecord(value, {}, { now: NOW });
    const first = applyConnectorAck(record, 'CASE-2026-0001', NOW);
    const second = applyConnectorAck(first.value, 'CASE-2026-9999', NOW);
    expect(second.ok).toBe(true);
    expect(second.already).toBe(true);
    expect(second.value.localCaseId).toBe('CASE-2026-0001'); // 최초 값 유지
  });

  it('파기된 레코드와 빈 localCaseId를 거부한다', () => {
    const record = buildInquiryRecord(value, {}, { now: NOW });
    expect(applyConnectorAck({ ...record, purged: true }, 'C', NOW).errors).toContain('purged');
    expect(applyConnectorAck(record, '  ', NOW).errors).toContain('local_case_id');
  });
});

describe('연동기 API 핸들러', () => {
  beforeEach(() => {
    vi.stubEnv('CONNECTOR_TOKEN', 'connector-secret');
    vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
    vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('토큰이 없거나 틀리면 401 (ADMIN_TOKEN으로도 불가)', async () => {
    stubRedis();
    const res = mockRes();
    await handler({ method: 'GET', headers: {} }, res);
    expect(res.statusCode).toBe(401);

    vi.stubEnv('ADMIN_TOKEN', 'admin-secret');
    const res2 = mockRes();
    await handler({ method: 'GET', headers: { authorization: 'Bearer admin-secret' } }, res2);
    expect(res2.statusCode).toBe(401);
  });

  it('GET은 미pull·미파기 접수만 돌려준다', async () => {
    const fresh = buildInquiryRecord(value, {}, { id: 'JM-1', now: NOW });
    const pulled = {
      ...buildInquiryRecord(value, {}, { id: 'JM-2', now: NOW }),
      pulledAt: NOW.toISOString(),
    };
    const purged = { ...buildInquiryRecord(value, {}, { id: 'JM-3', now: NOW }), purged: true };
    const { data, index } = stubRedis();
    data.set('inquiry:JM-1', JSON.stringify(fresh));
    data.set('inquiry:JM-2', JSON.stringify(pulled));
    data.set('inquiry:JM-3', JSON.stringify(purged));
    index.push('JM-1', 'JM-2', 'JM-3');

    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.items.map((i) => i.id)).toEqual(['JM-1']);
  });

  it('PATCH는 ACK를 저장하고, 재시도는 멱등 성공한다', async () => {
    const record = buildInquiryRecord(value, {}, { id: 'JM-1', now: NOW });
    const { data } = stubRedis();
    data.set('inquiry:JM-1', JSON.stringify(record));

    const res = mockRes();
    await handler(
      { method: 'PATCH', headers: AUTH, body: { id: 'JM-1', localCaseId: 'CASE-2026-0001' } },
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.item.pulledAt).toBeTruthy();
    expect(JSON.parse(data.get('inquiry:JM-1')).localCaseId).toBe('CASE-2026-0001');

    const res2 = mockRes();
    await handler(
      { method: 'PATCH', headers: AUTH, body: { id: 'JM-1', localCaseId: 'CASE-2026-0002' } },
      res2,
    );
    expect(res2.statusCode).toBe(200);
    expect(res2.body.already).toBe(true);
    expect(JSON.parse(data.get('inquiry:JM-1')).localCaseId).toBe('CASE-2026-0001');
  });

  it('DELETE는 파기하고, 이미 파기된 건은 멱등 성공한다', async () => {
    const record = buildInquiryRecord(value, {}, { id: 'JM-1', now: NOW });
    const { data } = stubRedis();
    data.set('inquiry:JM-1', JSON.stringify(record));

    const res = mockRes();
    await handler({ method: 'DELETE', headers: AUTH, body: { id: 'JM-1' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.item.purged).toBe(true);
    expect(JSON.parse(data.get('inquiry:JM-1')).name).toBeUndefined();

    const res2 = mockRes();
    await handler({ method: 'DELETE', headers: AUTH, body: { id: 'JM-1' } }, res2);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.already).toBe(true);
  });

  it('없는 접수는 404, id 누락은 400', async () => {
    stubRedis();
    const res = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: 'JM-NOPE', localCaseId: 'C' } }, res);
    expect(res.statusCode).toBe(404);

    const res2 = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: {} }, res2);
    expect(res2.statusCode).toBe(400);
  });
});
