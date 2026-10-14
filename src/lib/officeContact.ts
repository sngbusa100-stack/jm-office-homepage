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

/** 검색엔진이 읽는 사무소 정보(schema.org LegalService). 주소·전화가 모두 없으면 만들지 않는다. */
export function buildOfficeJsonLd(office: Office, siteUrl: string): Record<string, unknown> | null {
  if (!office.address && !office.phone) return null;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: '정명 행정사사무소',
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
