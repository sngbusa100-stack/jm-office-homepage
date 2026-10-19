// Vercel Cron이 매일 아침(한국 08시대) 호출한다 — 관리자 접속과 무관하게 실행된다.
// 1) 완료(done) 후 120일이 지난 접수를 전량 스캔해 파기한다 (개인정보처리방침 §보관·파기).
// 2) 이어서 접수·연동기·파기 상태를 Telegram 운영 요약으로 보낸다 (docs/2026-10-19-daily-ops-summary-plan.md).
//    파기·집계·발송은 서로 감싸서 하나가 실패해도 나머지는 진행한다.
// 인증: Vercel Cron이 CRON_SECRET 환경변수를 Authorization: Bearer로 자동 첨부한다.

import {
  formatDailySummary,
  formatStorageFailureSummary,
  summarizeInquiries,
} from './_daily-summary.mjs';
import {
  createInquiryStore,
  isRetentionExpired,
  purgeInquiryRecord,
  redisConfig,
} from './_store.mjs';

const TELEGRAM_TIMEOUT_MS = 10_000;

/** 접수 알림과 같은 대화방으로 보낸다. 실패 사유를 돌려준다(성공이면 null). */
async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return 'telegram_not_configured';
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      // 응답이 없으면 함수가 최대 실행시간까지 걸려 응답·로그가 남지 않는다.
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    return response.ok ? null : `telegram_http_${response.status}`;
  } catch {
    return 'telegram_network';
  }
}

function summaryFields(error) {
  return error ? { summarySent: false, summaryError: error } : { summarySent: true };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const consultOpen = process.env.CONSULT_OPEN === 'true';
  const cfg = redisConfig();
  if (!cfg) {
    const summaryError = await sendTelegram(formatStorageFailureSummary({ now: new Date(), consultOpen }));
    res.status(500).json({ ok: false, error: 'storage_not_configured', ...summaryFields(summaryError) });
    return;
  }
  const store = createInquiryStore(cfg);

  const now = new Date();
  let items;
  try {
    items = await store.listAll(100);
  } catch {
    const summaryError = await sendTelegram(formatStorageFailureSummary({ now, consultOpen }));
    res.status(502).json({ ok: false, error: 'storage_error', ...summaryFields(summaryError) });
    return;
  }

  let purged = 0;
  const failed = [];
  const current = [];
  for (const item of items) {
    if (!isRetentionExpired(item, now)) {
      current.push(item);
      continue;
    }
    const purgedRecord = purgeInquiryRecord(item, now);
    try {
      await store.save(purgedRecord);
      purged += 1;
      current.push(purgedRecord);
    } catch {
      failed.push(item.id); // 실패 건은 다음 날 재시도된다
      current.push(item);
    }
  }

  let connectorLastSeen = null;
  let connectorReadError = false;
  try {
    connectorLastSeen = await store.getConnectorLastSeen();
  } catch {
    connectorReadError = true; // 요약에 '조회 실패(저장소)'로 드러난다.
  }

  let summaryError;
  try {
    const text = formatDailySummary(summarizeInquiries(current, { now }), {
      now,
      connectorLastSeen,
      connectorReadError,
      purge: { purged, failed },
      consultOpen,
    });
    summaryError = await sendTelegram(text);
  } catch {
    summaryError = 'summary_error';
  }

  const ok = failed.length === 0 && !summaryError;
  res.status(ok ? 200 : 502).json({
    ok,
    scanned: items.length,
    purged,
    failed,
    ...summaryFields(summaryError),
  });
}
