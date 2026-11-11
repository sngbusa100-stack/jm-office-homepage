import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PreOpeningNotice } from './PreOpeningNotice';
import { getPageMeta } from '../lib/pageMeta';
import { captureAttribution } from '../lib/funnel';

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
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 개인정보 없는 유입 식별자 4종을 상담과 전환 측정에 공통 사용한다.
    captureAttribution(window.location.search);
    const meta = getPageMeta(pathname);
    document.title = meta.title;
    setMeta('meta[name="description"]', 'name', 'description', meta.description);
    setMeta('meta[name="robots"]', 'name', 'robots', meta.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', meta.canonical);
    setCanonical(meta.canonical);
    // 첫 마운트(주소를 직접 연 경우)는 브라우저가 정한 스크롤과 초점을 그대로 둔다.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    let id = hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* 잘못된 인코딩은 그대로 찾는다 */ }
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    // hash만 바뀐 이동은 브라우저 기본 동작에 맡기므로 pathname만 본다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
