import { Link } from 'react-router-dom';
import { office } from '../data/office';

export function IntakeLinks({ errorFallback = false }: { errorFallback?: boolean }) {
  const label = office.isOpen ? '온라인 상담 신청' : '상담 안내 보기';
  return (
    <>
      {errorFallback
        ? <a className="button button--accent" href="/consult">{label}</a>
        : <Link className="button button--accent" to="/consult">{label}</Link>}
      {office.isOpen && office.kakaoChannelUrl && (
        <a className="button button--ghost" href={office.kakaoChannelUrl} target="_blank" rel="noopener noreferrer">카카오톡으로 문의</a>
      )}
    </>
  );
}
