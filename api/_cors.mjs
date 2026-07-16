// 공용 CORS 처리 (_접두사라 엔드포인트로 노출되지 않음)

const DEFAULT_ALLOWED_ORIGINS = [
  'https://sngbusa100-stack.github.io',
  'https://jm-office-homepage.vercel.app',
  'http://localhost:5173',
];

export function allowedOrigins(env = process.env) {
  const extra = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

/** CORS 헤더를 설정하고, OPTIONS 프리플라이트면 204로 종료하고 true를 돌려준다. */
export function applyCors(req, res, { methods }) {
  const origin = req.headers.origin ?? '';
  const allowed = allowedOrigins();
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
