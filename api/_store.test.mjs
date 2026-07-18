import { describe, expect, it, vi } from 'vitest';
import {
  STATUSES,
  acquireSubmissionProcessing,
  applyInquiryPatch,
  buildInquiryRecord,
  checkRateLimit,
  createInquiryStore,
  generateInquiryId,
  isRetentionExpired,
  purgeInquiryRecord,
  redisConfig,
} from './_store.mjs';

const NOW = new Date('2026-07-17T03:00:00.000Z'); // KST 2026-07-17 12:00

const value = {
  name: '홍길동',
  phone: '010-1234-5678',
  topic: '음주운전 면허 구제',
  message: '문의드립니다.',
};

describe('접수번호 생성', () => {
  it('JM-YYYYMMDD-XXXX 형식(KST 날짜)이다', () => {
    const id = generateInquiryId(NOW, () => 0);
    expect(id).toMatch(/^JM-20260717-[A-Z2-9]{4}$/);
  });

  it('KST 자정 경계에서 날짜가 넘어간다', () => {
    const utcEvening = new Date('2026-07-17T16:00:00.000Z'); // KST 7/18 01:00
    expect(generateInquiryId(utcEvening, () => 0)).toContain('20260718');
  });
});

describe('접수 레코드 생성', () => {
  it('접수 값·메타·초기 상태를 담는다', () => {
    const record = buildInquiryRecord(value, { origin: 'https://example.test' }, { now: NOW });
    expect(record.name).toBe('홍길동');
    expect(record.phone).toBe('010-1234-5678');
    expect(record.topic).toBe('음주운전 면허 구제');
    expect(record.message).toBe('문의드립니다.');
    expect(record.origin).toBe('https://example.test');
    expect(record.status).toBe('new');
    expect(record.memos).toEqual([]);
    expect(record.receivedAt).toBe(NOW.toISOString());
    expect(record.id).toMatch(/^JM-/);
  });

  it('스키마 버전과 동의 기록(버전·시각)을 담는다', () => {
    const record = buildInquiryRecord(value, {}, { now: NOW });
    expect(record.schemaVersion).toBeGreaterThanOrEqual(2);
    expect(record.consent.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(record.consent.at).toBe(NOW.toISOString());
  });

  it('진단·유입경로가 있으면 담고, 없으면 필드를 만들지 않는다', () => {
    const withExtras = buildInquiryRecord(
      {
        ...value,
        diagnosis: { domain: 'dui', answers: { q1: 'a' }, counts: { urgent: 1 } },
        sourcePath: '/check/dui/result',
        utmSource: 'naver_blog',
      },
      {},
      { now: NOW },
    );
    expect(withExtras.diagnosis.domain).toBe('dui');
    expect(withExtras.sourcePath).toBe('/check/dui/result');
    expect(withExtras.utmSource).toBe('naver_blog');

    const without = buildInquiryRecord(value, {}, { now: NOW });
    expect(without).not.toHaveProperty('diagnosis');
    expect(without).not.toHaveProperty('sourcePath');
    expect(without).not.toHaveProperty('utmSource');
  });
});

describe('접수 패치(상태·메모)', () => {
  const base = buildInquiryRecord(value, {}, { now: NOW });

  it('유효한 상태로 변경한다', () => {
    for (const status of STATUSES) {
      const result = applyInquiryPatch(base, { status }, NOW);
      expect(result.ok).toBe(true);
      expect(result.value.status).toBe(status);
    }
  });

  it('알 수 없는 상태를 거부한다', () => {
    const result = applyInquiryPatch(base, { status: 'weird' }, NOW);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('status');
  });

  it('메모를 시각과 함께 추가하고 원본은 바꾸지 않는다', () => {
    const result = applyInquiryPatch(base, { memo: ' 1차 전화 완료 ' }, NOW);
    expect(result.ok).toBe(true);
    expect(result.value.memos).toEqual([{ at: NOW.toISOString(), text: '1차 전화 완료' }]);
    expect(base.memos).toEqual([]);
  });

  it('빈 메모·빈 패치를 거부한다', () => {
    expect(applyInquiryPatch(base, { memo: '  ' }, NOW).ok).toBe(false);
    expect(applyInquiryPatch(base, {}, NOW).errors).toContain('empty_patch');
  });
});

describe('개인정보 파기', () => {
  it('이름·연락처·내용·메모를 제거하고 통계 필드만 남긴다', () => {
    const record = buildInquiryRecord(value, { origin: 'o' }, { now: NOW });
    record.memos.push({ at: NOW.toISOString(), text: '메모' });
    const purged = purgeInquiryRecord(record, NOW);
    expect(purged).toEqual({
      id: record.id,
      schemaVersion: record.schemaVersion,
      receivedAt: record.receivedAt,
      topic: record.topic,
      status: 'new',
      memoCount: 1,
      purged: true,
      purgedAt: NOW.toISOString(),
    });
    expect(purged.name).toBeUndefined();
    expect(purged.phone).toBeUndefined();
    expect(purged.message).toBeUndefined();
  });

  it('진단·동의·origin·유입경로(식별값 가능)까지 모두 파기한다', () => {
    const record = buildInquiryRecord(
      {
        ...value,
        diagnosis: { domain: 'dui', answers: { q1: 'a' }, counts: { urgent: 1 } },
        sourcePath: '/check/dui/result',
        utmSource: 'email_고객번호123',
      },
      { origin: 'https://example.test' },
      { now: NOW },
    );
    const purged = purgeInquiryRecord(record, NOW);
    expect(purged.diagnosis).toBeUndefined();
    expect(purged.consent).toBeUndefined();
    expect(purged.origin).toBeUndefined();
    expect(purged.sourcePath).toBeUndefined();
    expect(purged.utmSource).toBeUndefined();
  });
});

describe('완료 시각과 보존기간(120일) 자동 파기 판정', () => {
  const base = buildInquiryRecord(value, {}, { now: NOW });

  it('done 전환 시 doneAt을 기록하고, 완료가 풀리면 지운다', () => {
    const done = applyInquiryPatch(base, { status: 'done' }, NOW);
    expect(done.value.doneAt).toBe(NOW.toISOString());
    const reopened = applyInquiryPatch(done.value, { status: 'in_progress' }, NOW);
    expect(reopened.value.doneAt).toBeUndefined();
  });

  it('이미 done인 레코드에 다시 done을 보내도 doneAt이 연장되지 않는다', () => {
    const done = applyInquiryPatch(base, { status: 'done' }, NOW);
    const later = new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000);
    const again = applyInquiryPatch(done.value, { status: 'done' }, later);
    expect(again.ok).toBe(true);
    expect(again.value.doneAt).toBe(NOW.toISOString()); // 최초 완료 시각 유지
  });

  it('완료 후 120일이 지나면 파기 대상이다', () => {
    const done = applyInquiryPatch(base, { status: 'done' }, NOW).value;
    const day119 = new Date(NOW.getTime() + 119 * 24 * 60 * 60 * 1000);
    const day121 = new Date(NOW.getTime() + 121 * 24 * 60 * 60 * 1000);
    expect(isRetentionExpired(done, day119)).toBe(false);
    expect(isRetentionExpired(done, day121)).toBe(true);
  });

  it('완료가 아니거나 이미 파기된 레코드는 대상이 아니다', () => {
    const far = new Date(NOW.getTime() + 500 * 24 * 60 * 60 * 1000);
    expect(isRetentionExpired(base, far)).toBe(false); // status: new
    const done = applyInquiryPatch(base, { status: 'done' }, NOW).value;
    const purged = purgeInquiryRecord(done, NOW);
    expect(isRetentionExpired(purged, far)).toBe(false);
  });

  it('doneAt이 없는 과거 레코드는 updatedAt·receivedAt을 기산점으로 쓴다', () => {
    const legacy = { ...buildInquiryRecord(value, {}, { now: NOW }), status: 'done' };
    delete legacy.doneAt;
    const day121 = new Date(NOW.getTime() + 121 * 24 * 60 * 60 * 1000);
    expect(isRetentionExpired(legacy, day121)).toBe(true); // receivedAt 기준
  });
});

