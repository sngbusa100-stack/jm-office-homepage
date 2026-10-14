import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { office } from '../data/office';
import { buildOfficeJsonLd, mapLinks, toInternationalPhone } from '../lib/officeContact';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('사무소 연락처 데이터', () => {
  it('개업 전이지만 사무실 연락처와 주소를 갖고 있다', () => {
    expect(office.isOpen).toBe(false);
    expect(office.phone).toBe('02-897-6251');
    expect(office.fax).toBe('02-897-6254');
    expect(office.email).toBe('sngbusa10@naver.com');
    expect(office.representative).toBe('정재훈');
    expect(office.address).toBe(`${office.addressRegion} ${office.addressLocality} ${office.streetAddress}`);
    expect(office.address).toBe('경기도 광명시 새빛공원로 67 광명역자이타워 B1305호');
  });

  it('국내 번호를 국제 표기로 바꾼다', () => {
    expect(toInternationalPhone('02-897-6251')).toBe('+82-2-897-6251');
    expect(toInternationalPhone('010-9480-1849')).toBe('+82-10-9480-1849');
  });

  it('지도 바로가기 주소를 검색어로 만든다', () => {
    const links = mapLinks('경기도 광명시 새빛공원로 67');
    expect(links.naver).toBe(`https://map.naver.com/p/search/${encodeURIComponent('경기도 광명시 새빛공원로 67')}`);
    expect(links.kakao).toBe(`https://map.kakao.com/link/search/${encodeURIComponent('경기도 광명시 새빛공원로 67')}`);
  });

  it('검색엔진용 사무소 정보를 사무소 데이터에서 만든다', () => {
    const data = buildOfficeJsonLd(office, 'https://jungmyungoffice.com');
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      name: '정명 행정사사무소',
      url: 'https://jungmyungoffice.com',
      telephone: '+82-2-897-6251',
      faxNumber: '+82-2-897-6254',
      email: 'sngbusa10@naver.com',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
        addressRegion: '경기도',
        addressLocality: '광명시',
        streetAddress: '새빛공원로 67 광명역자이타워 B1305호',
      },
    });
  });

  it('주소와 전화가 모두 없으면 검색엔진용 정보를 만들지 않는다', () => {
    expect(buildOfficeJsonLd({ ...office, phone: null, address: null }, 'https://jungmyungoffice.com')).toBeNull();
  });
});

describe('개업 전 연락처 공개', () => {
  beforeEach(() => sessionStorage.clear());

  it('하단에 대표·주소·전화·팩스·이메일·블로그·지도를 보여주고 등록번호는 개업 후로 남긴다', () => {
    renderAt('/');
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByText(/대표 행정사 정재훈/)).toBeInTheDocument();
    expect(footer.getByText(/경기도 광명시 새빛공원로 67 광명역자이타워 B1305호/)).toBeInTheDocument();
    expect(footer.getByRole('link', { name: '02-897-6251' })).toHaveAttribute('href', 'tel:02-897-6251');
    expect(footer.getByText(/02-897-6254/)).toBeInTheDocument();
    expect(footer.getByRole('link', { name: 'sngbusa10@naver.com' })).toHaveAttribute('href', 'mailto:sngbusa10@naver.com');
    expect(footer.getByRole('link', { name: /네이버 블로그/ })).toHaveAttribute('href', 'https://blog.naver.com/jungmyung0909');
    expect(footer.getByRole('link', { name: '네이버 지도' })).toHaveAttribute('href', mapLinks(office.mapQuery!).naver);
    expect(footer.getByText(/행정사 등록번호·사업자등록번호는 정식 개업 후 게시됩니다/)).toBeInTheDocument();
    expect(footer.queryByText(/사무소 정보\(대표자·등록번호·소재지·연락처\)는 정식 개업 후/)).toBeNull();
    expect(footer.queryByText(/null/)).toBeNull();
  });

  it('상담 안내에 전화 걸기 버튼과 오시는 길을 보여주고 온라인 접수는 계속 닫아 둔다', () => {
    renderAt('/consult');
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: '02-897-6251' })).toHaveAttribute('href', 'tel:02-897-6251');
    expect(main.getByText('준비 중입니다.')).toBeInTheDocument();
    expect(main.queryByText('개업 후 공개됩니다.')).toBeNull();

    const location = within(main.getByRole('region', { name: '오시는 길' }));
    expect(location.getByText(/광명KTX역 5번출구 앞/)).toBeInTheDocument();
    for (const [name, href] of [['네이버 지도', mapLinks(office.mapQuery!).naver], ['카카오맵', mapLinks(office.mapQuery!).kakao]]) {
      const link = location.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    expect(main.getAllByText(/개업 후 시작됩니다/).length).toBeGreaterThan(0);
    expect(main.getByRole('button', { name: /상담 신청하기/ })).toBeDisabled();
  });

  it('개인정보처리방침 문의처를 공개된 사무소 연락처로 안내한다', () => {
    renderAt('/privacy');
    const contact = within(screen.getByRole('region', { name: '문의' }));
    expect(contact.getByRole('link', { name: 'sngbusa10@naver.com' })).toHaveAttribute('href', 'mailto:sngbusa10@naver.com');
    expect(contact.getByRole('link', { name: '02-897-6251' })).toHaveAttribute('href', 'tel:02-897-6251');
    expect(contact.queryByText(/개업 후 이 사이트와 사무소 안내에 공개되는 연락처/)).toBeNull();
  });

  it('홈에 검색엔진용 사무소 정보를 넣는다', () => {
    const { container } = renderAt('/');
    const scripts = [...container.querySelectorAll('script[type="application/ld+json"]')];
    const legal = scripts.map((s) => JSON.parse(s.textContent ?? '{}')).find((d) => d['@type'] === 'LegalService');
    expect(legal).toEqual(buildOfficeJsonLd(office, 'https://jungmyungoffice.com'));
  });

  it('개업 준비 중 안내 띠는 그대로 둔다', () => {
    renderAt('/');
    expect(screen.getByText(/이 사이트는 정식 개업 전 사전 공개 화면입니다. 상담·수임 접수는 개업 후 시작됩니다./)).toBeInTheDocument();
  });
});
