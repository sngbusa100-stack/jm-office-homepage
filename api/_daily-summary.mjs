// 매일 아침 운영 요약 — 접수·연동기·자동 파기 상태를 Telegram 한 통으로 알린다
// (docs/2026-10-19-daily-ops-summary-plan.md). 건수와 접수번호만 담고 이름·연락처·문의 내용은 넣지 않는다.

/** 미처리 기준. 연동 계약 api/_inquiry-contract.json의 staleRules와 같아야 한다(테스트로 고정). */
export const STALE_RULES = { delayHours: 72, urgentDelayHours: 24, warnDays: 30, autoCloseDays: 90 };

/** 로컬 연동기는 30분마다 접속한다. 4번 연속 빠지면 경고한다. */
export const CONNECTOR_STALE_HOURS = 2;

/** 접수 뒤 이 시간이 지나도 로컬로 넘어가지 않았으면 경고한다. */
export const NOT_PULLED_HOURS = 2;

const MAX_LISTED_IDS = 3;
const HOUR = 60 * 60 * 1000;
const KST_OFFSET = 9 * HOUR;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 접수 알림과 같은 긴급 판정(api/consult.js). */
function isUrgent(record) {
  return Boolean(record.diagnosis?.counts?.urgent) || Boolean(record.visaIntake?.deadlineFirst);
}

function ageHours(record, now) {
  const received = Date.parse(record.receivedAt ?? '');
  return Number.isFinite(received) ? (now.getTime() - received) / HOUR : null;
}

/**
 * 접수 목록을 상태별로 센다. 파기된 건은 제외한다.
 * 미처리는 status new — 로컬에서 사건 전환하면 in_progress, 종결하면 done으로 돌아오므로
 * 양쪽 모두 손대지 않은 건이다.
 */
export function summarizeInquiries(items, { now = new Date(), rules = STALE_RULES } = {}) {
  const active = items.filter((r) => r && !r.purged);
  const summary = {
    unprocessed: 0,
    urgent: 0,
    delayed: 0,
    stale30: 0,
    overdue: [],
    notPulled: 0,
    notPulledOverdue: [],
    inProgress: 0,
    onHold: 0,
  };
  for (const record of active) {
    const age = ageHours(record, now);
    // 로컬 연동기 GET과 같은 기준(파기 안 됨 + pulledAt 없음)
    if (!record.pulledAt) {
      summary.notPulled += 1;
      if (age !== null && age > NOT_PULLED_HOURS) summary.notPulledOverdue.push(record.id);
    }
    if (record.status === 'in_progress') summary.inProgress += 1;
    if (record.status === 'on_hold') summary.onHold += 1;
    if (record.status !== 'new') continue;

    summary.unprocessed += 1;
    const urgent = isUrgent(record);
    if (urgent) summary.urgent += 1;
    if (age === null) continue;
    if (age >= rules.warnDays * 24) {
      summary.stale30 += 1;
    } else if (age >= (urgent ? rules.urgentDelayHours : rules.delayHours)) {
      // 경계는 로컬 대기함 stale_flags(admin_appeal/connector/store.py)와 같이 '닿는 순간부터'
      summary.delayed += 1;
    } else {
      continue;
    }
    summary.overdue.push({ id: record.id, urgent, ageHours: age });
  }
  summary.overdue.sort((a, b) => b.ageHours - a.ageHours);
  return summary;
}

function kstParts(date) {
  const k = new Date(date.getTime() + KST_OFFSET);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    md: `${k.getUTCMonth() + 1}/${k.getUTCDate()}`,
    weekday: WEEKDAYS[k.getUTCDay()],
    hm: `${pad(k.getUTCHours())}:${pad(k.getUTCMinutes())}`,
  };
}

