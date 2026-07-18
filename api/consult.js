import { validateConsultPayload, formatTelegramMessage } from './_validate.mjs';
import {
  buildInquiryRecord,
  checkRateLimit,
  acquireSubmissionProcessing,
  claimSubmission,
  createInquiryStore,
  redisConfig,
} from './_store.mjs';
import { applyCors } from './_cors.mjs';

export default async function handler(req, res) {
  const origin = req.headers.origin ?? '';
  if (applyCors(req, res, { methods: 'POST, OPTIONS' })) return;

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  // 개업 전에는 화면뿐 아니라 API 자체를 닫는다. 개업 시 Vercel 환경변수 CONSULT_OPEN=true.
  if (process.env.CONSULT_OPEN !== 'true') {
    res.status(503).json({ ok: false, error: 'not_accepting' });
    return;
  }

  // IP 단위 요청 제한 (분당 5회). 제한기 장애 시에는 접수를 막지 않는다(fail-open).
  const cfg = redisConfig();
  if (cfg) {
    const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
    try {
      const allowed = await checkRateLimit(cfg, `ratelimit:consult:${ip}`);
      if (!allowed) {
        res.status(429).json({ ok: false, error: 'rate_limited' });
        return;
      }
    } catch {
      // 제한기 실패는 무시하고 접수를 계속 진행한다.
    }
  }

  const result = validateConsultPayload(req.body);
  if (!result.ok) {
    if (result.errors.includes('spam')) {
      // 허니팟에 걸린 요청은 조용히 성공으로 응답하고 폐기한다.
      res.status(200).json({ ok: true });
      return;
    }
    res.status(400).json({ ok: false, errors: result.errors });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(500).json({ ok: false, error: 'server_config' });
    return;
  }

  // 멱등성: 같은 submissionId의 재제출은 기존 저장 본문을 확인한 뒤에만
  // 중복 성공으로 응답한다. 선점만 있고 본문이 없으면 같은 접수번호로 복구한다.
  let record = buildInquiryRecord(result.value, { origin });
  let store = cfg ? createInquiryStore(cfg) : null;
  if (cfg && result.value.submissionId) {
    try {
      const claim = await claimSubmission(cfg, result.value.submissionId, record.id);
      if (!claim.claimed && claim.existingId) {
        const existing = await store.get(claim.existingId);
        if (existing) {
          try {
            await store.ensureIndexed(existing);
          } catch {
            res.status(503).json({ ok: false, error: 'inquiry_index_unavailable' });
            return;
          }
          res.status(200).json({ ok: true, id: claim.existingId, duplicate: true });
          return;
        }
        record = buildInquiryRecord(result.value, { origin }, { id: claim.existingId });
      }
      const acquired = await acquireSubmissionProcessing(cfg, result.value.submissionId);
      if (!acquired) {
        res.status(409).json({ ok: false, error: 'submission_pending' });
        return;
      }
    } catch (error) {
      if (error?.code === 'SUBMISSION_LOOKUP_FAILED') {
        // 기존 ID를 모르는 상태에서 새 ID로 저장하면 한 제출이 둘로 갈라질 수 있다.
        res.status(503).json({ ok: false, error: 'idempotency_lookup_failed' });
        return;
      }
      // 최초 선점/처리 잠금 자체의 저장소 장애는 사용자 결정에 따른 텔레그램
      // 전체 폴백으로 넘긴다. 새 DB 레코드를 만들지 않아 dedup 분기를 피한다.
      store = null;
    }
  }

  // 접수 기록 저장 (저장소 미설정·장애 시에도 텔레그램 알림은 계속 발송)
  let stored = false;
  let indexRepairFailed = false;
  if (store) {
    try {
      await store.save(record);
      stored = true;
    } catch {
      // 응답 유실로 실제로는 저장됐을 수 있으므로 read-back으로 재확인한다
      // (불필요한 개인정보 폴백 알림 방지).
      try {
        const saved = await store.get(record.id);
        stored = Boolean(saved);
        if (saved) {
          try {
            await store.ensureIndexed(saved);
          } catch {
            indexRepairFailed = true;
          }
        }
      } catch {
        stored = false;
      }
    }
  }

  // 저장에 실패하면(미설정 포함) 알림이 유일한 기록이므로 전체 내용 폴백을 쓴다.
  const text = formatTelegramMessage(result.value, {
    origin,
    inquiryId: record.id,
    storeError: !stored,
    urgent: Boolean(record.diagnosis?.counts?.urgent),
    indexWarning: indexRepairFailed,
  });
  // 알림 실패(네트워크 예외 포함)가 500으로 번져 고객이 재제출→중복 접수가 되지 않도록 감싼다.
  let notified = false;
  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    notified = tgResponse.ok;
  } catch {
    notified = false;
  }

  if (!notified && !stored) {
    // 알림·저장 모두 실패한 경우에만 실패로 응답 (한쪽이라도 기록되면 접수 성공)
    res.status(502).json({ ok: false, error: 'notify_failed' });
    return;
  }
  res.status(200).json({ ok: true, id: record.id });
}
