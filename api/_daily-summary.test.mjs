import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONNECTOR_STALE_HOURS,
  STALE_RULES,
  formatDailySummary,
  formatStorageFailureSummary,
  summarizeInquiries,
} from './_daily-summary.mjs';

// 2026-10-20(화) 08:07 KST
const NOW = new Date('2026-10-19T23:07:00.000Z');
const hoursAgo = (h) => new Date(NOW.getTime() - h * 3600 * 1000).toISOString();

function inquiry(id, overrides = {}) {
  return {
    id,
    schemaVersion: 6,
    receivedAt: hoursAgo(1),
    name: '홍길동',
    phone: '010-1234-5678',
    topic: '음주운전 면허 구제',
    message: '면허가 취소됐습니다',
    status: 'new',
    pipelineStage: 'inquiry',
    memos: [],
    pulledAt: hoursAgo(0.5),
    ...overrides,
  };
}

const BASE_CTX = {
  now: NOW,
  connectorLastSeen: hoursAgo(22 / 60), // 22분 전
  purge: { purged: 0, failed: [] },
  consultOpen: false,
};

describe('운영 요약 집계', () => {
  it('미처리 기준은 연동 계약 파일과 같다', () => {
    const contract = JSON.parse(readFileSync(join(process.cwd(), 'api', '_inquiry-contract.json'), 'utf8'));
    expect(STALE_RULES).toEqual(contract.staleRules);
  });

  it('미처리·긴급·지연·30일 경과·미수집·진행 중·보류를 나눠 센다', () => {
    const items = [
      inquiry('JM-FRESH'), // 1시간: 미처리, 지연 아님
      inquiry('JM-URGENT-LATE', {
        receivedAt: hoursAgo(25),
        diagnosis: { counts: { urgent: 1 } },
      }), // 긴급 24시간 초과 → 지연
      inquiry('JM-VISA-FIRST', {
        receivedAt: hoursAgo(5),
        visaIntake: { deadlineFirst: true },
      }), // 긴급이지만 아직 지연 아님
      inquiry('JM-LATE', { receivedAt: hoursAgo(73) }), // 72시간 초과 → 지연
      inquiry('JM-OLD', { receivedAt: hoursAgo(24 * 31) }), // 30일 경과
      inquiry('JM-NOTPULLED', { pulledAt: undefined, receivedAt: hoursAgo(3) }),
      inquiry('JM-PROG', { status: 'in_progress', receivedAt: hoursAgo(200) }),
      inquiry('JM-HOLD', { status: 'on_hold', receivedAt: hoursAgo(200) }),
      inquiry('JM-DONE', { status: 'done', receivedAt: hoursAgo(200) }),
      { id: 'JM-PURGED', receivedAt: hoursAgo(5000), status: 'new', purged: true, purgedAt: hoursAgo(1) },
    ];
    const s = summarizeInquiries(items, { now: NOW });
    expect(s.unprocessed).toBe(6);
    expect(s.urgent).toBe(2);
    expect(s.delayed).toBe(2);
    expect(s.stale30).toBe(1);
    expect(s.notPulled).toBe(1);
    expect(s.notPulledOverdue).toEqual(['JM-NOTPULLED']);
    expect(s.inProgress).toBe(1);
    expect(s.onHold).toBe(1);
    // 지연·30일 경과 건은 오래된 순으로
    expect(s.overdue.map((o) => o.id)).toEqual(['JM-OLD', 'JM-LATE', 'JM-URGENT-LATE']);
    expect(s.overdue[2]).toMatchObject({ urgent: true });
  });

  it('로컬로 넘어가지 않은 접수는 2시간이 지나야 확인 필요로 본다', () => {
    const s = summarizeInquiries(
      [inquiry('JM-A', { pulledAt: undefined, receivedAt: hoursAgo(1) })],
      { now: NOW },
    );
    expect(s.notPulled).toBe(1);
    expect(s.notPulledOverdue).toEqual([]);
  });

  it('지연 경계는 로컬 대기함과 같이 기준 시간에 닿는 순간부터다', () => {
    const s = summarizeInquiries(
      [
        inquiry('JM-72', { receivedAt: hoursAgo(72) }),
        inquiry('JM-24U', { receivedAt: hoursAgo(24), visaIntake: { deadlineFirst: true } }),
        inquiry('JM-30D', { receivedAt: hoursAgo(24 * 30) }),
      ],
      { now: NOW },
    );
    expect(s.delayed).toBe(2);
    expect(s.stale30).toBe(1);
  });

  it('접수 시각이 깨진 건은 미처리로만 세고 지연 판정에서 뺀다', () => {
    const s = summarizeInquiries([inquiry('JM-BAD', { receivedAt: 'not-a-date' })], { now: NOW });
    expect(s.unprocessed).toBe(1);
    expect(s.delayed).toBe(0);
    expect(s.stale30).toBe(0);
  });
});