function formatElapsed(ms) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours}시간 ${minutes % 60}분 전` : `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days}일 ${hours % 24}시간 전` : `${days}일 전`;
}

function formatAge(hours) {
  return hours >= 24 ? `${Math.floor(hours / 24)}일 경과` : `${Math.floor(hours)}시간 경과`;
}

function header(now, status) {
  const { md, weekday, hm } = kstParts(now);
  return `[정명 운영 요약] ${md}(${weekday}) ${hm} — ${status}`;
}

function consultLine(consultOpen) {
  return `· 상담 접수: ${consultOpen ? '열림' : '닫힘(개업 전)'}`;
}

/**
 * @param {ReturnType<typeof summarizeInquiries>} s
 * '확인 필요 n건'은 접수 단위(지연·미수집·파기 실패 건마다 1)와 시스템 조건(연동기·저장소마다 1)의 합이다.
 * @param {{now: Date, connectorLastSeen: string|null, connectorReadError?: boolean, purge: {purged:number, failed:string[]}, consultOpen: boolean}} ctx
 */
export function formatDailySummary(s, { now = new Date(), connectorLastSeen, connectorReadError = false, purge, consultOpen }) {
  const lines = [];
  let issues = 0;
  const bullet = (warn) => (warn ? '⚠️ ' : '· ');

  const overdueCount = s.delayed + s.stale30;
  issues += overdueCount;
  lines.push(
    `${bullet(overdueCount > 0)}미처리 ${s.unprocessed}건 (긴급 ${s.urgent} · 지연 ${s.delayed} · 30일 경과 ${s.stale30})`,
  );
  if (s.overdue.length > 0) {
    const listed = s.overdue
      .slice(0, MAX_LISTED_IDS)
      .map((o) => `${o.id} (${o.urgent ? '긴급, ' : ''}${formatAge(o.ageHours)})`);
    const rest = s.overdue.length - MAX_LISTED_IDS;
    lines.push(`  지연: ${listed.join(', ')}${rest > 0 ? ` 외 ${rest}건` : ''}`);
  }

  // 지연으로 이미 센 건은 다시 세지 않는다.
  const overdueIds = new Set(s.overdue.map((o) => o.id));
  const notPulledIssues = s.notPulledOverdue.filter((id) => !overdueIds.has(id)).length;
  issues += notPulledIssues;
  const notPulledWarn = s.notPulledOverdue.length > 0;
  lines.push(
    `${bullet(notPulledWarn)}로컬 미수집 ${s.notPulled}건${
      notPulledWarn ? ` (${NOT_PULLED_HOURS}시간 넘은 접수 ${s.notPulledOverdue.length}건)` : ''
    }`,
  );
  lines.push(`· 진행 중 ${s.inProgress}건 · 보류 ${s.onHold}건`);

  const seen = Date.parse(connectorLastSeen ?? '');
  if (connectorReadError) {
    // 저장소 문제를 연동기 고장으로 오인해 로컬 PC부터 점검하지 않도록 구분한다.
    issues += 1;
    lines.push('⚠️ 연동기 접속 시각 조회 실패(저장소)');
  } else if (!Number.isFinite(seen)) {
    issues += 1;
    lines.push('⚠️ 연동기 접속 기록 없음');
  } else {
    const elapsed = now.getTime() - seen;
    const stale = elapsed > CONNECTOR_STALE_HOURS * HOUR;
    if (stale) issues += 1;
    const { md, hm } = kstParts(new Date(seen));
    lines.push(`${bullet(stale)}연동기 마지막 접속 ${md} ${hm} (${formatElapsed(elapsed)})`);
  }

  const failed = purge.failed.length;
  issues += failed;
  lines.push(`${bullet(failed > 0)}자동 파기 오늘 ${purge.purged}건 (실패 ${failed})`);
  lines.push(consultLine(consultOpen));

  return [header(now, issues > 0 ? `⚠️ 확인 필요 ${issues}건` : '이상 없음'), ...lines].join('\n');
}

/** 저장소에 연결하지 못해 파기·집계를 못 한 날의 알림. */
export function formatStorageFailureSummary({ now = new Date(), consultOpen }) {
  return [
    header(now, '⚠️ 확인 필요'),
    '⚠️ 저장소(Upstash) 연결 실패 — 파기·집계를 하지 못했습니다',
    consultLine(consultOpen),
  ].join('\n');
}
