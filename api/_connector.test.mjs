import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './connector.js';
import { applyConnectorAck, applyConnectorStatus, buildInquiryRecord } from './_store.mjs';

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

// 로컬 처리 결과를 홈페이지 접수함에 돌려준다(docs/2026-10-19-pipeline-link-plan.md 3-1).
describe('연동기 상태 동기화 로직', () => {
  const LATER = new Date('2026-07-20T03:00:00.000Z');
  const pulled = () => applyConnectorAck(buildInquiryRecord(value, {}, { now: NOW }), 'INQ-0001', NOW).value;

  it('로컬 종결은 처리 완료로 바꾸고 doneAt을 처음 한 번만 기록한다', () => {
    const first = applyConnectorStatus(pulled(), { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW);
    expect(first.ok).toBe(true);
    expect(first.value.status).toBe('done');
    expect(first.value.doneAt).toBe(NOW.toISOString());
    expect(first.value.localStatus).toBe('closed');
    expect(first.value.localCloseReason).toBe('manual');
    expect(first.value.localStatusAt).toBe(NOW.toISOString());

    const again = applyConnectorStatus(first.value, { status: 'done', localStatus: 'closed', closeReason: 'manual' }, LATER);
    expect(again.ok).toBe(true);
    expect(again.already).toBe(true);
    expect(again.value.doneAt).toBe(NOW.toISOString());
  });

  it('사건 전환은 진행 중·사건 전환 단계로, 수임은 수임 단계로 바꾼다', () => {
    const converted = applyConnectorStatus(pulled(), { status: 'in_progress', pipelineStage: 'qualified', localStatus: 'case_created' }, NOW);
    expect(converted.value).toMatchObject({ status: 'in_progress', pipelineStage: 'qualified', pipelineStageAt: NOW.toISOString() });
    expect(converted.value.doneAt).toBeUndefined();

    const engaged = applyConnectorStatus(converted.value, { status: 'done', pipelineStage: 'retained', localStatus: 'engaged' }, LATER);
    expect(engaged.value).toMatchObject({ status: 'done', pipelineStage: 'retained', doneAt: LATER.toISOString(), localStatus: 'engaged' });
  });

  it('허용하지 않은 값과 맞지 않는 조합을 거부한다', () => {
    const record = pulled();
    expect(applyConnectorStatus(record, { status: 'new', localStatus: 'closed', closeReason: 'manual' }, NOW).errors).toContain('status');
    expect(applyConnectorStatus(record, { status: 'in_progress', pipelineStage: 'work_completed', localStatus: 'case_created' }, NOW).errors).toContain('pipeline_stage');
    expect(applyConnectorStatus(record, { status: 'done', localStatus: 'deleted' }, NOW).errors).toContain('local_status');
    // 종결은 처리 완료와 종결 사유가 함께 와야 한다.
    expect(applyConnectorStatus(record, { status: 'in_progress', localStatus: 'closed', closeReason: 'manual' }, NOW).errors).toContain('status');
    expect(applyConnectorStatus(record, { status: 'done', localStatus: 'closed', closeReason: 'later' }, NOW).errors).toContain('close_reason');
  });

  it('메모·연락처 같은 다른 필드는 바꾸지 않는다', () => {
    const record = pulled();
    const result = applyConnectorStatus(record, { status: 'done', localStatus: 'closed', closeReason: 'auto_stale', name: '바뀜', memo: 'x' }, NOW);
    expect(result.value.name).toBe('홍길동');
    expect(result.value.memos).toEqual([]);
  });

  it('진행 단계는 앞으로만 간다(관리자가 정한 업무 완료·수임을 로컬이 낮추지 않는다)', () => {
    const record = { ...pulled(), pipelineStage: 'work_completed' };
    const result = applyConnectorStatus(record, { status: 'in_progress', pipelineStage: 'retained', localStatus: 'engaged' }, NOW);
    expect(result.ok).toBe(true);
    expect(result.value.pipelineStage).toBe('work_completed');
  });

  it('90일 자동 종결은 관리자가 진행 중·보류로 다루던 접수의 상태를 바꾸지 않는다', () => {
    const record = { ...pulled(), status: 'in_progress' };
    const result = applyConnectorStatus(record, { status: 'done', localStatus: 'closed', closeReason: 'auto_stale' }, NOW);
    expect(result.ok).toBe(true);
    expect(result.value.status).toBe('in_progress');
    expect(result.value.doneAt).toBeUndefined();
    expect(result.value.localCloseReason).toBe('auto_stale');
    // 행정사가 직접 종결한 경우는 처리 완료가 된다.
    expect(applyConnectorStatus(record, { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW).value.status).toBe('done');
  });

  it('처리 완료된 접수를 연동 토큰으로 진행 중으로 되돌리지 않는다(120일 파기가 밀리지 않게)', () => {
    const done = applyConnectorStatus(pulled(), { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW).value;
    const result = applyConnectorStatus(done, { status: 'in_progress', pipelineStage: 'qualified', localStatus: 'case_created' }, NOW);
    expect(result.ok).toBe(true);
    expect(result.value.status).toBe('done');
    expect(result.value.doneAt).toBe(NOW.toISOString());
  });

  it('회신함은 진행 중으로 바꾸고 단계는 그대로 두며, 처리 완료·보류는 되돌리지 않는다', () => {
    const replied = applyConnectorStatus(pulled(), { status: 'in_progress', localStatus: 'replied' }, NOW);
    expect(replied.ok).toBe(true);
    expect(replied.value).toMatchObject({ status: 'in_progress', pipelineStage: 'inquiry', localStatus: 'replied' });
    expect(replied.value.doneAt).toBeUndefined();
    // 회신함은 진행 중으로만 보낸다.
    expect(applyConnectorStatus(pulled(), { status: 'done', localStatus: 'replied' }, NOW).errors).toContain('status');

    const done = applyConnectorStatus(pulled(), { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW).value;
    expect(applyConnectorStatus(done, { status: 'in_progress', localStatus: 'replied' }, LATER).value.status).toBe('done');
    const onHold = { ...pulled(), status: 'on_hold' };
    expect(applyConnectorStatus(onHold, { status: 'in_progress', localStatus: 'replied' }, LATER).value.status).toBe('on_hold');
  });

  it('회신함은 사건 전환·종결·수임처럼 이미 더 나아간 로컬 상태를 덮어쓰지 않는다', () => {
    const converted = applyConnectorStatus(pulled(), { status: 'in_progress', pipelineStage: 'qualified', localStatus: 'case_created' }, NOW).value;
    const afterReply = applyConnectorStatus(converted, { status: 'in_progress', localStatus: 'replied' }, LATER);
    expect(afterReply.already).toBe(true);
    expect(afterReply.value.localStatus).toBe('case_created');
    // 사건 전환된 건은 회신 후 무응답 종결로 처리 완료가 되지 않는다.
    const noReply = applyConnectorStatus(converted, { status: 'done', localStatus: 'closed', closeReason: 'no_reply' }, LATER);
    expect(noReply.value.status).toBe('in_progress');

    const closed = applyConnectorStatus(pulled(), { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW).value;
    const closedThenReply = applyConnectorStatus(closed, { status: 'in_progress', localStatus: 'replied' }, LATER);
    expect(closedThenReply.already).toBe(true);
    expect(closedThenReply.value).toMatchObject({ localStatus: 'closed', localCloseReason: 'manual' });
  });

  it('회신 뒤 관리자가 수임 단계로 올린 건은 회신 후 무응답 종결로 처리 완료가 되지 않는다', () => {
    const replied = applyConnectorStatus(pulled(), { status: 'in_progress', localStatus: 'replied' }, NOW).value;
    const retainedByAdmin = { ...replied, pipelineStage: 'retained' };
    const result = applyConnectorStatus(retainedByAdmin, { status: 'done', localStatus: 'closed', closeReason: 'no_reply' }, LATER);
    expect(result.value.status).toBe('in_progress');
  });

  it('회신 후 무응답 종결은 로컬이 회신함으로 올린 진행 중 건만 처리 완료로 바꾼다', () => {
    const replied = applyConnectorStatus(pulled(), { status: 'in_progress', localStatus: 'replied' }, NOW).value;
    const closed = applyConnectorStatus(replied, { status: 'done', localStatus: 'closed', closeReason: 'no_reply' }, LATER);
    expect(closed.value).toMatchObject({ status: 'done', doneAt: LATER.toISOString(), localCloseReason: 'no_reply' });

    // 관리자가 /admin에서 진행 중·보류로 다루던 건은 그대로 둔다(auto_stale과 같은 보호).
    for (const status of ['in_progress', 'on_hold']) {
      const admin = { ...pulled(), status };
      const result = applyConnectorStatus(admin, { status: 'done', localStatus: 'closed', closeReason: 'no_reply' }, LATER);
      expect(result.value.status, status).toBe(status);
      expect(result.value.localCloseReason).toBe('no_reply');
    }
  });

  it('파기된 접수와 로컬로 가져가지 않은 접수는 거부한다', () => {
    const fresh = buildInquiryRecord(value, {}, { now: NOW });
    expect(applyConnectorStatus(fresh, { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW).errors).toContain('not_pulled');
    expect(applyConnectorStatus({ ...pulled(), purged: true }, { status: 'done', localStatus: 'closed', closeReason: 'manual' }, NOW).errors).toContain('purged');
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

  it('GET은 접수마다 회신 초안을 계산해 붙이고 저장하지는 않는다', async () => {
    const { data, index } = stubRedis();
    data.set('inquiry:JM-1', JSON.stringify(buildInquiryRecord(value, {}, { id: 'JM-1', now: NOW })));
    index.push('JM-1');
    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    const [item] = res.body.items;
    expect(item.replyDraft.text).toContain('홍길동 님, 안녕하세요.');
    expect(item.replyDraft.notes).toEqual([]);
    expect(JSON.parse(data.get('inquiry:JM-1')).replyDraft).toBeUndefined();
  });

  it('GET이 성공하면 연동기 마지막 접속 시각을 남기고, 인증 실패는 남기지 않는다', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    try {
      const { data } = stubRedis();
      await handler({ method: 'GET', headers: {} }, mockRes());
      expect(data.has('connector:lastSeenAt')).toBe(false);

      const res = mockRes();
      await handler({ method: 'GET', headers: AUTH }, res);
      expect(res.statusCode).toBe(200);
      expect(data.get('connector:lastSeenAt')).toBe(NOW.toISOString());
    } finally {
      vi.useRealTimers();
    }
  });

  it('접속 시각 기록에 실패해도 GET은 접수 목록을 돌려준다', async () => {
    const { data, index } = stubRedis();
    data.set('inquiry:JM-1', JSON.stringify(buildInquiryRecord(value, {}, { id: 'JM-1', now: NOW })));
    index.push('JM-1');
    const inner = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      const body = JSON.parse(options.body);
      if (body[0] === 'SET' && body[1] === 'connector:lastSeenAt') throw new Error('redis down');
      return inner(url, options);
    }));

    const res = mockRes();
    await handler({ method: 'GET', headers: AUTH }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.items.map((i) => i.id)).toEqual(['JM-1']);
    expect(data.has('connector:lastSeenAt')).toBe(false);
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

  it('PATCH action=status는 상태를 저장하고, 파기된 접수는 409, 잘못된 값은 400', async () => {
    const record = applyConnectorAck(buildInquiryRecord(value, {}, { id: 'JM-1', now: NOW }), 'INQ-0001', NOW).value;
    const { data } = stubRedis();
    data.set('inquiry:JM-1', JSON.stringify(record));
    data.set('inquiry:JM-2', JSON.stringify({ ...record, id: 'JM-2', purged: true }));

    const res = mockRes();
    await handler({
      method: 'PATCH',
      headers: AUTH,
      body: { id: 'JM-1', action: 'status', status: 'done', localStatus: 'closed', closeReason: 'auto_stale' },
    }, res);
    expect(res.statusCode).toBe(200);
    const saved = JSON.parse(data.get('inquiry:JM-1'));
    expect(saved.status).toBe('done');
    expect(saved.doneAt).toBeTruthy();
    expect(saved.localCloseReason).toBe('auto_stale');

    const purged = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: 'JM-2', action: 'status', status: 'done', localStatus: 'closed', closeReason: 'manual' } }, purged);
    expect(purged.statusCode).toBe(409);

    const bad = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: 'JM-1', action: 'status', status: 'new', localStatus: 'closed' } }, bad);
    expect(bad.statusCode).toBe(400);

    const unknown = mockRes();
    await handler({ method: 'PATCH', headers: AUTH, body: { id: 'JM-1', action: 'erase' } }, unknown);
    expect(unknown.statusCode).toBe(400);
    expect(unknown.body.error).toBe('unknown_action');
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
