import { applyCors } from './_cors.mjs';
import { createFunnelStore, sanitizeFunnelEvent } from './_funnel.mjs';
import { checkRateLimit, redisConfig } from './_store.mjs';

export default async function handler(req, res) {
  if (applyCors(req, res, { methods: 'POST, OPTIONS' })) return;
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const value = sanitizeFunnelEvent(req.body);
  if (!value) {
    res.status(400).json({ ok: false, error: 'invalid_event' });
    return;
  }

  const cfg = redisConfig();
  if (!cfg) {
    // 측정 장애가 공개 페이지를 막지 않도록 수신만 확인한다.
    res.status(202).json({ ok: true, stored: false });
    return;
  }

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
  try {
    const allowed = await checkRateLimit(
      cfg,
      `ratelimit:funnel:${ip}`,
      { limit: 120, windowSec: 60 },
    );
    if (!allowed) {
      res.status(429).json({ ok: false, error: 'rate_limited' });
      return;
    }
  } catch {
    // 통계 제한기 장애는 집계 시도로 계속 진행한다.
  }

  try {
    await createFunnelStore(cfg).increment(value);
    res.status(202).json({ ok: true, stored: true });
  } catch {
    // 사용자는 정상 이동을 계속할 수 있고, 이벤트만 유실된다.
    res.status(202).json({ ok: true, stored: false });
  }
}
