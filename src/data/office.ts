import raw from './office.json';

export interface Office {
  isOpen: boolean;
  /** 개업일(YYYY-MM-DD). 개업하는 날 isOpen과 함께 채운다 — 방침 시행일 점검 기준(npm run go-live:check). */
  openedOn?: string | null;
  representative?: string | null;
  phone: string | null;
  fax?: string | null;
  email?: string | null;
  blogUrl?: string | null;
  /** 티스토리(출입국·비자 글)·블로그스팟(토지보상 글). 구글 검색용 채널이라 하단 링크와 sameAs에 넣는다(2026-11-24). */
  tistoryUrl?: string | null;
  blogspotUrl?: string | null;
  kakaoChannelUrl: string | null;
  /** 지도 등록 주소(2026-11-23 확인). 구조화 데이터 sameAs로 같은 사무소임을 알린다. 구글은 인증된 프로필의 cid. */
  naverPlaceUrl?: string | null;
  kakaoPlaceUrl?: string | null;
  googleMapsUrl?: string | null;
  address: string | null;
  addressRegion?: string | null;
  addressLocality?: string | null;
  streetAddress?: string | null;
  addressNote?: string | null;
  mapQuery?: string | null;
  /** 상담 시간(2026-11-02 주인님 지정: 월~금 10:00~17:00). 공휴일은 아직 정하지 않았다. */
  consultHours?: string | null;
  /** 방문 주차 안내(2026-11-02 주인님 확인) */
  parking?: string | null;
  registrationNumber: string | null;
  businessNumber: string | null;
  formEndpoint: string | null;
}

/** 카카오 채널 주소는 선택값(D12, 2026-11-13) — 없으면 상담 화면에서 카카오 버튼만 빠진다. */
export const REQUIRED_WHEN_OPEN: (keyof Office)[] = [
  'phone', 'address', 'registrationNumber', 'businessNumber', 'formEndpoint',
];

export function assertOfficeValid(candidate: Office): void {
  if (!candidate.isOpen) return;
  const missing = REQUIRED_WHEN_OPEN.filter((key) => !candidate[key]);
  if (missing.length > 0) {
    throw new Error(`개업 상태인데 다음 정보가 비어 있습니다: ${missing.join(', ')}`);
  }
}

export function isAcceptingRequests(candidate: Office): boolean {
  return candidate.isOpen && REQUIRED_WHEN_OPEN.every((key) => Boolean(candidate[key]));
}

export const office: Office = raw as unknown as Office;
assertOfficeValid(office);
