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
    if (cmd[0] === 'INCR') {
      result = Number(data.get(cmd[1]) ?? 0) + 1;
      data.set(cmd[1], String(result));
    }
    if (cmd[0] === 'EXPIRE') result = 1;
    return result;
  }

  const fetchMock = vi.fn().mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    // multi-exec 트랜잭션: 명령 배열을 순서대로 반영하고 결과 배열을 돌려준다.
    if (String(url).endsWith('/multi-exec')) {
      const results = body.map((cmd) => ({ result: apply(cmd) }));
      return { ok: true, json: async () => results };
    }
    return { ok: true, json: async () => ({ result: apply(body) }) };
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

  it('같은 IP의 11번째 인증 실패는 429이고 정상 토큰은 제한 대상이 아니다', async () => {
    stubRedis();
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const res = mockRes();
      await handler(
        { method: 'GET', headers: { origin: '', authorization: 'Bearer wrong', 'x-forwarded-for': '1.2.3.4' } },
        res,
      );
      expect(res.statusCode).toBe(401);
    }
    const limited = mockRes();
    await handler(
      { method: 'GET', headers: { origin: '', authorization: 'Bearer wrong', 'x-forwarded-for': '1.2.3.4' } },
      limited,
    );
    expect(limited.statusCode).toBe(429);

    const authorized = mockRes();
    await handler({ method: 'GET', headers: { ...AUTH, 'x-forwarded-for': '1.2.3.4' } }, authorized);
    expect(authorized.statusCode).toBe(200);
  });

  it('인증 제한 저장소가 장애여도 틀린 토큰은 401로 거부한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const res = mockRes();
    await handler({ method: 'GET', headers: { origin: '', authorization: 'Bearer wrong' } }, res);
    expect(res.statusCode).toBe(401);
  });

  it('저장소 미설정이면 500', async () => {
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('storage_not_configured');
  });

  it('GET은 완료 후 120일 지난 접수를 자동 파기해 돌려준다', async () => {
    const old = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '인허가', message: '민감 내용' },
      {},
      { id: 'JM-20260101-OLDD', now: new Date('2026-01-01T03:00:00Z') },
    );
    old.status = 'done';
    old.doneAt = '2026-01-05T03:00:00.000Z'; // 오늘(7-18) 기준 120일 초과
    const recent = buildInquiryRecord(
      { name: '김최근', phone: '010-2222-3333', topic: '국가보훈', message: '최근 문의' },
      {},
      { id: 'JM-20260717-NEWW', now: new Date('2026-07-17T03:00:00Z') },
    );
    const { data, index } = stubRedis();
    data.set('inquiry:JM-20260101-OLDD', JSON.stringify(old));
    data.set('inquiry:JM-20260717-NEWW', JSON.stringify(recent));
    index.push('JM-20260101-OLDD', 'JM-20260717-NEWW');

    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    expect(res.statusCode).toBe(200);

    const oldItem = res.body.items.find((i) => i.id === 'JM-20260101-OLDD');
    expect(oldItem.purged).toBe(true);
    expect(oldItem.name).toBeUndefined();
    const savedOld = JSON.parse(data.get('inquiry:JM-20260101-OLDD'));
    expect(savedOld.purged).toBe(true);
    expect(savedOld.phone).toBeUndefined();

    const newItem = res.body.items.find((i) => i.id === 'JM-20260717-NEWW');
    expect(newItem.purged).toBeUndefined();
    expect(newItem.name).toBe('김최근');
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
