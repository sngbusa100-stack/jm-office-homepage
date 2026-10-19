import { createHmac } from 'node:crypto';

// 상담 접수 데이터 저장소 (_접두사라 엔드포인트로 노출되지 않음)
// - 순수 로직(레코드 생성·패치·파기)과 Upstash Redis REST 호출을 분리해 테스트한다.
// - 저장소 미설정(환경변수 없음) 시에도 접수 자체는 동작하도록 호출부에서 redisConfig()로 분기한다.

export const STATUSES = ['new', 'in_progress', 'done', 'on_hold'];
export const PIPELINE_STAGES = ['inquiry', 'qualified', 'retained', 'work_completed'];

/** 접수 레코드 구조 버전. v5: 동의 기반 비자 진단 첨부, v6: 출입국·비자 접수 질문(visaIntake) 추가. */
export const SCHEMA_VERSION = 6;

/** 개인정보 수집 동의 문구 버전 — 개인정보처리방침 개정일과 맞춘다. */
export const CONSENT_VERSION = '2026-10-19';

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
    ...(value.visaDiagnosis ? { visaDiagnosis: value.visaDiagnosis } : {}),
    ...(value.visaIntake ? { visaIntake: value.visaIntake } : {}),
    ...(value.sourcePath ? { sourcePath: value.sourcePath } : {}),
    ...(value.utmSource ? { utmSource: value.utmSource } : {}),
    ...(value.attribution ? { attribution: value.attribution } : {}),
    consent: { version: CONSENT_VERSION, at: now.toISOString() },
    origin: meta.origin ?? '',
    status: 'new',
    pipelineStage: 'inquiry',
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
      // 자동 파기 기산점: 완료로 처음 바뀔 때만 기록(중복 done 요청이 보존기간을
      // 연장하지 않도록), 완료가 풀리면 지운다.
      if (patch.status === 'done') {
        if (record.status !== 'done') next.doneAt = now.toISOString();
        else if (!record.doneAt) next.doneAt = record.updatedAt ?? record.receivedAt ?? now.toISOString();
      } else {
        delete next.doneAt;
      }
    } else {
      errors.push('status');
    }
  }
  if (patch.memo !== undefined) {
    const text = typeof patch.memo === 'string' ? patch.memo.trim() : '';
    if (text.length >= 1 && text.length <= 1000) next.memos.push({ at: now.toISOString(), text });
    else errors.push('memo');
  }
  if (patch.pipelineStage !== undefined) {
    if (PIPELINE_STAGES.includes(patch.pipelineStage)) {
      next.pipelineStage = patch.pipelineStage;
      next.pipelineStageAt = now.toISOString();
    } else {
      errors.push('pipeline_stage');
    }
  }
  if (patch.status === undefined && patch.memo === undefined && patch.pipelineStage === undefined) {
    errors.push('empty_patch');
  }

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
 * 로컬 연동기가 홈페이지 접수함에 돌려줄 수 있는 상태 값.
 * 연동 토큰으로는 이 값만 바꿀 수 있다(메모·연락처 등은 불가). 계약 파일 api/_inquiry-contract.json에도 실린다.
 */
export const CONNECTOR_STATUS_RULES = {
  statuses: ['in_progress', 'done'],
  pipelineStages: ['qualified', 'retained'],
  localStatuses: ['closed', 'case_created', 'engaged'],
  closeReasons: ['manual', 'not_engaged', 'auto_stale'],
};

/**
 * 로컬 처리 결과(종결·사건 전환·수임)를 홈페이지 접수 상태에 반영한다(docs/2026-10-19-pipeline-link-plan.md).
 * 로컬 '종결'은 홈페이지 '처리 완료'로 보며(2026-10-19 주인님 결정), doneAt은 처음 완료될 때만 기록해
 * 120일 보존 기산점이 재시도로 밀리지 않게 한다. 바뀐 것이 없으면 already로 돌려준다(멱등).
 */