describe('운영 요약 문구', () => {
  it('이상이 없으면 첫 줄에 이상 없음을 적는다', () => {
    const text = formatDailySummary(summarizeInquiries([], { now: NOW }), BASE_CTX);
    const lines = text.split('\n');
    expect(lines[0]).toBe('[정명 운영 요약] 10/20(화) 08:07 — 이상 없음');
    expect(text).toContain('미처리 0건');
    expect(text).toContain('연동기 마지막 접속 10/20 07:45 (22분 전)');
    expect(text).toContain('자동 파기 오늘 0건 (실패 0)');
    expect(text).toContain('상담 접수: 닫힘(개업 전)');
    expect(text).not.toContain('⚠️');
  });

  it('지연 건 접수번호는 오래된 순으로 3개까지만 적고 개인정보는 넣지 않는다', () => {
    const items = [
      inquiry('JM-1', { receivedAt: hoursAgo(100) }),
      inquiry('JM-2', { receivedAt: hoursAgo(90) }),
      inquiry('JM-3', { receivedAt: hoursAgo(80), diagnosis: { counts: { urgent: 2 } } }),
      inquiry('JM-4', { receivedAt: hoursAgo(75) }),
    ];
    const text = formatDailySummary(summarizeInquiries(items, { now: NOW }), BASE_CTX);
    expect(text.split('\n')[0]).toBe('[정명 운영 요약] 10/20(화) 08:07 — ⚠️ 확인 필요 4건');
    expect(text).toContain('미처리 4건 (긴급 1 · 지연 4 · 30일 경과 0)');
    expect(text).toContain('JM-1 (4일 경과)');
    expect(text).toContain('JM-3 (긴급, 3일 경과)');
    expect(text).toContain('외 1건');
    expect(text).not.toContain('JM-4');
    for (const secret of ['홍길동', '010-1234-5678', '면허가 취소됐습니다']) {
      expect(text).not.toContain(secret);
    }
  });

  it('연동기 접속이 2시간을 넘었거나 기록이 없으면 경고한다', () => {
    expect(CONNECTOR_STALE_HOURS).toBe(2);
    const empty = summarizeInquiries([], { now: NOW });
    const stale = formatDailySummary(empty, { ...BASE_CTX, connectorLastSeen: hoursAgo(6.5) });
    expect(stale).toContain('⚠️ 연동기 마지막 접속 10/20 01:37 (6시간 30분 전)');
    expect(stale.split('\n')[0]).toContain('확인 필요 1건');

    const never = formatDailySummary(empty, { ...BASE_CTX, connectorLastSeen: null });
    expect(never).toContain('⚠️ 연동기 접속 기록 없음');

    const days = formatDailySummary(empty, { ...BASE_CTX, connectorLastSeen: hoursAgo(50) });
    expect(days).toContain('(2일 2시간 전)');
  });

  it('파기 실패·로컬 미수집 지연을 확인 필요로 센다', () => {
    const s = summarizeInquiries(
      [inquiry('JM-NP', { pulledAt: undefined, receivedAt: hoursAgo(3) })],
      { now: NOW },
    );
    const text = formatDailySummary(s, { ...BASE_CTX, purge: { purged: 2, failed: ['JM-X'] } });
    expect(text.split('\n')[0]).toContain('확인 필요 2건');
    expect(text).toContain('⚠️ 로컬 미수집 1건 (2시간 넘은 접수 1건)');
    expect(text).toContain('⚠️ 자동 파기 오늘 2건 (실패 1)');

    // 파기 실패는 건마다 센다.
    const many = formatDailySummary(s, { ...BASE_CTX, purge: { purged: 0, failed: ['JM-X', 'JM-Y', 'JM-Z'] } });
    expect(many.split('\n')[0]).toContain('확인 필요 4건');
  });

  it('연동기 접속 시각을 저장소에서 읽지 못하면 연동기 고장과 구분해 적는다', () => {
    const text = formatDailySummary(summarizeInquiries([], { now: NOW }), {
      ...BASE_CTX,
      connectorLastSeen: null,
      connectorReadError: true,
    });
    expect(text).toContain('⚠️ 연동기 접속 시각 조회 실패(저장소)');
    expect(text).not.toContain('연동기 접속 기록 없음');
    expect(text.split('\n')[0]).toContain('확인 필요 1건');
  });

  it('상담 접수가 열려 있으면 열림으로 적는다', () => {
    const text = formatDailySummary(summarizeInquiries([], { now: NOW }), { ...BASE_CTX, consultOpen: true });
    expect(text).toContain('상담 접수: 열림');
  });

  it('저장소 연결 실패는 따로 짧게 알린다', () => {
    const text = formatStorageFailureSummary({ now: NOW, consultOpen: false });
    expect(text.split('\n')[0]).toBe('[정명 운영 요약] 10/20(화) 08:07 — ⚠️ 확인 필요');
    expect(text).toContain('⚠️ 저장소(Upstash) 연결 실패 — 파기·집계를 하지 못했습니다');
    expect(text).toContain('상담 접수: 닫힘(개업 전)');
  });
});
