// 상담 접수 데이터 저장소 (_접두사라 엔드포인트로 노출되지 않음)
// - 순수 로직(레코드 생성·패치·파기)과 Upstash Redis REST 호출을 분리해 테스트한다.
// - 저장소 미설정(환경변수 없음) 시에도 접수 자체는 동작하도록 호출부에서 redisConfig()로 분기한다.

export const STATUSES = ['new', 'in_progress', 'done', 'on_hold'];

/** 접수 레코드 구조 버전. 필드가 바뀌면 올린다 (v1: 07-17 최초, v2: 진단·동의·유입경로 추가). */
export const SCHEMA_VERSION = 2;

/** 개인정보 수집 동의 문구 버전 — 개인정보처리방침 개정일과 맞춘다. */
export const CONSENT_VERSION = '2026-07-18';

/** 처리 완료(done) 후 개인정보 보존 일수 — 행정심판 청구기간(90일)과 후속 절차 대응을 고려해 120일. */
export const RETENTION_DAYS = 120;

const KEY_PREFIX = 'inquiry:';
const INDEX_KEY = 'inquiry:index';

/** 접수번호: JM-YYYYMMDD-XXXX (KST 날짜 + 무작위 4자). 전화 안내에서 부르기 쉬운 형식. */
export function generateInquiryId(now = new Date(), random = Math.random) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const ymd = kst.toISOString().slice(0, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 혼동 문자(I/L/O/0/1) 제외
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += alphabet[Math.floor(random() * alphabet.length) % alphabet.length];
  }
  return `JM-${ymd}-${suffix}`;
}

/** 검증 통과한 접수 값으로 저장용 레코드를 만든다. */
export function buildInquiryRecord(value, meta = {}, { id, now = new Date() } = {}) {
  return {
    id: id ?? generateInquiryId(now),
    schemaVersion: SCHEMA_VERSION,
    receivedAt: now.toISOString(),
    name: value.name,
    phone: value.phone,
    ...(value.email ? { email: value.email } : {}),
    topic: value.topic,
    message: value.message ?? '',
    ...(value.diagnosis ? { diagnosis: value.diagnosis } : {}),
    ...(value.sourcePath ? { sourcePath: value.sourcePath } : {}),
    ...(value.utmSource ? { utmSource: value.utmSource } : {}),
    consent: { version: CONSENT_VERSION, at: now.toISOString() },
    origin: meta.origin ?? '',
    status: 'new',
    memos: [],
  };
}

/**
 * 상태 변경·메모 추가 패치를 적용한다. 원본은 변경하지 않는다.
 * @returns {{ok:true, value:object} | {ok:false, errors:string[]}}
 */
export function applyInquiryPatch(record, patch = {}, now = new Date()) {
  const errors = [];
  if (!record || typeof record !== 'object') return { ok: false, errors: ['not_found'] };

  const next = { ...record, memos: [...(record.memos ?? [])] };

  if (patch.status !== undefined) {
    if (STATUSES.includes(patch.status)) {
      next.status = patch.status;
      // 자동 파기 기산점: 완료로 바뀌면 완료 시각을 기록하고, 완료가 풀리면 지운다.
      if (patch.status === 'done') next.doneAt = now.toISOString();
      else delete next.doneAt;
    } else {
      errors.push('status');
    }
  }
  if (patch.memo !== undefined) {
    const text = typeof patch.memo === 'string' ? patch.memo.trim() : '';
    if (text.length >= 1 && text.length <= 1000) next.memos.push({ at: now.toISOString(), text });
    else errors.push('memo');
  }
  if (patch.status === undefined && patch.memo === undefined) errors.push('empty_patch');

  if (errors.length > 0) return { ok: false, errors };
  next.updatedAt = now.toISOString();
  return { ok: true, value: next };
}

/**
 * 로컬 연동기 ACK: 행정심판 시스템이 이 접수를 가져가 사건으로 등록했음을 표시한다.
 * 이미 ACK된 레코드는 변경 없이 그대로 돌려준다(멱등 — 연동기 재시도 안전).
 */
export function applyConnectorAck(record, localCaseId, now = new Date()) {
  if (!record || typeof record !== 'object') return { ok: false, errors: ['not_found'] };
  if (record.purged) return { ok: false, errors: ['purged'] };
  if (record.pulledAt) return { ok: true, value: record, already: true };
  const caseId = typeof localCaseId === 'string' ? localCaseId.trim().slice(0, 40) : '';
  if (!caseId) return { ok: false, errors: ['local_case_id'] };
  return {
    ok: true,
    value: {
      ...record,
      pulledAt: now.toISOString(),
      localCaseId: caseId,
      updatedAt: now.toISOString(),
    },
  };
}