describe('멱등성 키 선점', () => {
  const cfg = { url: 'https://redis.test', token: 'secret' };

  it('최초 선점은 claimed=true, 재선점은 기존 접수번호를 돌려준다', async () => {
    const first = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 'OK' }) });
    const { claimSubmission } = await import('./_store.mjs');
    expect(await claimSubmission(cfg, 'sub-1', 'JM-NEW', first)).toEqual({ claimed: true });
    const [, options] = first.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual([
      'SET', 'dedup:submission:sub-1', 'JM-NEW', 'NX', 'EX', '86400',
    ]);

    let call = 0;
    const dup = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({ result: call++ === 0 ? null : 'JM-OLD' }),
    }));
    expect(await claimSubmission(cfg, 'sub-1', 'JM-NEW', dup)).toEqual({
      claimed: false,
      existingId: 'JM-OLD',
    });
  });
});

describe('동시 제출 처리 잠금', () => {
  it('SET NX EX 30으로 처리권을 획득하고 충돌 시 false를 반환한다', async () => {
    const cfg = { url: 'https://redis.test', token: 't' };
    const yes = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 'OK' }) });
    const no = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: null }) });
    expect(await acquireSubmissionProcessing(cfg, 'submission-1', {}, yes)).toBe(true);
    expect(await acquireSubmissionProcessing(cfg, 'submission-1', {}, no)).toBe(false);
    expect(JSON.parse(yes.mock.calls[0][1].body)).toEqual([
      'SET', 'dedup:processing:submission-1', '1', 'NX', 'EX', '30',
    ]);
  });
});

