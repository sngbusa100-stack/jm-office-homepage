import { useState } from 'react';
import { Link } from 'react-router-dom';
import { office, isAcceptingRequests } from '../data/office';
import { attributedExternalUrl, captureAttribution } from '../lib/funnel';
import { mapLinks } from '../lib/officeContact';

export function Footer() {
  // 사전 렌더링(Node)에는 window가 없으므로 빈 유입정보로 대신한다(sessionStorage를 읽지 않는다).
  const [attribution] = useState(() => (
    typeof window === 'undefined' ? {} : captureAttribution(window.location.search)
  ));
  const maps = office.mapQuery ? mapLinks(office.mapQuery) : null;
  return (
    <footer className="footer">
      <div className="page-shell">
        <p className="footer__brand">정명(正明) 행정사사무소</p>
        {office.representative && <p>대표 행정사 {office.representative}</p>}
        {office.address && (
          <p>
            {office.address}
            {office.addressNote && ` (${office.addressNote})`}
            {maps && (
              <>
                {' · '}
                <a href={maps.naver} target="_blank" rel="noopener noreferrer">네이버 지도</a>
                {' · '}
                <a href={maps.kakao} target="_blank" rel="noopener noreferrer">카카오맵</a>
              </>
            )}
          </p>
        )}
        {(office.phone || office.fax || office.email) && (
          <p>
            {office.phone && <>전화 <a href={`tel:${office.phone}`}>{office.phone}</a></>}
            {office.fax && <>{office.phone && ' | '}팩스 {office.fax}</>}
            {office.email && <>{(office.phone || office.fax) && ' | '}이메일 <a href={`mailto:${office.email}`}>{office.email}</a></>}
          </p>
        )}
        {(office.consultHours || office.parking) && (
          <p>
            {office.consultHours && <>상담 시간 {office.consultHours}</>}
            {office.parking && <>{office.consultHours && ' | '}주차 {office.parking}</>}
          </p>
        )}
        {office.blogUrl && (
          <p><a href={office.blogUrl} target="_blank" rel="noopener noreferrer">네이버 블로그</a></p>
        )}
        <p className="footer__visa">
          <a href={attributedExternalUrl('https://visa.jungmyungoffice.com', 'jm_main_lang', attribution)}>Visa Pre-Check</a>
          {' · '}
          <span lang="en">English</span> / <span lang="zh">中文</span> / <span lang="vi">Tiếng Việt</span> / <span lang="ja">日本語</span>
        </p>
        {isAcceptingRequests(office) ? (
          <p>
            행정사 등록번호 {office.registrationNumber} | 사업자등록번호 {office.businessNumber}
          </p>
        ) : (
          <p>행정사 등록번호·사업자등록번호는 정식 개업 후 게시됩니다.</p>
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