/**
 * 개인정보 파기: 처리방침("상담 분야·접수일만 남는다")과 일치하도록
 * 이름·연락처·상담 내용·메모·진단·동의 기록은 물론 origin·유입경로(임의
 * 문자열이라 식별값이 실릴 수 있음)까지 제거하고 통계 필드만 남긴다.
 */
export function purgeInquiryRecord(record, now = new Date()) {
  return {
    id: record.id,
    schemaVersion: record.schemaVersion ?? 1,
    receivedAt: record.receivedAt,
    topic: record.topic,
    status: record.status,
    memoCount: (record.memos ?? []).length,
    purged: true,
    purgedAt: now.toISOString(),
  };
}

/**
 * 자동 파기 대상 판정: 완료(done) 후 보존기간(RETENTION_DAYS)이 지난 미파기 레코드.
 * 과거(v1) 레코드에 doneAt이 없으면 updatedAt, 그것도 없으면 receivedAt을 기산점으로 쓴다.
 */
export function isRetentionExpired(record, now = new Date(), retentionDays = RETENTION_DAYS) {
  if (!record || record.purged || record.status !== 'done') return false;
  const baseIso = record.doneAt ?? record.updatedAt ?? record.receivedAt;
  const base = Date.parse(baseIso ?? '');
  if (!Number.isFinite(base)) return false;
  return now.getTime() - base > retentionDays * 24 * 60 * 60 * 1000;
}

/** Vercel KV(구) 또는 Upstash 통합이 주입하는 환경변수를 읽는다. 미설정이면 null. */
export function redisConfig(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function command(cfg, cmd, fetchImpl) {
  const response = await fetchImpl(cfg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!response.ok) throw new Error(`redis_http_${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(`redis_${data.error}`);
  return data.result;
}

/**
 * 여러 명령을 Upstash 트랜잭션(MULTI/EXEC)으로 원자 실행한다.
 * SET(본문)과 ZADD(목록 인덱스)가 따로 실패해 목록에 안 보이는 고아 레코드가
 * 생기는 것을 막는다.
 */
async function transaction(cfg, cmds, fetchImpl) {
  const response = await fetchImpl(`${cfg.url}/multi-exec`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!response.ok) throw new Error(`redis_http_${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`redis_${data?.error ?? 'tx_bad_response'}`);
  for (const item of data) {
    if (item && item.error) throw new Error(`redis_${item.error}`);
  }
  return data.map((item) => item?.result);
}

/**
 * IP 단위 요청 제한. windowSec 동안 limit회를 넘으면 false.
 * 제한기 자체의 장애로 접수를 막지 않도록 호출부에서 fail-open으로 감싼다.
 */
export async function checkRateLimit(cfg, key, { limit = 5, windowSec = 60 } = {}, fetchImpl = fetch) {
  const results = await transaction(
    cfg,
    [
      ['INCR', key],
      ['EXPIRE', key, String(windowSec), 'NX'],
    ],
    fetchImpl,
  );
  const count = Number(results[0]);
  return Number.isFinite(count) ? count <= limit : true;
}

/** Upstash Redis REST 기반 접수 저장소. fetchImpl 주입으로 테스트한다. */
export function createInquiryStore(cfg, fetchImpl = fetch) {
  const key = (id) => `${KEY_PREFIX}${id}`;
  return {
    async save(record) {
      await transaction(
        cfg,
        [
          ['SET', key(record.id), JSON.stringify(record)],
          ['ZADD', INDEX_KEY, String(Date.parse(record.receivedAt)), record.id],
        ],
        fetchImpl,
      );
    },
    async get(id) {
      const raw = await command(cfg, ['GET', key(id)], fetchImpl);
      return raw ? JSON.parse(raw) : null;
    },
    /** 최신순 목록. limit 기본 500건 (저용량 사무소 규모 가정). */
    async list(limit = 500) {
      const ids = await command(
        cfg,
        ['ZRANGE', INDEX_KEY, '0', String(limit - 1), 'REV'],
        fetchImpl,
      );
      if (!Array.isArray(ids) || ids.length === 0) return [];
      const raws = await command(cfg, ['MGET', ...ids.map(key)], fetchImpl);
      return raws.filter(Boolean).map((raw) => JSON.parse(raw));
    },
  };
}
