// 로컬 연동기(행정심판 시스템) 전용 API — CONNECTOR_TOKEN Bearer 인증 (ADMIN_TOKEN과 별도)
// GET: 아직 pull되지 않은 접수 목록 / PATCH: ACK(pulledAt·localCaseId 기록, 멱등)
// DELETE: 수임 확정·이관 완료 후 클라우드 레코드 파기 (통계 필드만 보존, 멱등)
// 브라우저가 아닌 로컬 스크립트 전용이므로 CORS를 적용하지 않는다.

import { isAuthorized } from './admin.js';
import {
  applyConnectorAck,
  createInquiryStore,
  purgeInquiryRecord,
  redisConfig,
} from './_store.mjs';

export default async function handler(req, res) {
  if (!isAuthorized(req.headers.authorization, process.env.CONNECTOR_TOKEN)) {
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
      const items = (await store.list()).filter((r) => !r.purged && !r.pulledAt);
      res.status(200).json({ ok: true, items });
      return;
    }

    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const id = typeof body.id === 'string' ? body.id : '';
      if (!id) {
        res.status(400).json({ ok: false, error: 'id_required' });
        return;
      }
      const record = await store.get(id);
      if (!record) {
        res.status(404).json({ ok: false, error: 'not_found' });
        return;
      }

      if (req.method === 'PATCH') {
        const result = applyConnectorAck(record, body.localCaseId);
        if (!result.ok) {
          res
            .status(result.errors.includes('purged') ? 409 : 400)
            .json({ ok: false, errors: result.errors });
          return;
        }
        if (!result.already) await store.save(result.value);
        res.status(200).json({ ok: true, item: result.value, already: Boolean(result.already) });
        return;
      }

      // DELETE — 이미 파기됐으면 멱등 성공
      if (record.purged) {
        res.status(200).json({ ok: true, item: record, already: true });
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
