import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PreOpeningNotice } from './PreOpeningNotice';

const TITLES: Record<string, string> = {
  '/': '정명 행정사사무소 | 정확함으로 길을 밝히다',
  '/why': '행정사가 필요한 이유 | 정명 행정사사무소',
  '/check': '셀프 진단 | 정명 행정사사무소',
  '/consult': '상담 안내 | 정명 행정사사무소',
  '/privacy': '개인정보처리방침 | 정명 행정사사무소',
  '/disclaimer': '면책 고지 | 정명 행정사사무소',
};

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = TITLES[pathname] ?? '정명 행정사사무소';
    mainRef.current?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <PreOpeningNotice />
      <Navbar />
      <main id="main" ref={mainRef} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
