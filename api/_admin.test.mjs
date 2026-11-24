import { scryptSync } from 'node:crypto';
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

  it('모든 응답에 no-store·Vary: Origin·nosniff를 붙이고 github.io 출처는 허용하지 않는다', async () => {
    stubRedis();
    const res = mockRes();
    await handler({ method: 'GET', headers: { origin: 'https://sngbusa100-stack.github.io' } }, res);
    expect(res.headers['Cache-Control']).toBe('no-store');
    expect(res.headers['Vary']).toBe('Origin');
    expect(res.headers['X-Content-Type-Options']).toBe('nosniff');
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://jungmyungoffice.com');
    const local = mockRes();
    await handler({ method: 'GET', headers: { origin: 'http://localhost:5173' } }, local);
    expect(local.headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
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
    expect(res.body.items[0].urgentReasons).toEqual([]);
  });

  it('GET 목록 항목마다 긴급 근거를 붙이고, 파기된 접수는 빈 목록이며 저장하지 않는다', async () => {
    const urgent = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '인허가', message: 'm', deadlineReport: 'soon' },
      {},
      { id: 'JM-20260717-URGT', now: new Date('2026-07-17T03:00:00Z') },
    );
    const purged = {
      id: 'JM-20260101-PRGD', schemaVersion: 6, receivedAt: '2026-01-01T03:00:00.000Z', topic: '인허가',
      status: 'done', pipelineStage: 'inquiry', memoCount: 0, purged: true, purgedAt: '2026-05-01T00:00:00.000Z',
    };
    const { data, index } = stubRedis();
    data.set(`inquiry:${urgent.id}`, JSON.stringify(urgent));
    data.set(`inquiry:${purged.id}`, JSON.stringify(purged));
    index.push(urgent.id, purged.id);

    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    const byId = Object.fromEntries(res.body.items.map((i) => [i.id, i]));
    expect(byId[urgent.id].urgentReasons).toEqual(['selfReported']);
    expect(byId[purged.id].urgentReasons).toEqual([]);
    expect(JSON.parse(data.get(`inquiry:${urgent.id}`)).urgentReasons).toBeUndefined();
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

  it('PATCH·DELETE 응답 항목에도 긴급 근거를 붙여 화면 배지가 유지되고, 저장하지는 않는다', async () => {
    const record = buildInquiryRecord(
      { name: '홍길동', phone: '010-1234-5678', topic: '인허가', message: '', deadlineReport: 'soon' },
      {},
      { id: 'JM-20260717-CCCC', now: new Date('2026-07-17T03:00:00Z') },
    );
    const { data } = stubRedis();
    data.set('inquiry:JM-20260717-CCCC', JSON.stringify(record));

    const patched = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: record.id, status: 'in_progress' } }, patched);
    expect(patched.body.item.urgentReasons).toEqual(['selfReported']);
    expect(JSON.parse(data.get(`inquiry:${record.id}`)).urgentReasons).toBeUndefined();

    const deleted = mockRes();
    await handler({ method: 'DELETE', headers: AUTH, body: { id: record.id } }, deleted);
    expect(deleted.body.item.purged).toBe(true);
    expect(deleted.body.item.urgentReasons).toEqual([]);
    expect(JSON.parse(data.get(`inquiry:${record.id}`)).urgentReasons).toBeUndefined();
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

    // 파기된 건은 상태만 바꿀 수 있고, 개인정보 필드는 되살아나지 않는다
    const res2 = mockRes();
    await handler(
      { method: 'PATCH', headers: AUTH, body: { id: 'JM-20260717-CCCC', status: 'done' } },
      res2,
    );
    expect(res2.statusCode).toBe(200);
    expect(res2.body.item.status).toBe('done');
    const resaved = JSON.parse(data.get('inquiry:JM-20260717-CCCC'));
    expect(resaved).toMatchObject({ purged: true, status: 'done', topic: '국가보훈' });
    expect(resaved.name).toBeUndefined();
    expect(resaved.memos).toBeUndefined();
    expect(resaved.doneAt).toBeUndefined();
  });

  it('파기된 건의 메모·수임 단계 변경, 재파기, 잘못된 상태는 거절한다', async () => {
    const { data } = stubRedis();
    const purged = {
      id: 'JM-P', schemaVersion: 1, receivedAt: '2026-07-18T14:06:03.000Z', topic: '인허가',
      status: 'new', pipelineStage: 'inquiry', memoCount: 0, purged: true, purgedAt: '2026-07-20T00:00:00.000Z',
    };
    data.set('inquiry:JM-P', JSON.stringify(purged));
    const cases = [
      [{ method: 'PATCH', body: { id: 'JM-P', memo: '메모' } }, 409],
      [{ method: 'PATCH', body: { id: 'JM-P', status: 'done', memo: '메모' } }, 409],
      [{ method: 'PATCH', body: { id: 'JM-P', pipelineStage: 'retained' } }, 409],
      [{ method: 'DELETE', body: { id: 'JM-P' } }, 409],
      [{ method: 'PATCH', body: { id: 'JM-P', status: 'weird' } }, 400],
    ];
    for (const [req, code] of cases) {
      const res = mockRes();
      await handler({ ...req, headers: AUTH }, res);
      expect(res.statusCode).toBe(code);
    }
    expect(JSON.parse(data.get('inquiry:JM-P'))).toEqual(purged);
  });
});

