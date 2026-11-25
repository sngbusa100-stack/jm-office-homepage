import { office } from '../data/office';

/** 상담 시간과 주차 안내. 값이 비면 그 줄은 빠진다. */
export function OfficeVisitFacts() {
  const rows = [
    office.consultHours && { label: '상담 시간', value: office.consultHours },
    office.parking && { label: '주차', value: office.parking },
  ].filter((row): row is { label: string; value: string } => Boolean(row));
  if (rows.length === 0) return null;
  return (
    <dl className="visit-facts">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
