import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { office } from '../data/office';
import { SLOGAN } from '../data/profile';
import { buildOfficeJsonLd, buildSiteChannelJsonLd, mapLinks, officeSameAs, serializeJsonLd, toInternationalPhone } from '../lib/officeContact';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('사무소 연락처 데이터', () => {
  it('사무실 연락처와 주소를 갖고 있다', () => {
    expect(office.phone).toBe('02-899-1849');
    expect(office.fax).toBe('02-897-6254');
    expect(office.email).toBe('jungmyungoffice@naver.com');
    expect(office.representative).toBe('정재훈');
    expect(office.address).toBe(`${office.addressRegion} ${office.addressLocality} ${office.streetAddress}`);
    expect(office.address).toBe('경기도 광명시 새빛공원로 67 광명역자이타워 B동 13층 1305호');
  });

  it('국내 번호를 국제 표기로 바꾼다', () => {
    expect(toInternationalPhone('02-899-1849')).toBe('+82-2-899-1849');
    expect(toInternationalPhone('010-9480-1849')).toBe('+82-10-9480-1849');
  });

  it('지도 바로가기는 등록된 장소를 열고, 카카오는 로드뷰 상세가 아닌 지도 화면으로 연다(2026-11-24, 구글 11-25)', () => {
    expect(mapLinks(office)).toEqual({
      naver: 'https://map.naver.com/p/entry/place/3457747262',
      kakao: 'https://map.kakao.com/link/map/577766464',
      google: 'https://www.google.com/maps?cid=1861953194817191948',
    });
  });

  it('장소 주소가 없으면 지도 바로가기를 주소 검색으로 만들고, 주소도 없으면 만들지 않는다', () => {
    const links = mapLinks({ ...office, naverPlaceUrl: null, kakaoPlaceUrl: undefined, googleMapsUrl: null, mapQuery: '경기도 광명시 새빛공원로 67' });
    expect(links?.naver).toBe(`https://map.naver.com/p/search/${encodeURIComponent('경기도 광명시 새빛공원로 67')}`);
    expect(links?.kakao).toBe(`https://map.kakao.com/link/search/${encodeURIComponent('경기도 광명시 새빛공원로 67')}`);
    expect(links?.google).toBe(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('경기도 광명시 새빛공원로 67')}`);
    expect(mapLinks({ ...office, mapQuery: null })).toBeNull();
  });

  it('검색엔진용 사무소 정보를 사무소 데이터에서 만든다', () => {
    const data = buildOfficeJsonLd(office, 'https://jungmyungoffice.com');
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      name: '정명 행정사사무소',
      url: 'https://jungmyungoffice.com',
      telephone: '+82-2-899-1849',
      faxNumber: '+82-2-897-6254',
      email: 'jungmyungoffice@naver.com',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressRegion: '경기도',
        addressLocality: '광명시',
        streetAddress: '새빛공원로 67 광명역자이타워 B동 13층 1305호',
      },
    });
  });

  it('사무소 정보에 로고·대표 이미지·슬로건·대표자를 넣고 금지 항목은 넣지 않는다', () => {
    const data = buildOfficeJsonLd(office, 'https://jungmyungoffice.com')!;
    expect(data.logo).toBe('https://jungmyungoffice.com/images/logo-mark-128.png');
    expect(data.image).toBe('https://jungmyungoffice.com/images/og-image-v2.png');
    expect(data.slogan).toBe(SLOGAN);
    expect(data.founder).toEqual({ '@type': 'Person', name: '정재훈', alternateName: 'JUNG JAE HOON', jobTitle: '대표 행정사' });
    expect(data['@id']).toBe('https://jungmyungoffice.com/#office');
    expect(buildOfficeJsonLd({ ...office, representative: null }, 'https://jungmyungoffice.com')).not.toHaveProperty('founder');
    // 영업시간(openingHoursSpecification)은 개업 상태에서만 넣는다(C19, openingPrep.test.tsx).
    const forbidden = ['aggregateRating', 'openingHours', 'alumniOf', 'memberOf', 'worksFor'];
    if (!office.isOpen) forbidden.push('openingHoursSpecification');
    for (const key of forbidden) {
      expect(data).not.toHaveProperty(key);
    }
  });

  it('주소와 전화가 모두 없으면 검색엔진용 정보를 만들지 않는다', () => {
    expect(buildOfficeJsonLd({ ...office, phone: null, address: null }, 'https://jungmyungoffice.com')).toBeNull();
  });

  // 네이버 서치어드바이저 '사이트 연관채널'(2026-11-06 확인): Person/Organization, name(사이트 이름)·url·sameAs 필수
  // 2026-11-23 지도 3곳(네이버 11-23 등록·카카오·구글 인증 프로필)과 카카오 채널 홈을 sameAs에 더했다.
  // 2026-11-24 티스토리·블로그스팟 홈도 더했다.
  const EXPECTED_SAME_AS = [
    'https://blog.naver.com/jungmyung0909',
    'https://essay57391.tistory.com',
    'https://jeongmyeonglab.blogspot.com',
    'https://pf.kakao.com/_KxhlvX',
    'https://map.naver.com/p/entry/place/3457747262',
    'https://place.map.kakao.com/577766464',
    'https://www.google.com/maps?cid=1861953194817191948',
  ];

  it('네이버 연관채널용 Organization에 사이트 이름·주소·블로그·지도를 넣고 사무소 정보와 같은 개체로 묶는다', () => {
    const channel = buildSiteChannelJsonLd(office, 'https://jungmyungoffice.com');
    expect(channel).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://jungmyungoffice.com/#office',
      name: '정명 행정사사무소',
      url: 'https://jungmyungoffice.com',
      sameAs: EXPECTED_SAME_AS,
    });
    expect(buildOfficeJsonLd(office, 'https://jungmyungoffice.com')?.['@id']).toBe(channel?.['@id']);
  });

  it('사무소 정보(LegalService)에도 같은 sameAs를 넣는다', () => {
    expect(buildOfficeJsonLd(office, 'https://jungmyungoffice.com')?.sameAs).toEqual(EXPECTED_SAME_AS);
  });

  it('sameAs에는 카카오 채팅 주소가 아니라 채널 홈을 넣고, 빈 주소는 뺀다', () => {
    expect(officeSameAs(office)).not.toContain('https://pf.kakao.com/_KxhlvX/chat');
    expect(officeSameAs({
      ...office, tistoryUrl: null, blogspotUrl: undefined, kakaoChannelUrl: null, naverPlaceUrl: null, googleMapsUrl: undefined,
    })).toEqual([
      'https://blog.naver.com/jungmyung0909',
      'https://place.map.kakao.com/577766464',
    ]);
  });

  it('연관 채널이 없으면 연관채널용 정보와 sameAs를 만들지 않는다', () => {
    const none = { ...office, blogUrl: null, tistoryUrl: null, blogspotUrl: null, kakaoChannelUrl: null, naverPlaceUrl: null, kakaoPlaceUrl: null, googleMapsUrl: null };
    expect(buildSiteChannelJsonLd(none, 'https://jungmyungoffice.com')).toBeNull();
    expect(buildOfficeJsonLd(none, 'https://jungmyungoffice.com')).not.toHaveProperty('sameAs');
  });

  it('구조화 데이터 글자 안의 <는 이스케이프해 script가 일찍 끝나지 않게 한다', () => {
    const json = serializeJsonLd({ name: '</script><b>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual({ name: '</script><b>' });
  });
});

describe('개업 전 연락처 공개', () => {
  beforeEach(() => sessionStorage.clear());

  it('하단에 외국어 방문자용 비자 사전 진단 링크가 같은 창으로 열리고 접점 표시가 붙는다', () => {
    renderAt('/');
    const footer = within(screen.getByRole('contentinfo'));
    const link = footer.getByRole('link', { name: '비자 진단(Visa Pre-Check)' });
    expect(within(link).getByText('Visa Pre-Check')).toHaveAttribute('lang', 'en');
    expect(link.getAttribute('href')).toContain('https://visa.jungmyungoffice.com');
    expect(link.getAttribute('href')).toContain('utm_content=jm_main_lang');
    expect(link).not.toHaveAttribute('target');
    expect(footer.getByText('Tiếng Việt')).toHaveAttribute('lang', 'vi');
  });

  it('하단에 대표·주소·전화·팩스·이메일·블로그·지도를 보여주고 등록번호는 개업 후로 남긴다', () => {
    renderAt('/');
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByText(/대표 행정사 정재훈/)).toBeInTheDocument();
    expect(footer.getByText(/경기도 광명시 새빛공원로 67 광명역자이타워 B동 13층 1305호/)).toBeInTheDocument();
    expect(footer.getByRole('link', { name: '02-899-1849' })).toHaveAttribute('href', 'tel:02-899-1849');
    expect(footer.getByText(/02-897-6254/)).toBeInTheDocument();
    expect(footer.getByRole('link', { name: 'jungmyungoffice@naver.com' })).toHaveAttribute('href', 'mailto:jungmyungoffice@naver.com');
    expect(footer.getByRole('link', { name: /네이버 블로그/ })).toHaveAttribute('href', 'https://blog.naver.com/jungmyung0909');
    expect(footer.getByRole('link', { name: /티스토리/ })).toHaveAttribute('href', 'https://essay57391.tistory.com');
    expect(footer.getByRole('link', { name: /블로그스팟/ })).toHaveAttribute('href', 'https://jeongmyeonglab.blogspot.com');
    expect(footer.getByRole('link', { name: '네이버 지도' })).toHaveAttribute('href', mapLinks(office)!.naver);
    expect(footer.getByRole('link', { name: '구글 지도' })).toHaveAttribute('href', mapLinks(office)!.google);
    if (office.isOpen) {
      expect(footer.getByText(/행정사 등록번호 제3900000202611호 \| 사업자등록번호 462-02-03645/)).toBeInTheDocument();
    } else {
      expect(footer.getByText(/행정사 등록번호·사업자등록번호는 정식 개업 후 게시됩니다/)).toBeInTheDocument();
    }
    expect(footer.queryByText(/사무소 정보\(대표자·등록번호·소재지·연락처\)는 정식 개업 후/)).toBeNull();
    expect(footer.queryByText(/null/)).toBeNull();
  });

  it('온라인·카카오톡 접수와 오시는 길을 안내한다', () => {
    renderAt('/consult');
    const main = within(screen.getByRole('main'));
    const channels = within(main.getByRole('region', { name: '상담 채널' }));
    expect(channels.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['온라인 신청', '카카오톡 채널']);
    expect(channels.getAllByRole('link').some(link => /^(tel:|mailto:)/.test(link.getAttribute('href') ?? ''))).toBe(false);
    expect(main.getByRole('textbox', { name: /통화 가능한 시간대.*선택/ })).toHaveAttribute('name', 'message');
    // 2026-11-19 카카오톡 채널 개설: 채팅 주소로 바로 연결한다.
    if (office.isOpen) {
      expect(channels.getByRole('link', { name: '카카오톡으로 문의' })).toHaveAttribute('href', 'https://pf.kakao.com/_KxhlvX/chat');
    } else {
      expect(channels.queryByRole('link', { name: '카카오톡으로 문의' })).toBeNull();
    }
    expect(main.queryByText('개업 후 공개됩니다.')).toBeNull();

    const location = within(main.getByRole('region', { name: '오시는 길' }));
    expect(location.getByText(/광명KTX역 5번출구 앞/)).toBeInTheDocument();
    for (const [name, href] of [['네이버 지도', mapLinks(office)!.naver], ['카카오맵', mapLinks(office)!.kakao], ['구글 지도', mapLinks(office)!.google]]) {
      const link = location.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    if (office.isOpen) {
      expect(main.queryAllByText(/개업 후 시작됩니다/)).toHaveLength(0);
      expect(main.getByRole('button', { name: /상담 신청하기/ })).toBeEnabled();
    } else {
      expect(main.getAllByText(/개업 후 시작됩니다/).length).toBeGreaterThan(0);
      expect(main.getByRole('button', { name: /상담 신청하기/ })).toBeDisabled();
      // 연락처는 이미 게시했으므로 개업 전 안내는 등록번호 게시만 남은 일로 적는다.
      expect(main.getByText(/개업과 필수 고지\(등록번호 게시\) 준비가 끝나면/)).toBeInTheDocument();
    }
    expect(main.queryByText(/등록번호·연락처 게시/)).toBeNull();
  });

  it('개인정보처리방침 문의처를 공개된 사무소 연락처로 안내한다', () => {
    renderAt('/privacy');
    const contact = within(screen.getByRole('region', { name: '개인정보 보호책임자' }));
    expect(contact.getByRole('link', { name: 'jungmyungoffice@naver.com' })).toHaveAttribute('href', 'mailto:jungmyungoffice@naver.com');
    expect(contact.getByRole('link', { name: '02-899-1849' })).toHaveAttribute('href', 'tel:02-899-1849');
    expect(contact.queryByText(/개업 후 이 사이트와 사무소 안내에 공개되는 연락처/)).toBeNull();
  });

  it('홈에 검색엔진용 사무소 정보를 넣는다', () => {
    const { container } = renderAt('/');
    const scripts = [...container.querySelectorAll('script[type="application/ld+json"]')];
    const blocks = scripts.map((s) => JSON.parse(s.textContent ?? '{}'));
    expect(blocks.find((d) => d['@type'] === 'LegalService')).toEqual(buildOfficeJsonLd(office, 'https://jungmyungoffice.com'));
    expect(blocks.find((d) => d['@type'] === 'Organization')).toEqual(buildSiteChannelJsonLd(office, 'https://jungmyungoffice.com'));
  });

  it('오시는 길에도 검색엔진용 사무소 정보를 넣는다', () => {
    const { container } = renderAt('/location');
    const blocks = [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent ?? '{}'));
    expect(blocks.find((d) => d['@type'] === 'LegalService')).toEqual(buildOfficeJsonLd(office, 'https://jungmyungoffice.com'));
  });

  it('개업 준비 중 안내 띠는 개업 전에만 둔다', () => {
    renderAt('/');
    const banner = screen.queryByText(/이 사이트는 정식 개업 전 사전 공개 화면입니다. 상담·수임 접수는 개업 후 시작됩니다./);
    if (office.isOpen) expect(banner).toBeNull();
    else expect(banner).toBeInTheDocument();
  });
});
