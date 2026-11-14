import { office } from '../data/office';
import { trackContactClick } from '../lib/funnel';

/** 상담 시간·주차·전화. 오시는 길과 사무소 소개가 함께 쓴다. 값이 비면 그 줄은 빠진다. */
export function OfficeVisitFacts() {
  const rows = [
    office.consultHours && { label: '상담 시간', value: office.consultHours },
    office.parking && { label: '주차', value: office.parking },
  ].filter((row): row is { label: string; value: string } => Boolean(row));
  if (rows.length === 0 && !office.phone) return null;
  return (
    <dl className="visit-facts">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
      {office.phone && (
        <div>
          <dt>전화</dt>
          <dd><a href={`tel:${office.phone}`} onClick={() => trackContactClick('phone')}>{office.phone}</a></dd>
        </div>
      )}
    </dl>
  );
}
