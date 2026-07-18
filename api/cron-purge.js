// Vercel Cron이 매일 호출하는 보존기간 자동 파기 — 관리자 접속과 무관하게 실행된다.
// 완료(done) 후 120일이 지난 접수를 전량 스캔해 파기한다 (개인정보처리방침 §보관·파기).
// 인증: Vercel Cron이 CRON_SECRET 환경변수를 Authorization: Bearer로 자동 첨부한다.

import {
  createInquiryStore,
  isRetentionExpired,
  purgeInquiryRecord,
  redisConfig,
} from './_store.mjs';

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

  const cfg = redisConfig();
  if (!cfg) {
    res.status(500).json({ ok: false, error: 'storage_not_configured' });
    return;
  }
  const store = createInquiryStore(cfg);

  try {
    const items = await store.listAll(100);
    const now = new Date();
    let purged = 0;
    const failed = [];
    for (const item of items) {
      if (!isRetentionExpired(item, now)) continue;
      try {
        await store.save(purgeInquiryRecord(item, now));
        purged += 1;
      } catch {
        failed.push(item.id); // 실패 건은 다음 날 재시도된다
      }
    }
    res.status(failed.length === 0 ? 200 : 502).json({
      ok: failed.length === 0,
      scanned: items.length,
      purged,
      failed,
    });
  } catch {
    res.status(502).json({ ok: false, error: 'storage_error' });
  }
}
