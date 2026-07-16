// 접수 관리 API — 사무소 관리자 전용 (ADMIN_TOKEN Bearer 인증)
// GET: 접수 목록(최신순) / PATCH: 상태 변경·메모 추가 / DELETE: 개인정보 파기(통계 필드만 보존)

import { createHash, timingSafeEqual } from 'node:crypto';
import { applyCors } from './_cors.mjs';
import {
  applyInquiryPatch,
  createInquiryStore,
  purgeInquiryRecord,
  redisConfig,
} from './_store.mjs';

/** Bearer 토큰을 상수 시간 비교로 검증한다 (길이 차이 노출 방지 위해 해시 후 비교). */
export function isAuthorized(authHeader, adminToken) {
  if (!adminToken || typeof authHeader !== 'string') return false;
  const match = /^Bearer\s+(.+)$/.exec(authHeader.trim());
  if (!match) return false;
  const given = createHash('sha256').update(match[1]).digest();
  const expected = createHash('sha256').update(adminToken).digest();
  return timingSafeEqual(given, expected);
}

export default async function handler(req, res) {
  if (applyCors(req, res, { methods: 'GET, PATCH, DELETE, OPTIONS' })) return;

  if (!isAuthorized(req.headers.authorization, process.env.ADMIN_TOKEN)) {
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
    if (req.method === 'GET') {
      const items = await store.list();
      res.status(200).json({ ok: true, items });
      return;
    }

    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const id = typeof body.id === 'string' ? body.id : String(req.query?.id ?? '');
      if (!id) {
        res.status(400).json({ ok: false, error: 'id_required' });
        return;
      }
      const record = await store.get(id);
      if (!record) {
        res.status(404).json({ ok: false, error: 'not_found' });
        return;
      }
      if (record.purged) {
        res.status(409).json({ ok: false, error: 'already_purged' });
        return;
      }

      if (req.method === 'PATCH') {
        const result = applyInquiryPatch(record, { status: body.status, memo: body.memo });
        if (!result.ok) {
          res.status(400).json({ ok: false, errors: result.errors });
          return;
        }
        await store.save(result.value);
        res.status(200).json({ ok: true, item: result.value });
        return;
      }

      const purged = purgeInquiryRecord(record);
      await store.save(purged);
      res.status(200).json({ ok: true, item: purged });
      return;
    }

    res.status(405).json({ ok: false, error: 'method_not_allowed' });
  } catch {
    res.status(502).json({ ok: false, error: 'storage_error' });
  }
}
