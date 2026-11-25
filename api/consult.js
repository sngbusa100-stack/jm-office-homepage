import { validateConsultPayload, formatTelegramMessage } from './_validate.mjs';
import {
  buildInquiryRecord,
  checkRateLimit,
  acquireSubmissionProcessing,
  claimSubmission,
  clientIp,
  createInquiryStore,
  rateLimitKey,
  redisConfig,
} from './_store.mjs';
import { applyCors } from './_cors.mjs';
import { sendTelegram } from './_telegram.mjs';
import { urgentReasons } from './_urgency.mjs';

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
    const limitKey = rateLimitKey('consult', clientIp(req));
    try {
      const allowed = await checkRateLimit(cfg, limitKey);
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

  // 멱등성: 같은 submissionId의 재제출은 기존 저장 본문을 확인한 뒤에만
  // 중복 성공으로 응답한다. 선점만 있고 본문이 없으면 같은 접수번호로 복구한다.
  let record = buildInquiryRecord(result.value, { origin });
  const store = cfg ? createInquiryStore(cfg) : null;
  if (cfg && result.value.submissionId) {
    try {
      const claim = await claimSubmission(cfg, result.value.submissionId, record.id);
      if (!claim.claimed) {
        if (!claim.existingId) {
          await reportStorageFailure(res, record.id);
          return;
        }
        record = buildInquiryRecord(result.value, { origin }, { id: claim.existingId });
        const existing = await store.get(record.id);
        if (existing) {
          if (await store.ensureIndexed(existing)) await notifyInquiry(existing);
          res.status(200).json({ ok: true, id: record.id, duplicate: true });
          return;
        }
      }
      const acquired = await acquireSubmissionProcessing(cfg, result.value.submissionId);
      if (!acquired) {
        res.status(409).json({ ok: false, error: 'submission_pending' });
        return;
      }
    } catch {
      // 기존 접수번호를 확인하지 못하면 새 레코드를 만들지 않는다.
      await reportStorageFailure(res, record.id);
      return;
    }
  }

  let stored = false;
  if (store) {
    try {
      await store.save(record);
      stored = true;
    } catch {
      // 응답 유실로 실제로는 저장됐을 수 있으므로 read-back으로 재확인한다
      // 목록에 다시 표시할 수 있는지도 함께 확인한다.
      try {
        const saved = await store.get(record.id);
        stored = Boolean(saved);
        if (saved) {
          try {
            await store.ensureIndexed(saved);
          } catch {
            stored = false;
          }
        }
      } catch {
        stored = false;
      }
    }
  }

  if (!stored) {
    await reportStorageFailure(res, record.id);
    return;
  }
  await notifyInquiry(record);
  res.status(200).json({ ok: true, id: record.id });
}

// 알림 실패는 무시한다. 고객에게 보내는 응답은 대기함에 저장된 상태로 결정한다.
function notifyInquiry(record) {
  return sendTelegram(formatTelegramMessage(null, { inquiryId: record.id, urgentReasons: urgentReasons(record) }));
}

async function reportStorageFailure(res, inquiryId) {
  await sendTelegram(formatTelegramMessage(null, { inquiryId, storeError: true }));
  res.status(503).json({ ok: false, error: 'inquiry_storage_unavailable' });
}
