// 상담 접수 데이터 저장소 (_접두사라 엔드포인트로 노출되지 않음)
// - 순수 로직(레코드 생성·패치·파기)과 Upstash Redis REST 호출을 분리해 테스트한다.
// - 저장소 미설정(환경변수 없음) 시에도 접수 자체는 동작하도록 호출부에서 redisConfig()로 분기한다.

export const STATUSES = ['new', 'in_progress', 'done', 'on_hold'];

/** 접수 레코드 구조 버전. 필드가 바뀌면 올린다 (v1: 07-17 최초, v2: 진단·동의·유입경로 추가). */
export const SCHEMA_VERSION = 2;

/** 개인정보 수집 동의 문구 버전 — 개인정보처리방침 개정일과 맞춘다. */
export const CONSENT_VERSION = '2026-07-18';

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
    if (STATUSES.includes(patch.status)) next.status = patch.status;
    else errors.push('status');
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
 * 개인정보 파기: 이름·연락처·상담 내용·메모를 제거하고
 * 통계용 필드(접수번호·접수일·분야·상태)만 남긴다.
 */
export function purgeInquiryRecord(record, now = new Date()) {
  return {
    id: record.id,
    schemaVersion: record.schemaVersion ?? 1,
    receivedAt: record.receivedAt,
    topic: record.topic,
    status: record.status,
    origin: record.origin ?? '',
    ...(record.sourcePath ? { sourcePath: record.sourcePath } : {}),
    ...(record.utmSource ? { utmSource: record.utmSource } : {}),
    memoCount: (record.memos ?? []).length,
    purged: true,
    purgedAt: now.toISOString(),
  };
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

/** Upstash Redis REST 기반 접수 저장소. fetchImpl 주입으로 테스트한다. */
export function createInquiryStore(cfg, fetchImpl = fetch) {
  const key = (id) => `${KEY_PREFIX}${id}`;
  return {
    async save(record) {
      await command(cfg, ['SET', key(record.id), JSON.stringify(record)], fetchImpl);
      await command(
        cfg,
        ['ZADD', INDEX_KEY, String(Date.parse(record.receivedAt)), record.id],
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
