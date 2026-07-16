import { validateConsultPayload, formatTelegramMessage } from './_validate.mjs';
import { buildInquiryRecord, createInquiryStore, redisConfig } from './_store.mjs';
import { applyCors } from './_cors.mjs';

export default async function handler(req, res) {
  const origin = req.headers.origin ?? '';
  if (applyCors(req, res, { methods: 'POST, OPTIONS' })) return;

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
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
  const cfg = redisConfig();
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

  const text = formatTelegramMessage(result.value, {
    origin,
    inquiryId: record.id,
    storeError: Boolean(cfg) && !stored,
  });
  const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!tgResponse.ok && !stored) {
    // 알림·저장 모두 실패한 경우에만 실패로 응답 (한쪽이라도 기록되면 접수 성공)
    res.status(502).json({ ok: false, error: 'notify_failed' });
    return;
  }
  res.status(200).json({ ok: true, id: record.id });
}