export function applyConnectorStatus(record, input = {}, now = new Date()) {
  if (!record || typeof record !== 'object') return { ok: false, errors: ['not_found'] };
  if (record.purged) return { ok: false, errors: ['purged'] };
  if (!record.pulledAt) return { ok: false, errors: ['not_pulled'] };

  const { statuses, pipelineStages, localStatuses, closeReasons } = CONNECTOR_STATUS_RULES;
  const errors = [];
  const status = input.status;
  const pipelineStage = input.pipelineStage;
  const localStatus = input.localStatus;
  const closeReason = localStatus === 'closed' ? input.closeReason : undefined;
  if (!statuses.includes(status)) errors.push('status');
  if (pipelineStage !== undefined && !pipelineStages.includes(pipelineStage)) errors.push('pipeline_stage');
  if (!localStatuses.includes(localStatus)) errors.push('local_status');
  if (localStatus === 'closed') {
    if (status !== 'done' && !errors.includes('status')) errors.push('status');
    if (!closeReasons.includes(closeReason)) errors.push('close_reason');
  }
  if (errors.length > 0) return { ok: false, errors };

  const next = { ...record, status };
  // 자동 파기 기산점: applyInquiryPatch와 같은 규칙(처음 완료될 때만 기록, 완료가 풀리면 지움).
  if (status === 'done') {
    if (record.status !== 'done') next.doneAt = now.toISOString();
    else if (!record.doneAt) next.doneAt = record.updatedAt ?? record.receivedAt ?? now.toISOString();
  } else {
    delete next.doneAt;
  }
  if (pipelineStage !== undefined && record.pipelineStage !== pipelineStage) {
    next.pipelineStage = pipelineStage;
    next.pipelineStageAt = now.toISOString();
  }
  if (record.localStatus !== localStatus || record.localCloseReason !== closeReason) {
    next.localStatus = localStatus;
    next.localStatusAt = now.toISOString();
    if (closeReason) next.localCloseReason = closeReason;
    else delete next.localCloseReason;
  }

  const changed = ['status', 'doneAt', 'pipelineStage', 'localStatus', 'localCloseReason']
    .some((key) => next[key] !== record[key]);
  if (!changed) return { ok: true, value: record, already: true };
  next.updatedAt = now.toISOString();
  return { ok: true, value: next };
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
    pipelineStage: record.pipelineStage ?? 'inquiry',
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
 * 여러 명령을 Upstash MULTI/EXEC로 순서가 섞이지 않게 실행한다.
 * Redis의 런타임 명령 오류는 롤백되지 않으므로 호출부가 본문 read-back과
 * 인덱스 재등록으로 결과를 확인해야 한다.
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
 * 멱등성 키 선점: SET NX로 submissionId → 접수번호를 24시간 기록한다.
 * 이미 선점돼 있으면(응답 유실 후 재제출) 기존 접수번호를 돌려준다.
 */
export async function claimSubmission(cfg, submissionId, inquiryId, fetchImpl = fetch) {
  const key = `dedup:submission:${submissionId}`;
  const result = await command(cfg, ['SET', key, inquiryId, 'NX', 'EX', '86400'], fetchImpl);
  if (result === 'OK') return { claimed: true };
  let existingId;
  try {
    existingId = await command(cfg, ['GET', key], fetchImpl);
  } catch (cause) {
    const error = new Error('submission_lookup_failed', { cause });
    error.code = 'SUBMISSION_LOOKUP_FAILED';
    throw error;
  }
  return { claimed: false, existingId: typeof existingId === 'string' ? existingId : null };
}

/** 같은 submissionId를 처리하는 동시 요청을 30초 동안 하나로 제한한다. */
export async function acquireSubmissionProcessing(
  cfg,
  submissionId,
  { ttlSec = 30 } = {},
  fetchImpl = fetch,
) {
  const key = `dedup:processing:${submissionId}`;
  const result = await command(cfg, ['SET', key, '1', 'NX', 'EX', String(ttlSec)], fetchImpl);
  return result === 'OK';
}

/** 요청을 보낸 접속 IP(x-forwarded-for의 첫 주소). 없으면 'unknown'. */
export function clientIp(req) {
  return String(req.headers?.['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
}

let warnedMissingSecret = false;

/**
 * 요청 제한 키. 접속 IP 원문을 미국 Upstash에 남기지 않도록 RATE_LIMIT_SECRET으로
 * HMAC-SHA256을 만들어 앞 32자(128비트)만 쓴다(보고서 2-1 3번).
 * 비밀값이 없으면 비밀 없는 해시는 IPv4 전체를 쉽게 되돌릴 수 있어 의미가 없으므로,
 * 경고만 남기고 예전 키를 써서 요청 제한이 꺼지지 않게 한다.
 */
export function rateLimitKey(scope, ip, secret = process.env.RATE_LIMIT_SECRET) {
  if (!secret) {
    if (!warnedMissingSecret) {
      console.warn('[rate-limit] RATE_LIMIT_SECRET이 없어 접속 IP 원문으로 요청 제한 키를 만듭니다.');
      warnedMissingSecret = true;
    }
    return `ratelimit:${scope}:${ip}`;
  }
  const digest = createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32);
  return `ratelimit:${scope}:${digest}`;
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
    /** 본문 저장 후 목록 인덱스가 빠진 경우 재등록한다(멱등). */
    async ensureIndexed(record) {
      await command(
        cfg,
        ['ZADD', INDEX_KEY, String(Date.parse(record.receivedAt)), record.id],
        fetchImpl,
      );
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
    /** cron 전량 파기용 전체 목록. ID와 본문을 작은 묶음으로 읽는다. */
    async listAll(batchSize = 100) {
      const size = Math.max(1, Math.min(Math.floor(batchSize) || 100, 500));
      const records = [];
      for (let start = 0; ; start += size) {
        const ids = await command(
          cfg,
          ['ZRANGE', INDEX_KEY, String(start), String(start + size - 1), 'REV'],
          fetchImpl,
        );
        if (!Array.isArray(ids) || ids.length === 0) break;
        const raws = await command(cfg, ['MGET', ...ids.map(key)], fetchImpl);
        records.push(...raws.filter(Boolean).map((raw) => JSON.parse(raw)));
        if (ids.length < size) break;
      }
      return records;
    },
  };
}
