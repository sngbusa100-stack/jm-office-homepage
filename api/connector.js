// 로컬 연동기(행정심판 시스템) 전용 API — CONNECTOR_TOKEN Bearer 인증 (ADMIN_TOKEN과 별도)
// GET: 아직 pull되지 않은 접수 목록 + 회신 초안 replyDraft(성공 시 연동기 마지막 접속 시각 기록) / PATCH: ACK(pulledAt·localCaseId 기록, 멱등)
// PATCH action=status: 로컬 처리 결과(종결·사건 전환·수임)를 접수 상태에 반영(멱등, docs/2026-10-19-pipeline-link-plan.md)
// DELETE: 수임 확정·이관 완료 후 클라우드 레코드 파기 (통계 필드만 보존, 멱등)
// 브라우저가 아닌 로컬 스크립트 전용이므로 CORS를 적용하지 않는다.

import { isAuthorized } from './admin.js';
import { buildReplyDraft } from './_reply-draft.mjs';
import {
  applyConnectorAck,
  applyConnectorStatus,
  createInquiryStore,
  purgeInquiryRecord,
  redisConfig,
} from './_store.mjs';

/** 초안 계산 오류가 접수 수집(GET) 전체를 막지 않게 한다. 로컬 화면은 '초안 없음'으로 표시한다. */
function safeReplyDraft(item) {
  try {
    return buildReplyDraft(item);
  } catch {
    return null;
  }
}

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
      // 생존 신호 기록 실패가 접수 수집을 막지 않게 한다.
      try {
        await store.markConnectorSeen(new Date());
      } catch {
        // 아침 운영 요약에서 '연동기 접속' 경고로 드러난다.
      }
      // 회신 초안은 저장하지 않고 응답에서만 계산한다(클라우드에 개인정보 사본을 늘리지 않음).
      res.status(200).json({
        ok: true,
        items: items.map((item) => ({ ...item, replyDraft: safeReplyDraft(item) })),
      });
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
        // action이 없으면 예전 연동기와 같은 ACK로 처리한다(하위 호환).
        const action = body.action ?? 'ack';
        if (action !== 'ack' && action !== 'status') {
          res.status(400).json({ ok: false, error: 'unknown_action' });
          return;
        }
        const result = action === 'status'
          ? applyConnectorStatus(record, body)
          : applyConnectorAck(record, body.localCaseId);
        if (!result.ok) {
          res
            .status(result.errors.includes('purged') || result.errors.includes('not_pulled') ? 409 : 400)
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
