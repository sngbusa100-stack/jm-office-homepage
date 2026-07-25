import { randomBytes } from 'node:crypto';
import { applyCors } from './_cors.mjs';
import {
  createVisaHandoffStore,
  sanitizeVisaHandoff,
} from './_visa-handoff.mjs';
import { checkRateLimit, redisConfig } from './_store.mjs';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,80}$/;

function createToken() {
  return randomBytes(24).toString('base64url');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, private');
  if (applyCors(req, res, { methods: 'POST, OPTIONS' })) return;

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  if (process.env.CONSULT_OPEN !== 'true') {
    res.status(503).json({ ok: false, error: 'not_accepting' });
    return;
  }

  const cfg = redisConfig();
  if (!cfg) {
    res.status(503).json({ ok: false, error: 'handoff_unavailable' });
    return;
  }
  const store = createVisaHandoffStore(cfg);

  if (req.body?.action !== 'consume') {
    const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
    try {
      const allowed = await checkRateLimit(
        cfg,
        `ratelimit:visa-handoff:${ip}`,
        { limit: 20, windowSec: 60 },
      );
      if (!allowed) {
        res.status(429).json({ ok: false, error: 'rate_limited' });
        return;
      }
    } catch {
      // 진단 전달 자체에는 개인정보가 없으므로 제한기 장애 시 본 처리를 계속한다.
    }

    const diagnosis = sanitizeVisaHandoff(req.body);
    if (!diagnosis) {
      res.status(400).json({ ok: false, error: 'invalid_handoff' });
      return;
    }

    const token = createToken();
    try {
      await store.save(token, {
        ...diagnosis,
        consentedAt: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({ ok: false, error: 'handoff_unavailable' });
      return;
    }
    res.status(201).json({ ok: true, token, expiresIn: 1800 });
    return;
  }

  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  if (!TOKEN_PATTERN.test(token)) {
    res.status(400).json({ ok: false, error: 'invalid_token' });
    return;
  }
  try {
    const visaDiagnosis = await store.consume(token);
    if (!visaDiagnosis) {
      res.status(404).json({ ok: false, error: 'handoff_expired' });
      return;
    }
    res.status(200).json({ ok: true, visaDiagnosis });
  } catch {
    res.status(503).json({ ok: false, error: 'handoff_unavailable' });
  }
}
