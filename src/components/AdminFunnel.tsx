// 관리 화면 "전환 퍼널" — 기간 선택, 짝 단계 비율, 칸을 누르면 분야·출처·날짜별 내역.
import { useMemo, useState } from 'react';
import type { FunnelSummary } from '../lib/adminApi';
import {
  DOMAIN_LABEL,
  FUNNEL_PAIRS,
  FUNNEL_PERIODS,
  FUNNEL_STEPS,
  SMALL_SAMPLE,
  SOURCE_LABEL,
  buildFunnelView,
  conversionRate,
} from '../lib/funnelStats';
import type { FunnelPeriod, FunnelView } from '../lib/funnelStats';

function shortDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
}

function BreakdownList({ title, entries, labels }: {
  title: string;
  entries: Array<[string, number]>;
  labels: Record<string, string>;
}) {
  return (
    <div>
      <h4>{title}</h4>
      {entries.length === 0 ? (
        <p className="note">없음</p>
      ) : (
        <ul className="admin-stat-list">
          {entries.map(([key, count]) => (
            <li key={key}>{labels[key] ?? key}: {count}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DailyBars({ view, event, label }: { view: FunnelView; event: string; label: string }) {
  const values = view.daily[event] ?? new Array<number>(view.dates.length).fill(0);
  const max = Math.max(...values, 0);
  const peakIndex = max > 0 ? values.indexOf(max) : -1;
  return (
    <div>
      <h4>날짜별</h4>
      <div
        className="admin-funnel-bars"
        role="img"
        aria-label={`${label} 날짜별 건수, 가장 많은 날 ${peakIndex >= 0 ? `${shortDate(view.dates[peakIndex])} ${max}건` : '없음'}`}
      >
        {values.map((count, index) => (
          <span
            className="admin-funnel-bar"
            key={view.dates[index]}
            title={`${shortDate(view.dates[index])}: ${count}건`}
          >
            <span style={{ height: max > 0 ? `${(count / max) * 100}%` : 0 }} />
          </span>
        ))}
      </div>
      <p className="admin-funnel-bars__axis note">
        <span>{shortDate(view.dates[0])}</span>
        <span>{peakIndex >= 0 ? `가장 많은 날 ${shortDate(view.dates[peakIndex])} ${max}건` : '이 기간 기록 없음'}</span>
        <span>{shortDate(view.dates[view.dates.length - 1])}</span>
      </p>
      <details>
        <summary>날짜별 숫자 보기</summary>
        <ul className="admin-stat-list">
          {view.dates
            .map((date, index) => [date, values[index]] as const)
            .filter(([, count]) => count > 0)
            .reverse()
            .map(([date, count]) => (
              <li key={date}>{date}: {count}</li>
            ))}
        </ul>
      </details>
    </div>
  );
}

export function AdminFunnel({ funnel }: { funnel: FunnelSummary | null }) {
  const [period, setPeriod] = useState<FunnelPeriod>(30);
  const [selected, setSelected] = useState<string | null>(null);
  const view = useMemo(
    () => (funnel ? buildFunnelView(funnel, period) : null),
    [funnel, period],
  );
  const total = (event: string) => view?.totals[event] ?? 0;
  const selectedStep = FUNNEL_STEPS.find((step) => step.key === selected);

  return (
    <section aria-labelledby="funnel-stats">
      <h2 id="funnel-stats">{period}일 전환 퍼널</h2>
      <p className="note">
        이름·연락처·진단 답변을 제외한 단계별 합계입니다. 칸을 누르면 분야·유입 출처·날짜별 내역이 나옵니다.
      </p>
      <div className="admin-actions" role="group" aria-label="퍼널 기간">
        {FUNNEL_PERIODS.map((days) => (
          <button
            key={days}
            className={`button ${period === days ? 'button--primary' : ''}`}
            type="button"
            aria-pressed={period === days}
            onClick={() => setPeriod(days)}
          >
            최근 {days}일
          </button>
        ))}
      </div>

      <div className="admin-funnel-grid">
        {FUNNEL_STEPS.map(({ key, label }) => (
          <button
            className={`card admin-funnel-step ${selected === key ? 'admin-funnel-step--active' : ''}`}
            key={key}
            type="button"
            aria-expanded={selected === key}
            aria-controls="funnel-detail"
            onClick={() => setSelected((current) => (current === key ? null : key))}
          >
            <span className="admin-funnel-step__label">{label}</span>
            <strong>{total(key)}</strong>
          </button>
        ))}
      </div>

      <ul className="admin-funnel-rates">
        {FUNNEL_PAIRS.map(({ from, to, label }) => {
          const rate = conversionRate(total(from), total(to));
          return (
            <li key={from}>
              {label}: <strong>{rate === null ? '-' : `${rate}%`}</strong> ({total(to)}/{total(from)})
              {rate !== null && total(from) < SMALL_SAMPLE && <span className="note"> · 표본이 적어 참고만</span>}
            </li>
          );
        })}
      </ul>

      {view && selectedStep && (
        <div className="card admin-funnel-detail" id="funnel-detail">
          <div className="admin-funnel-detail__head">
            <h3>{selectedStep.label} · 최근 {period}일 {total(selectedStep.key)}건</h3>
            <button className="button" type="button" onClick={() => setSelected(null)}>닫기</button>
          </div>
          <div className="admin-funnel-detail__grid">
            <BreakdownList title="분야별" entries={view.byDomain[selectedStep.key] ?? []} labels={DOMAIN_LABEL} />
            <BreakdownList title="유입 출처별" entries={view.bySource[selectedStep.key] ?? []} labels={SOURCE_LABEL} />
          </div>
          <DailyBars view={view} event={selectedStep.key} label={selectedStep.label} />
        </div>
      )}

      <p className="note">
        연락 버튼 누름: 전화 {total('contact_phone_click')} · 이메일 {total('contact_email_click')}
        (홈페이지에서 누른 횟수 — 실제 통화·메일 수와 다를 수 있습니다)
      </p>
      <p className="note">
        이 브라우저에서 연 홈페이지 화면은 사무소 점검으로 보고 퍼널에 넣지 않습니다. 비자 사이트는 주소가 달라서
        {' '}
        <a href="https://visa.jungmyungoffice.com/?jm_internal=1" target="_blank" rel="noopener noreferrer">
          비자 사이트도 집계 제외
        </a>
        를 한 번 눌러 두셔야 합니다.
      </p>
    </section>
  );
}