describe('관리자 비밀번호 로그인', () => {
  const password = '가상 시험용 passphrase!';
  const salt = '11'.repeat(16);
  const digest = scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex');
  const hash = ['scrypt', salt, digest].join('$');

  beforeEach(() => {
    vi.stubEnv('ADMIN_TOKEN', 'test-admin-key');
    vi.stubEnv('ADMIN_PASSWORD_HASH', hash);
    vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
    vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
    stubRedis();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function login(value, headers = {}) {
    const res = mockRes();
    await handler({ method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: { password: value } }, res);
    return res;
  }

  async function dashboard(token) {
    const res = mockRes();
    await handler({ method: 'GET', headers: { authorization: 'Bearer ' + token } }, res);
    return res.statusCode;
  }

  it('비밀번호 확인 후 관리자 API에 쓸 30일 인증값을 발급한다', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const res = await login(password);
    expect(res.statusCode).toBe(200);
    const { sessionToken } = res.body;
    expect(sessionToken).toEqual(expect.any(String));
    expect(sessionToken).not.toBe(password);
    expect(sessionToken).not.toBe(process.env.ADMIN_TOKEN);
    expect(res.headers['Cache-Control']).toContain('no-store');
    expect(await dashboard(sessionToken)).toBe(200);
    vi.setSystemTime(Date.now() + 30 * 86400 * 1000);
    expect(await dashboard(sessionToken)).toBe(401);
  });

  it('비밀번호나 서버 인증 키 변경 시 이전 세션이 만료된다', async () => {
    const res = await login(password);
    expect(res.statusCode).toBe(200);
    vi.stubEnv('ADMIN_TOKEN', 'new-server-key');
    expect(await dashboard(res.body.sessionToken)).toBe(401);
    vi.stubEnv('ADMIN_TOKEN', 'test-admin-key');
    vi.stubEnv('ADMIN_PASSWORD_HASH', hash.replace(salt, '22'.repeat(16)));
    expect(await dashboard(res.body.sessionToken)).toBe(401);
  });

  it('잘못된 비밀번호·단순 폼 전송·설정 누락을 거부한다', async () => {
    expect((await login('틀린 비밀번호')).statusCode).toBe(401);
    expect((await login(password, { 'content-type': 'text/plain' })).statusCode).toBe(415);
    vi.stubEnv('ADMIN_PASSWORD_HASH', '');
    expect((await login(password)).statusCode).toBe(503);
  });

  it.each([null, 'NaN', 0, -1, 1.5, true])('제한기가 올바른 횟수를 돌려주지 않으면 로그인할 수 없다 (%s)', async (count) => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [{ result: count }, { result: 1 }],
    })));
    expect((await login(password)).statusCode).toBe(503);
  });
  it('로그인 요청 제한과 제한기 장애 시 비밀번호를 검증하지 않는다', async () => {
    for (let i = 0; i < 10; i++) await login('틀린 비밀번호');
    expect((await login(password)).statusCode).toBe(429);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect((await login(password)).statusCode).toBe(503);
  });
});
