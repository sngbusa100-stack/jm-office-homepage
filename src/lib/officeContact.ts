import type { Office } from '../data/office';

/** 국내 전화번호(02-897-6251)를 국제 표기(+82-2-897-6251)로 바꾼다. */
export function toInternationalPhone(phone: string): string {
  return `+82-${phone.replace(/^0/, '')}`;
}

/** 외부 스크립트 없이 지도 앱 검색 화면을 여는 바로가기 주소. */
export function mapLinks(query: string): { naver: string; kakao: string } {
  const encoded = encodeURIComponent(query);
  return {
    naver: `https://map.naver.com/p/search/${encoded}`,
    kakao: `https://map.kakao.com/link/search/${encoded}`,
  };
}

/** 검색 결과에 바라는 사이트 이름. title·og:site_name·index.html WebSite JSON-LD와 같은 표기를 쓴다. */
export const OFFICE_SITE_NAME = '정명 행정사사무소';

/** 사무소 개체의 @id. 여러 구조화 데이터 블록이 같은 사무소를 가리키게 한다. */
function officeNodeId(siteUrl: string): string {
  return `${siteUrl}/#office`;
}

/** 검색엔진이 읽는 사무소 정보(schema.org LegalService). 주소·전화가 모두 없으면 만들지 않는다. */
export function buildOfficeJsonLd(office: Office, siteUrl: string): Record<string, unknown> | null {
  if (!office.address && !office.phone) return null;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': officeNodeId(siteUrl),
    name: OFFICE_SITE_NAME,
    url: siteUrl,
  };
  if (office.phone) data.telephone = toInternationalPhone(office.phone);
  if (office.fax) data.faxNumber = toInternationalPhone(office.fax);
  if (office.email) data.email = office.email;
  if (office.streetAddress) {
    data.address = {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressRegion: office.addressRegion ?? undefined,
      addressLocality: office.addressLocality ?? undefined,
      streetAddress: office.streetAddress,
    };
  }
  return data;
}

/**
 * 네이버 서치어드바이저 '사이트 연관채널' 마크업(가이드 /guide/structured-data-channel, 2026-11-06 확인).
 * 루트 페이지의 Person/Organization에서 name(사이트 이름)·url·sameAs가 필수다. 네이버 검색 결과 윗줄(사이트 브랜드)은
 * 로봇이 자동으로 뽑으므로 이 마크업이 그 이름을 정해 주지는 않는다. 사무소 정보(LegalService)와 같은 @id로 한 개체로 묶는다.
 */
export function buildSiteChannelJsonLd(office: Office, siteUrl: string): Record<string, unknown> | null {
  const sameAs = [office.blogUrl].filter((url): url is string => Boolean(url));
  if (sameAs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': officeNodeId(siteUrl),
    name: OFFICE_SITE_NAME,
    url: siteUrl,
    sameAs,
  };
}

/** JSON-LD를 script 안에 넣을 문자열로 바꾼다. '<'를 <로 바꿔 '</script>'가 태그를 일찍 닫지 못하게 한다. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}
