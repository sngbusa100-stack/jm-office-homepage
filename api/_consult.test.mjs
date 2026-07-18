import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './consult.js';

const validBody = {
  name: '홍길동',
  phone: '010-1234-5678',
  topic: '음주운전 면허 구제',
  message: '상담을 요청합니다.',
  consent: true,
  company: '',
  submissionId: 'submission-12345678',
};

function responseRecorder() {
  return {
    statusCode: 0,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    end() {},
  };
}

function createBackend() {
  const values = new Map();
  const index = new Map();
  const telegramTexts = [];
  const state = { telegramOk: true, partialSave: false, failEnsure: false };

  function execute(command) {
    const [name, ...args] = command;
    if (name === 'INCR') {
      const value = Number(values.get(args[0]) ?? 0) + 1;
      values.set(args[0], String(value));
      return value;
    }
    if (name === 'EXPIRE') return 1;
    if (name === 'SET') {
      const [key, value] = args;
      if (args.includes('NX') && values.has(key)) return null;
      values.set(key, value);
      return 'OK';
    }
    if (name === 'GET') return values.get(args[0]) ?? null;
    if (name === 'ZADD') {
      index.set(args[2], Number(args[1]));
      return 1;
    }
    throw new Error(`unsupported:${name}`);
  }

  const fetch = vi.fn(async (url, init = {}) => {
    if (String(url).startsWith('https://api.telegram.org/')) {
      telegramTexts.push(JSON.parse(init.body).text);
      return { ok: state.telegramOk, json: async () => ({ ok: state.telegramOk }) };
    }
    const command = JSON.parse(init.body);
    if (String(url).endsWith('/multi-exec')) {
      if (state.partialSave && command[0]?.[0] === 'SET' && String(command[0]?.[1]).startsWith('inquiry:')) {
        execute(command[0]);
        return { ok: true, json: async () => [{ result: 'OK' }, { error: 'ERR index' }] };
      }
      return { ok: true, json: async () => command.map((item) => ({ result: execute(item) })) };
    }
    if (state.failEnsure && command[0] === 'ZADD') {
      return { ok: false, status: 503, json: async () => ({}) };
    }
    return { ok: true, json: async () => ({ result: execute(command) }) };
  });

  return { fetch, values, index, telegramTexts, state };
}

async function invoke(body = validBody, headers = {}) {
  const req = { method: 'POST', body, headers: { origin: 'https://example.test', ...headers } };
  const res = responseRecorder();
  await handler(req, res);
  return res;
}

