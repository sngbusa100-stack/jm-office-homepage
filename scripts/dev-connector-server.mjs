// 개발용 왕복 실측 서버 — 운영 Upstash·운영 접수를 건드리지 않고 로컬 연동기를 시험한다.
// 실제 api/connector.js 핸들러를 메모리 저장소(Upstash REST 흉내)에 붙여 띄운다.
//   node scripts/dev-connector-server.mjs [포트=3399]
// 로컬 행정심판 시스템에서: CONNECTOR_BASE_URL=http://127.0.0.1:3399/api/connector CONNECTOR_TOKEN=dev-connector
//   python -m admin_appeal.connector.pull_inquiries --db <임시 DB 경로>
//   ⚠ --db를 빼면 운영 DB(data/admin_appeal.db)에 시험 접수가 들어가고 91일 건은 자동 종결된다. 반드시 임시 DB를 쓴다.
// 시험용 접수 3건(비자·음주운전·91일 지난 인허가)을 미리 넣는다. GET /__dump?id=… 로 저장 상태를 본다.
import http from 'node:http';

const port = Number(process.argv[2] ?? 3399);
const data = new Map();
const index = new Map(); // id → score

function apply(cmd) {
  const [name, ...args] = cmd;
  switch (name) {
    case 'GET': return data.get(args[0]) ?? null;
    case 'SET': data.set(args[0], args[1]); return 'OK';
    case 'MGET': return args.map((key) => data.get(key) ?? null);
    case 'ZADD': index.set(args[2], Number(args[1])); return 1; // [key, score, member]
    case 'ZRANGE': {
      const ids = [...index.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
      return ids.slice(Number(args[1]), Number(args[2]) + 1); // [key, start, stop, REV]
    }
    case 'INCR': { const n = Number(data.get(args[0]) ?? 0) + 1; data.set(args[0], String(n)); return n; }
    case 'EXPIRE': return 1;
    default: throw new Error(`unsupported ${name}`);
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => resolve(raw));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  const raw = await readBody(req);
  const send = (code, payload) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
  };
  if (url.pathname === '/redis/multi-exec') {
    send(200, JSON.parse(raw).map((cmd) => ({ result: apply(cmd) })));
    return;
  }
  if (url.pathname === '/redis') {
    send(200, { result: apply(JSON.parse(raw)) });
    return;
  }
  if (url.pathname === '/__dump') {
    const value = data.get(`inquiry:${url.searchParams.get('id')}`);
    send(value ? 200 : 404, value ? JSON.parse(value) : { error: 'not_found' });
    return;
  }
  if (url.pathname === '/api/connector') {
    const fake = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { send(this.statusCode, payload); return this; },
    };
    await handler({ method: req.method, headers: req.headers, body: raw ? JSON.parse(raw) : undefined }, fake);
    return;
  }
  send(404, { error: 'not_found' });
});

process.env.KV_REST_API_URL = `http://127.0.0.1:${port}/redis`;
process.env.KV_REST_API_TOKEN = 'dev-redis';
process.env.CONNECTOR_TOKEN = 'dev-connector';
const { default: handler } = await import('../api/connector.js');
const { buildInquiryRecord, createInquiryStore, redisConfig } = await import('../api/_store.mjs');

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
const store = createInquiryStore(redisConfig());
const day = 24 * 60 * 60 * 1000;
await store.save(buildInquiryRecord({
  name: '응우옌(시험)', phone: '010-0000-0001', topic: '출입국 · 비자', message: '체류기간 연장 보완요청 마감이 다가옵니다.',
  visaIntake: { requester: 'self', stayStatus: 'near-expiry', currentStatus: 'work', goal: 'extend', stage: 'supplement',
    receivedDate: '2026-10-10', deadlineDate: '2026-10-24', language: 'vi', deadlineFirst: true },
  attribution: { source: 'jm_visa_precheck' },
}, { origin: 'http://localhost' }, { id: 'JM-DEV-VISA', now: new Date(Date.now() - 2 * 60 * 60 * 1000) }));
await store.save(buildInquiryRecord({
  name: '홍길동(시험)', phone: '010-0000-0002', topic: '음주운전 면허 구제', message: '면허 취소 통지',
}, {}, { id: 'JM-DEV-DUI', now: new Date(Date.now() - 60 * 60 * 1000) }));
await store.save(buildInquiryRecord({
  name: '김오래(시험)', phone: '010-0000-0003', topic: '인허가', message: '91일 전 문의',
}, {}, { id: 'JM-DEV-OLD', now: new Date(Date.now() - 91 * day) }));
console.log(`[dev-connector] http://127.0.0.1:${port}/api/connector (token dev-connector) — 시험 접수 3건 준비`);
