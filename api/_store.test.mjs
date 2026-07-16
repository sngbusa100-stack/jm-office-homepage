import { describe, expect, it, vi } from 'vitest';
import {
  STATUSES,
  applyInquiryPatch,
  buildInquiryRecord,
  createInquiryStore,
  generateInquiryId,
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
      receivedAt: record.receivedAt,
      topic: record.topic,
      status: 'new',
      origin: 'o',
      memoCount: 1,
      purged: true,
      purgedAt: NOW.toISOString(),
    });
    expect(purged.name).toBeUndefined();
    expect(purged.phone).toBeUndefined();
    expect(purged.message).toBeUndefined();
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

  it('save는 SET과 ZADD(접수시각 점수)를 호출한다', async () => {
    const fetchMock = fetchReturning(['OK', 1]);
    const store = createInquiryStore(cfg, fetchMock);
    const record = buildInquiryRecord(value, {}, { now: NOW, id: 'JM-20260717-TEST' });
    await store.save(record);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [setCall, zaddCall] = fetchMock.mock.calls.map(([, options]) =>
      JSON.parse(options.body),
    );
    expect(setCall[0]).toBe('SET');
    expect(setCall[1]).toBe('inquiry:JM-20260717-TEST');
    expect(JSON.parse(setCall[2]).name).toBe('홍길동');
    expect(zaddCall).toEqual([
      'ZADD',
      'inquiry:index',
      String(NOW.getTime()),
      'JM-20260717-TEST',
    ]);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer secret');
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

  it('HTTP 오류·Redis 오류를 예외로 올린다', async () => {
    const httpFail = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(createInquiryStore(cfg, httpFail).get('X')).rejects.toThrow('redis_http_500');

    const redisFail = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ error: 'WRONGTYPE' }) });
    await expect(createInquiryStore(cfg, redisFail).get('X')).rejects.toThrow('redis_WRONGTYPE');
  });
});