beforeEach(() => {
  vi.stubEnv('CONSULT_OPEN', 'true');
  vi.stubEnv('TELEGRAM_BOT_TOKEN', 'token');
  vi.stubEnv('TELEGRAM_CHAT_ID', 'chat');
  vi.stubEnv('KV_REST_API_URL', 'https://redis.test');
  vi.stubEnv('KV_REST_API_TOKEN', 'redis-token');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('상담 API 핸들러', () => {
  it('개업 게이트가 닫히면 저장·알림 없이 503을 반환한다', async () => {
    vi.stubEnv('CONSULT_OPEN', 'false');
    const backend = createBackend();
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(503);
    expect(backend.fetch).not.toHaveBeenCalled();
  });

  it('정상 접수는 저장하고 개인정보 없는 알림을 보낸다', async () => {
    const backend = createBackend();
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toMatch(/^JM-/);
    expect(backend.values.has(`inquiry:${res.body.id}`)).toBe(true);
    expect(backend.telegramTexts[0]).toContain(`접수번호: ${res.body.id}`);
    expect(backend.telegramTexts[0]).not.toContain('홍길동');
    expect(backend.telegramTexts[0]).not.toContain('010-1234-5678');
  });

  it('저장된 동일 제출은 새 알림 없이 기존 접수번호를 돌려준다', async () => {
    const backend = createBackend();
    vi.stubGlobal('fetch', backend.fetch);
    const first = await invoke();
    backend.index.clear(); // 과거 부분 저장으로 본문만 남은 상황도 중복 경로에서 복구
    const second = await invoke();
    expect(second.statusCode).toBe(200);
    expect(second.body).toEqual({ ok: true, id: first.body.id, duplicate: true });
    expect(backend.telegramTexts).toHaveLength(1);
    expect(backend.index.has(first.body.id)).toBe(true);
  });

  it('선점 키만 남고 본문이 없으면 허위 성공하지 않고 같은 접수번호로 복구한다', async () => {
    const backend = createBackend();
    backend.values.set('dedup:submission:submission-12345678', 'JM-20260719-ABCD');
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, id: 'JM-20260719-ABCD' });
    expect(backend.values.has('inquiry:JM-20260719-ABCD')).toBe(true);
  });

  it('기존 접수번호 조회 장애는 새 ID로 갈라놓지 않고 재시도를 요청한다', async () => {
    const backend = createBackend();
    backend.values.set('dedup:submission:submission-12345678', 'JM-20260719-ABCD');
    backend.fetch.mockImplementationOnce(backend.fetch.getMockImplementation())
      .mockImplementationOnce(async () => ({ ok: true, json: async () => ({ result: null }) }))
      .mockImplementationOnce(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('idempotency_lookup_failed');
    expect(backend.telegramTexts).toHaveLength(0);
  });

  it('첫 요청이 아직 저장 중이면 두 번째 동시 요청은 알림 없이 pending을 반환한다', async () => {
    const backend = createBackend();
    backend.values.set('dedup:submission:submission-12345678', 'JM-20260719-ABCD');
    backend.values.set('dedup:processing:submission-12345678', '1');
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('submission_pending');
    expect(backend.telegramTexts).toHaveLength(0);
    expect(backend.values.has('inquiry:JM-20260719-ABCD')).toBe(false);
  });

  it('기존 본문 인덱스 복구가 실패하면 duplicate 성공으로 숨기지 않는다', async () => {
    const backend = createBackend();
    backend.values.set('dedup:submission:submission-12345678', 'JM-20260719-ABCD');
    backend.values.set('inquiry:JM-20260719-ABCD', JSON.stringify({
      id: 'JM-20260719-ABCD', receivedAt: '2026-07-19T00:00:00.000Z',
    }));
    backend.state.failEnsure = true;
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('inquiry_index_unavailable');
  });

  it('SET 뒤 인덱스 오류가 나면 read-back 후 인덱스를 복구한다', async () => {
    const backend = createBackend();
    backend.state.partialSave = true;
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(200);
    expect(backend.values.has(`inquiry:${res.body.id}`)).toBe(true);
    expect(backend.index.has(res.body.id)).toBe(true);
    expect(backend.telegramTexts[0]).not.toContain('저장 실패');
  });

  it('본문은 있으나 인덱스 복구도 실패하면 개인정보 없이 운영 경고를 보낸다', async () => {
    const backend = createBackend();
    backend.state.partialSave = true;
    backend.state.failEnsure = true;
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(200);
    expect(backend.telegramTexts[0]).toContain('인덱스 확인 필요');
    expect(backend.telegramTexts[0]).not.toContain('홍길동');
  });

  it('저장 성공 뒤 텔레그램 실패는 중복 유발 없이 성공 응답한다', async () => {
    const backend = createBackend();
    backend.state.telegramOk = false;
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(200);
    expect(backend.values.has(`inquiry:${res.body.id}`)).toBe(true);
  });

  it('저장소가 없으면 사용자 결정에 따른 개인정보 폴백 알림으로 유실을 막는다', async () => {
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    const backend = createBackend();
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(200);
    expect(backend.telegramTexts[0]).toContain('접수 저장 실패');
    expect(backend.telegramTexts[0]).toContain('홍길동');
  });

  it('저장소와 텔레그램이 모두 없으면 성공으로 위장하지 않는다', async () => {
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    const backend = createBackend();
    backend.state.telegramOk = false;
    vi.stubGlobal('fetch', backend.fetch);
    const res = await invoke();
    expect(res.statusCode).toBe(502);
  });
});