describe('요청 제한', () => {
  const cfg = { url: 'https://redis.test', token: 'secret' };

  function limiterFetch(count) {
    return vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: count }, { result: 1 }],
    });
  }

  it('한도 이내면 허용하고 초과하면 거부한다', async () => {
    expect(await checkRateLimit(cfg, 'ratelimit:consult:1.2.3.4', {}, limiterFetch(5))).toBe(true);
    expect(await checkRateLimit(cfg, 'ratelimit:consult:1.2.3.4', {}, limiterFetch(6))).toBe(false);
  });

  it('INCR과 EXPIRE NX를 한 트랜잭션으로 보낸다', async () => {
    const fetchMock = limiterFetch(1);
    await checkRateLimit(cfg, 'ratelimit:consult:1.2.3.4', { windowSec: 60 }, fetchMock);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://redis.test/multi-exec');
    expect(JSON.parse(options.body)).toEqual([
      ['INCR', 'ratelimit:consult:1.2.3.4'],
      ['EXPIRE', 'ratelimit:consult:1.2.3.4', '60', 'NX'],
    ]);
  });
});

describe('저장소 환경변수', () => {
  it('KV_* 또는 UPSTASH_* 이름을 모두 지원한다', () => {
    expect(redisConfig({ KV_REST_API_URL: 'u', KV_REST_API_TOKEN: 't' })).toEqual({
      url: 'u',
      token: 't',
    });
    expect(
      redisConfig({ UPSTASH_REDIS_REST_URL: 'u2', UPSTASH_REDIS_REST_TOKEN: 't2' }),
    ).toEqual({ url: 'u2', token: 't2' });
    expect(redisConfig({})).toBeNull();
  });
});

