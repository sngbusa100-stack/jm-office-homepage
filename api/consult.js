import { validateConsultPayload, formatTelegramMessage } from './_validate.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://sngbusa100-stack.github.io',
  'https://jm-office-homepage.vercel.app',
  'http://localhost:5173',
];

function allowedOrigins() {
  const extra = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

export default async function handler(req, res) {
  const origin = req.headers.origin ?? '';
  const allowed = allowedOrigins();
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
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

  const text = formatTelegramMessage(result.value, { origin });
  const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!tgResponse.ok) {
    res.status(502).json({ ok: false, error: 'notify_failed' });
    return;
  }
  res.status(200).json({ ok: true });
}
