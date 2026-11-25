import { useState } from 'react';
import { Link } from 'react-router-dom';
import { office, isAcceptingRequests } from '../data/office';
import { attributedExternalUrl, captureAttribution, trackContactClick } from '../lib/funnel';
import { mapLinks } from '../lib/officeContact';

export function Footer() {
  // 사전 렌더링(Node)에는 window가 없으므로 빈 유입정보로 대신한다(sessionStorage를 읽지 않는다).
  const [attribution] = useState(() => (
    typeof window === 'undefined' ? {} : captureAttribution(window.location.search)
  ));
  const maps = mapLinks(office);
  const blogs = [
    { href: office.blogUrl, label: '네이버 블로그' },
    { href: office.tistoryUrl, label: '티스토리(출입국·비자)' },
    { href: office.blogspotUrl, label: '블로그스팟(토지보상)' },
  ].filter((blog): blog is { href: string; label: string } => Boolean(blog.href));
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
                {' · '}
                <a href={maps.google} target="_blank" rel="noopener noreferrer">구글 지도</a>
              </>
            )}
          </p>
        )}
        {(office.phone || office.fax || office.email) && (
          <p>
            {office.phone && <>전화 <a href={`tel:${office.phone}`} onClick={() => trackContactClick('phone')}>{office.phone}</a></>}
            {office.fax && <>{office.phone && ' | '}팩스 {office.fax}</>}
            {office.email && <>{(office.phone || office.fax) && ' | '}이메일 <a href={`mailto:${office.email}`} onClick={() => trackContactClick('email')}>{office.email}</a></>}
          </p>
        )}
        {(office.consultHours || office.parking) && (
          <p>
            {/* 각 항목은 통째로 줄바꿈한다(휴대폰에서 '주차 1시간 / 30분 무료'처럼 끊기지 않게). PC는 그대로 한 줄. */}
            {office.consultHours && <span className="footer__nowrap">상담 시간 {office.consultHours}</span>}
            {office.parking && <>{office.consultHours && ' | '}<span className="footer__nowrap">주차 {office.parking}</span></>}
          </p>
        )}
        {blogs.length > 0 && (
          <p>
            {blogs.map((blog, i) => (
              <span key={blog.href}>
                {i > 0 && ' · '}
                <a href={blog.href} target="_blank" rel="noopener noreferrer">{blog.label}</a>
              </span>
            ))}
          </p>
        )}
        <p className="footer__visa">
          <a href={attributedExternalUrl('https://visa.jungmyungoffice.com', 'jm_main_lang', attribution)}>비자 진단(<span lang="en">Visa Pre-Check</span>)</a>
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
        <nav aria-label="안내 및 법적 고지">
          <Link to="/process">의뢰 절차와 보수</Link>
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/disclaimer">면책 고지</Link>
          {/* 같은 줄 묶음에 둬서 휴대폰에서도 '면책 고지' 오른쪽에 온다(줄을 따로 쓰지 않게). */}
          <Link className="footer__admin" to="/admin">관리자</Link>
        </nav>
        <p className="footer__note">본 사이트의 안내는 일반 정보이며 법률 자문이 아닙니다.</p>
      </div>
    </footer>
  );
}
