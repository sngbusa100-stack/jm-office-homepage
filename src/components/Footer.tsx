import { Link } from 'react-router-dom';
import { office, isAcceptingRequests } from '../data/office';

export function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell">
        <p className="footer__brand">정명(正明) 행정사사무소</p>
        {isAcceptingRequests(office) ? (
          <>
            <p>{office.address}</p>
            <p>
              행정사 등록번호 {office.registrationNumber} | 사업자등록번호 {office.businessNumber}
            </p>
            <p>
              전화 <a href={`tel:${office.phone}`}>{office.phone}</a>
            </p>
          </>
        ) : (
          <p>사무소 정보(대표자·등록번호·소재지·연락처)는 정식 개업 후 이 자리에 게시됩니다.</p>
        )}
        <nav aria-label="법적 고지">
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/disclaimer">면책 고지</Link>
        </nav>
        <p className="footer__note">본 사이트의 안내는 일반 정보이며 법률 자문이 아닙니다.</p>
      </div>
    </footer>
  );
}
