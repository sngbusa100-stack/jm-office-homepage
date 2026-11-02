import { useEffect, useState } from 'react';
import { findService } from '../data/services';
import { attributedExternalUrl } from '../lib/funnel';

const VISA_TYPES = 'D-2 유학 · D-10 구직 · E-7 전문인력 · F-2-7 점수제 · F-5 영주 · F-6 결혼이민';
const VISA_LANGUAGES = '한국어 · English · 中文 · Tiếng Việt · 日本語';

/**
 * 셀프 진단 카드 옆에 두는 비자 진단 사이트(5개 언어) 안내. 홈과 /check가 함께 쓴다.
 * 링크에는 업무 상세 페이지와 같은 접점(jm_main)으로 유입 정보를 이어 붙인다.
 * 사전 렌더링(Node)에는 세션 저장소가 없으므로 처음에는 원래 주소를 쓰고, 브라우저에서 유입 정보를 붙인다.
 */
export function VisaCheckCard({ headingLevel }: { headingLevel: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  const baseUrl = findService('immigration')?.externalLink?.url ?? 'https://visa.jungmyungoffice.com';
  const [href, setHref] = useState(baseUrl);
  useEffect(() => setHref(attributedExternalUrl(baseUrl, 'jm_main')), [baseUrl]);

  return (
    <article className="card action-card visa-check-card">
      <Heading>외국인 비자 사전 진단</Heading>
      <p>{VISA_TYPES}</p>
      <p className="note" lang="mul">{VISA_LANGUAGES}</p>
      <p className="note">6개 비자 · 5개 언어 · 정명 비자 진단센터(별도 사이트)</p>
      <a className="button button--primary" href={href}>비자 진단 열기 →</a>
    </article>
  );
}
