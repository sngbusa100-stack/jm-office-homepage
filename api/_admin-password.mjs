import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { checkRateLimit, clientIp, rateLimitKey, redisConfig } from './_store.mjs';

const derive = promisify(scrypt);
const PASSWORD_HASH = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
const SESSION = /^Bearer (jm1\.(\d{10})\.[a-f0-9]{32})\.([a-f0-9]{64})$/;
const SESSION_SECONDS = 30 * 24 * 60 * 60;

function signature(payload) {
  // 회전된 서버 키와 변경된 비밀번호 모두 기존 기기의 인증을 무효로 만든다.
  return createHmac('sha256', process.env.ADMIN_TOKEN)
    .update('admin-session\0').update(process.env.ADMIN_PASSWORD_HASH).update('\0').update(payload).digest();
}

export function validAdminSession(header) {
  if (typeof header !== 'string' || !process.env.ADMIN_TOKEN || !PASSWORD_HASH.test(process.env.ADMIN_PASSWORD_HASH ?? '')) return false;
  const match = SESSION.exec(header);
  if (!match || Number(match[2]) <= Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(signature(match[1]), Buffer.from(match[3], 'hex'));
}

export async function loginWithPassword(req, res) {
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.status(415).json({ ok: false, error: 'json_required' });
  }
  const cfg = redisConfig();
  const hash = PASSWORD_HASH.exec(process.env.ADMIN_PASSWORD_HASH ?? '');
  if (!hash || !process.env.ADMIN_TOKEN || !cfg) {
    return res.status(503).json({ ok: false, error: 'login_unavailable' });
  }
  try {
    // 비싼 비밀번호 파생 연산 전에 모든 로그인 시도를 센다. 제한기 장애 때는 잠시 닫는다.
    const allowed = await checkRateLimit(cfg, rateLimitKey('adminpassword', clientIp(req)), { limit: 10, windowSec: 300 });
    if (!allowed) return res.status(429).json({ ok: false, error: 'rate_limited' });
    const password = req.body?.password;
    if (typeof password !== 'string' || !password.length || Buffer.byteLength(password, 'utf8') > 1024) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    const derived = await derive(password, Buffer.from(hash[1], 'hex'), 64, { N: 16384, r: 8, p: 1 });
    if (!timingSafeEqual(derived, Buffer.from(hash[2], 'hex'))) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    const payload = ['jm1', expires, randomBytes(16).toString('hex')].join('.');
    const sessionToken = payload + '.' + signature(payload).toString('hex');
    return res.status(200).json({ ok: true, sessionToken });
  } catch {
    return res.status(503).json({ ok: false, error: 'login_unavailable' });
  }
}
