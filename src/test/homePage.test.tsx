import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { getPageMeta } from '../lib/pageMeta';
import { profile, SLOGAN } from '../data/profile';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

function h2Texts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('h2')).map((h) => h.textContent ?? '');
}

describe('홈 첫 화면 — 사무소와 대표 행정사 소개', () => {
  it('첫 제목은 명함·썸네일과 같은 슬로건이다', () => {
    renderAt('/');
    expect(SLOGAN).toBe('복잡한 행정절차를 정확하고 명쾌하게');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SLOGAN);
  });

  it('첫 화면에 처분 대응 문구를 두지 않는다', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toMatch(/영업정지|면허 취소/);
  });

  it('첫 화면 소개 문구에 의뢰인을 위해 최선을 다한다는 약속이 있다', () => {
    const { container } = renderAt('/');
    const intro = container.querySelector('.hero__intro');
    expect(intro?.textContent).toMatch(/의뢰인/);
    expect(intro?.textContent).toMatch(/최선을 다하겠습니다/);
  });

  it('대표 행정사 카드에 이름·학력·경력·법률 업무제휴·위치가 있다', () => {
    renderAt('/');
    const card = screen.getByRole('complementary', { name: '대표 행정사 소개' });
    expect(within(card).getByRole('heading', { name: '정재훈' })).toBeInTheDocument();
    expect(within(card).getByText('대표 행정사')).toBeInTheDocument();
    expect(within(card).getByText('학력')).toBeInTheDocument();
    expect(within(card).getByText('중앙대학교 행정대학원 석사과정')).toBeInTheDocument();
    expect(within(card).getByText('경력')).toBeInTheDocument();
    expect(within(card).getByText('DHL 법률사무소 고문')).toBeInTheDocument();
    expect(card.textContent).toContain('DHL 법률사무소 (변호사 이동호)');
    expect(within(card).getByText(/광명KTX역 5번출구 앞/)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: /오시는 길/ })).toHaveAttribute('href', '/location');
  });

  it('학력·경력은 주인님이 확인한 항목만 싣는다', () => {
    expect(profile.education).toEqual(['중앙대학교 행정대학원 석사과정']);
    expect(profile.career).toEqual(['DHL 법률사무소 고문']);
  });

  it('사진이 없으면 사무소 엠블럼으로 대체한다', () => {
    expect(profile.photo).toBeNull();
    renderAt('/');
    const card = screen.getByRole('complementary', { name: '대표 행정사 소개' });
    expect(card.querySelector('img')?.getAttribute('src')).toContain('logo-mark');
  });

  it('대표 인사말과 약속 3가지가 업무 분야보다 먼저 나온다', () => {
    const { container } = renderAt('/');
    const headings = h2Texts(container);
    const greeting = headings.findIndex((t) => t.includes('정확하게 확인하고'));
    const services = headings.findIndex((t) => t.includes('업무 분야'));
    expect(greeting).toBeGreaterThanOrEqual(0);
    expect(greeting).toBeLessThan(services);

    const section = container.querySelector('#greeting') as HTMLElement;
    const promises = within(section).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(promises).toEqual(['정확하게', '명쾌하게', '법률의 시선까지']);
    expect(within(section).getByText(/^안녕하세요\. 정명 행정사사무소 대표 행정사 정재훈입니다\.$/)).toBeInTheDocument();
    expect(within(section).getByText(/끝까지 최선을 다해/)).toBeInTheDocument();
    expect(section.querySelector('.greeting__sign')).toHaveTextContent('정명 행정사사무소 대표 행정사 정재훈');
  });

  it('첫 화면의 대표 인사말 링크는 인사말 섹션을 가리킨다', () => {
    const { container } = renderAt('/');
    expect(screen.getByRole('link', { name: /대표 인사말/ })).toHaveAttribute('href', '#greeting');
    expect(container.querySelector('#greeting')).not.toBeNull();
  });

  it('처분 통지 안내는 업무 분야 아래에서 분야별 안내로 연결한다', () => {
    const { container } = renderAt('/');
    const headings = h2Texts(container);
    const notice = headings.findIndex((t) => t.includes('초기 대응이 중요합니다'));
    const services = headings.findIndex((t) => t.includes('업무 분야'));
    expect(notice).toBeGreaterThan(services);

    const section = screen.getByRole('region', { name: /초기 대응이 중요합니다/ });
    expect(within(section).getByRole('link', { name: /영업정지·과징금 통지/ })).toHaveAttribute('href', '/services/suspension');
    expect(within(section).getByRole('link', { name: /운전면허 정지·취소/ })).toHaveAttribute('href', '/services/dui');
    expect(within(section).getByRole('link', { name: /신청 반려·보완 요구/ })).toHaveAttribute('href', '/services/license');
  });

  it('셀프 진단 섹션에 일반 정보·브라우저 저장 안내가 남아 있다', () => {
    renderAt('/');
    const section = screen.getByRole('region', { name: '3분 셀프 진단' });
    expect(within(section).getByText(/처분·인용 여부에 대한 판단이 아닌 일반 정보/)).toBeInTheDocument();
    expect(within(section).getByText(/브라우저에만 저장되며, 상담 신청 때 직접 선택하신 경우에만 함께 전송됩니다/)).toBeInTheDocument();
  });
});

describe('진단 선택 화면 — 통지서 준비 안내', () => {
  it('홈에서 옮겨 온 통지서 준비 안내가 있다', () => {
    renderAt('/check');
    const guide = screen.getByRole('complementary', { name: /통지서를 옆에 두고/ });
    expect(within(guide).getByText('받은 날짜')).toBeInTheDocument();
    expect(within(guide).getByText('처분·통지서')).toBeInTheDocument();
  });
});

describe('홈 문서 제목 — 슬로건 통일', () => {
  it('홈 제목과 공유 제목은 명함 슬로건을 쓴다', () => {
    expect(getPageMeta('/').title).toBe(`정명 행정사사무소 | ${SLOGAN}`);
    expect(getPageMeta('/').description).toContain('광명');
  });

  it('원본 HTML(셸)의 제목도 같은 슬로건이다', () => {
    const html = readFileSync(join(__dirname, '../../index.html'), 'utf8');
    expect(html).toContain(`<title>정명 행정사사무소 | ${SLOGAN}</title>`);
    expect(html).toContain(`<meta property="og:title" content="정명 행정사사무소 | ${SLOGAN}" />`);
    expect(html).not.toContain('정확함으로 길을 밝히다');
  });
});
