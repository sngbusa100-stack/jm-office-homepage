import { validateConsultPayload, formatTelegramMessage } from './_validate.mjs';
import { buildInquiryRecord, checkRateLimit, createInquiryStore, redisConfig } from './_store.mjs';
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

  // 접수 기록 저장 (저장소 미설정·장애 시에도 텔레그램 알림은 계속 발송)
  const record = buildInquiryRecord(result.value, { origin });
  let stored = false;
  if (cfg) {
    try {
      await createInquiryStore(cfg).save(record);
      stored = true;
    } catch {
      stored = false;
    }
  }

  // 저장에 실패하면(미설정 포함) 알림이 유일한 기록이므로 전체 내용 폴백을 쓴다.
  const text = formatTelegramMessage(result.value, {
    origin,
    inquiryId: record.id,
    storeError: !stored,
    urgent: Boolean(record.diagnosis?.counts?.urgent),
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
