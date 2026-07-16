import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { isAuthorized } from './admin.js';
import { buildInquiryRecord } from './_store.mjs';

describe('관리자 인증', () => {
  it('올바른 Bearer 토큰만 통과시킨다', () => {
    expect(isAuthorized('Bearer secret-token', 'secret-token')).toBe(true);
    expect(isAuthorized('Bearer wrong', 'secret-token')).toBe(false);
    expect(isAuthorized('secret-token', 'secret-token')).toBe(false); // Bearer 없음
    expect(isAuthorized(undefined, 'secret-token')).toBe(false);
  });

  it('서버에 토큰이 설정되지 않으면 항상 거부한다', () => {
    expect(isAuthorized('Bearer anything', undefined)).toBe(false);
    expect(isAuthorized('Bearer anything', '')).toBe(false);
  });
});

function mockRes() {
  const res = {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

/** Redis REST 흉내: 명령을 해석해 메모리 Map에 반영한다. */
function stubRedis(data = new Map(), index = []) {
  const fetchMock = vi.fn().mockImplementation(async (_url, options) => {
    const cmd = JSON.parse(options.body);
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
    return { ok: true, json: async () => ({ result }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return { data, index, fetchMock };
}

const AUTH = { authorization: 'Bearer test-admin-token', origin: 'http://localhost:5173' };

describe('관리자 API 핸들러', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_TOKEN', 'test-admin-token');
    vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
    vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('토큰이 없거나 틀리면 401', async () => {
    stubRedis();
    const res = mockRes();
    await handler({ method: 'GET', headers: { origin: '' } }, res);
    expect(res.statusCode).toBe(401);

    const res2 = mockRes();
    await handler({ method: 'GET', headers: { authorization: 'Bearer nope', origin: '' } }, res2);
    expect(res2.statusCode).toBe(401);
  });

  it('저장소 미설정이면 500', async () => {
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('storage_not_configured');
  });

  it('GET은 접수 목록을 돌려준다', async () => {
    const record = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '인허가', message: 'm' },
      {},
      { id: 'JM-20260717-AAAA', now: new Date('2026-07-17T03:00:00Z') },
    );
    const { data, index } = stubRedis();
    data.set('inquiry:JM-20260717-AAAA', JSON.stringify(record));
    index.push('JM-20260717-AAAA');

    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].id).toBe('JM-20260717-AAAA');
  });

  it('PATCH는 상태·메모를 반영해 저장한다', async () => {
    const record = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '인허가', message: '' },
      {},
      { id: 'JM-20260717-BBBB', now: new Date('2026-07-17T03:00:00Z') },
    );
    const { data } = stubRedis();
    data.set('inquiry:JM-20260717-BBBB', JSON.stringify(record));

    const res = mockRes();
    await handler(
      {
        method: 'PATCH',
        headers: AUTH,
        body: { id: 'JM-20260717-BBBB', status: 'in_progress', memo: '1차 전화 완료' },
      },
      res,
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.item.status).toBe('in_progress');
    expect(res.body.item.memos).toHaveLength(1);

    const saved = JSON.parse(data.get('inquiry:JM-20260717-BBBB'));
    expect(saved.status).toBe('in_progress');
  });

  it('없는 접수는 404, 잘못된 패치는 400', async () => {
    stubRedis();
    const res = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: 'JM-NOPE', status: 'done' } }, res);
    expect(res.statusCode).toBe(404);

    const record = buildInquiryRecord(
      { name: 'a', phone: '010-0000-0000', topic: '인허가', message: '' },
      {},
      { id: 'JM-X' },
    );
    const { data } = stubRedis();
    data.set('inquiry:JM-X', JSON.stringify(record));
    const res2 = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: 'JM-X', status: 'weird' } }, res2);
    expect(res2.statusCode).toBe(400);
  });

  it('DELETE는 개인정보를 파기하고 통계 필드만 남긴다', async () => {
    const record = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '국가보훈', message: '비밀' },
      {},
      { id: 'JM-20260717-CCCC', now: new Date('2026-07-17T03:00:00Z') },
    );
    const { data } = stubRedis();
    data.set('inquiry:JM-20260717-CCCC', JSON.stringify(record));

    const res = mockRes();
    await handler({ method: 'DELETE', headers: AUTH, body: { id: 'JM-20260717-CCCC' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.item.purged).toBe(true);

    const saved = JSON.parse(data.get('inquiry:JM-20260717-CCCC'));
    expect(saved.name).toBeUndefined();
    expect(saved.phone).toBeUndefined();
    expect(saved.message).toBeUndefined();
    expect(saved.topic).toBe('국가보훈');

    // 파기된 건은 재수정 불가
    const res2 = mockRes();
    await handler(
      { method: 'PATCH', headers: AUTH, body: { id: 'JM-20260717-CCCC', status: 'done' } },
      res2,
    );
    expect(res2.statusCode).toBe(409);
  });
});
