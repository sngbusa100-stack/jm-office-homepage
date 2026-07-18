import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PreOpeningNotice } from './PreOpeningNotice';
import { getPageMeta } from '../lib/pageMeta';
import { safeSessionSet } from '../lib/browserStorage';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 유입 채널 파악용: 광고·블로그 링크의 utm_source를 세션에 보관해 상담 접수에 붙인다.
    const utm = new URLSearchParams(window.location.search).get('utm_source');
    if (utm) safeSessionSet('consult:utm', utm.slice(0, 80));
    const meta = getPageMeta(pathname);
    document.title = meta.title;
    setMeta('meta[name="description"]', 'name', 'description', meta.description);
    setMeta('meta[name="robots"]', 'name', 'robots', meta.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', meta.canonical);
    setCanonical(meta.canonical);
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