describe('Redis REST 저장소', () => {
  const cfg = { url: 'https://redis.test', token: 'secret' };

  function fetchReturning(results) {
    let call = 0;
    return vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({ result: results[call++] }),
    }));
  }

  it('save는 SET과 ZADD를 하나의 MULTI/EXEC 요청으로 실행한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: 'OK' }, { result: 1 }],
    });
    const store = createInquiryStore(cfg, fetchMock);
    const record = buildInquiryRecord(value, {}, { now: NOW, id: 'JM-20260717-TEST' });
    await store.save(record);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://redis.test/multi-exec');
    const [setCall, zaddCall] = JSON.parse(options.body);
    expect(setCall[0]).toBe('SET');
    expect(setCall[1]).toBe('inquiry:JM-20260717-TEST');
    expect(JSON.parse(setCall[2]).name).toBe('홍길동');
    expect(zaddCall).toEqual([
      'ZADD',
      'inquiry:index',
      String(NOW.getTime()),
      'JM-20260717-TEST',
    ]);
    expect(options.headers.Authorization).toBe('Bearer secret');
  });

  it('save 트랜잭션의 일부 명령이 실패하면 예외를 던진다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: 'OK' }, { error: 'ERR something' }],
    });
    const store = createInquiryStore(cfg, fetchMock);
    const record = buildInquiryRecord(value, {}, { now: NOW, id: 'JM-20260717-TEST' });
    await expect(store.save(record)).rejects.toThrow('redis_ERR something');
  });

  it('list는 인덱스 최신순 조회 후 MGET으로 레코드를 복원한다', async () => {
    const recordA = { id: 'A', receivedAt: NOW.toISOString() };
    const fetchMock = fetchReturning([['A', 'B'], [JSON.stringify(recordA), null]]);
    const store = createInquiryStore(cfg, fetchMock);
    const items = await store.list(10);

    const [zrangeCall, mgetCall] = fetchMock.mock.calls.map(([, options]) =>
      JSON.parse(options.body),
    );
    expect(zrangeCall).toEqual(['ZRANGE', 'inquiry:index', '0', '9', 'REV']);
    expect(mgetCall).toEqual(['MGET', 'inquiry:A', 'inquiry:B']);
    expect(items).toEqual([recordA]); // null(유실) 건은 걸러진다
  });

  it('빈 인덱스면 MGET 없이 빈 배열을 돌려준다', async () => {
    const fetchMock = fetchReturning([[]]);
    const store = createInquiryStore(cfg, fetchMock);
    expect(await store.list()).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('ensureIndexed는 저장 본문의 목록 인덱스를 멱등 재등록한다', async () => {
    const fetchMock = fetchReturning([1]);
    const store = createInquiryStore(cfg, fetchMock);
    const record = buildInquiryRecord(value, {}, { now: NOW, id: 'JM-RECOVER' });
    await store.ensureIndexed(record);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual([
      'ZADD', 'inquiry:index', String(NOW.getTime()), 'JM-RECOVER',
    ]);
  });

  it('listAll은 상한 없이 페이지를 끝까지 읽고 본문 유실 항목만 건너뛴다', async () => {
    const a = JSON.stringify({ id: 'A' });
    const b = JSON.stringify({ id: 'B' });
    const c = JSON.stringify({ id: 'C' });
    const fetchMock = fetchReturning([
      ['A', 'B'], [a, b],
      ['C'], [c],
    ]);
    const items = await createInquiryStore(cfg, fetchMock).listAll(2);
    expect(items).toEqual([{ id: 'A' }, { id: 'B' }, { id: 'C' }]);
    const commands = fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body));
    expect(commands[0]).toEqual(['ZRANGE', 'inquiry:index', '0', '1', 'REV']);
    expect(commands[2]).toEqual(['ZRANGE', 'inquiry:index', '2', '3', 'REV']);
  });

  it('HTTP 오류·Redis 오류를 예외로 올린다', async () => {
    const httpFail = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(createInquiryStore(cfg, httpFail).get('X')).rejects.toThrow('redis_http_500');

    const redisFail = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ error: 'WRONGTYPE' }) });
    await expect(createInquiryStore(cfg, redisFail).get('X')).rejects.toThrow('redis_WRONGTYPE');
  });
});
