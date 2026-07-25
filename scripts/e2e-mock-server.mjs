import { createServer } from 'node:http';

const port = Number(process.env.E2E_MOCK_PORT ?? 3300);
const handoffs = new Map();

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/funnel') {
    json(res, 202, { ok: true });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/visa-handoff') {
    const payload = await readBody(req);
    if (payload.action === 'consume') {
      const visaDiagnosis = handoffs.get(payload.token);
      handoffs.delete(payload.token);
      json(
        res,
        visaDiagnosis ? 200 : 404,
        visaDiagnosis
          ? { ok: true, visaDiagnosis }
          : { ok: false, error: 'handoff_expired' },
      );
      return;
    }
    const token = 'e2e-handoff-token-20260725';
    handoffs.set(token, {
      ...payload,
      level: 'checked',
      questionCount: Object.keys(payload.answers ?? {}).length,
      consentedAt: new Date().toISOString(),
    });
    json(res, 201, { ok: true, token, expiresIn: 1800 });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/consult') {
    json(res, 200, { ok: true, id: 'JM-E2E-20260725' });
    return;
  }
  json(res, 404, { ok: false, error: 'not_found' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`E2E mock API ready on http://127.0.0.1:${port}`);
});
