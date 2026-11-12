import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { getPageMeta, HOME_TITLE } from '../lib/pageMeta';
import { profile, SLOGAN } from '../data/profile';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

function h2Ids(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('h2')).map((h) => h.id);
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

  it('첫 화면 소개는 주인님이 직접 쓴 문장 그대로다', () => {
    const { container } = renderAt('/');
    const intro = container.querySelector('.hero__intro');
    expect(intro?.textContent).toBe('서류 한 장에도 의뢰인의 생업과 생활이 걸려 있다는 것을 명심하고, 맡겨 주신 일에 끝까지 최선을 다하겠습니다.');
  });

  it('첫 화면에 차별점 네 줄(대표 직접·변호사와 같은 공간·진단 도구·KTX역 앞)이 있다(진단·KTX 순서는 2026-11-06 주인님 지시)', () => {
    renderAt('/');
    const list = screen.getByRole('list', { name: '정명 행정사사무소의 특징' });
    const items = within(list).getAllByRole('listitem').map((li) => li.querySelector('strong')?.textContent);
    expect(items).toEqual(['대표 행정사가 직접', '변호사 사무실과 같은 공간', '셀프 진단(4종) / 비자 진단(5개 언어)', '광명KTX역 5번출구 앞']);
  });

  it('첫 화면에 같은 말을 두 번 쓰지 않는다 — 맨 위 위치 글씨를 빼고 KTX역 안내는 차별점 한 줄만(2026-11-06 주인님 지시)', () => {
    const { container } = renderAt('/');
    const hero = container.querySelector('.hero') as HTMLElement;
    expect(hero.querySelector('.eyebrow')).toBeNull();
    expect(hero.textContent?.match(/광명KTX역 5번출구 앞/g)).toHaveLength(1);
    // '대표 행정사가 직접 — … 직접 맡습니다'처럼 한 줄에 같은 말을 두 번 쓰지 않는다
    // 제목 끝말은 괄호를 떼고 비교한다('비자 진단(5개 언어)' → '언어')
    for (const s of profile.strengths) {
      const lastWord = (s.title.split(' ').at(-1) ?? '').replace(/[()]/g, '');
      expect(s.detail.includes(lastWord), s.title).toBe(false);
    }
    // 첫 화면 주인님 문장("서류 한 장에도…")과 같은 뜻의 인사말 제목("서류보다 사람을 먼저")을 바로 아래 두지 않는다
    expect(container.textContent).not.toContain('서류보다 사람을 먼저');
    // 버튼은 주인님 결정으로 남긴다(PC·휴대폰 같은 화면)
    expect(within(hero).getByRole('link', { name: /업무 분야 살펴보기/ })).toHaveAttribute('href', '/services');
    expect(within(hero).getByRole('link', { name: /바로 셀프 진단하기/ })).toHaveAttribute('href', '/check');
  });

  it('모바일용 대표 한 줄(hero__rep)이 첫 제목 위에 있고, 사진 alt는 비어 있다', () => {
    const { container } = renderAt('/');
    const rep = container.querySelector('.hero__rep') as HTMLElement;
    expect(rep).not.toBeNull();
    expect(rep).toHaveTextContent('대표 행정사 정재훈');
    expect(rep.textContent).not.toContain('JUNG JAE HOON');
    const img = rep.querySelector('img') as HTMLImageElement;
    expect(img).toHaveAttribute('src', profile.photo!.src);
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('width', '56');
    expect(img).toHaveAttribute('height', '70');
    expect(img).toHaveAttribute('decoding', 'async');
    const h1 = container.querySelector('.hero h1') as HTMLElement;
    expect(rep.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('대표 카드는 사진과 직함·이름 한 줄만 둔다', () => {
    renderAt('/');
    const card = screen.getByRole('complementary', { name: '대표 행정사 소개' });
    expect(within(card).getByRole('img', { name: '대표 행정사 정재훈' })).toHaveAttribute('src', '/images/profile-jung-jaehoon.jpg');
    expect(card.querySelector('.profile-card__id')).toHaveTextContent('대표 행정사정재훈JUNG JAE HOON');
    expect(within(card).queryByText('학력')).toBeNull();
    expect(within(card).queryAllByRole('link')).toHaveLength(0);
  });

  it('대표 사진 파일이 public/images에 있다', () => {
    expect(profile.photo?.src).toBe('/images/profile-jung-jaehoon.jpg');
    expect(existsSync(join(__dirname, '../../public/images/profile-jung-jaehoon.jpg'))).toBe(true);
  });

  it('학력·경력·업무제휴 약력은 싣지 않는다(2026-11-06 주인님: "별로 자랑할 게 못 돼... 그냥 빼")', () => {
    expect(Object.keys(profile)).not.toEqual(expect.arrayContaining(['education']));
    expect(Object.keys(profile)).not.toEqual(expect.arrayContaining(['career']));
    for (const path of ['/', '/about']) {
      const { container, unmount } = renderAt(path);
      const main = container.querySelector('main') as HTMLElement;
      for (const text of ['중앙대학교', '법률사무소 고문', '법률 업무제휴', '학력', '경력']) expect(main.textContent, `${path} ${text}`).not.toContain(text);
      expect(main.querySelector('[aria-label="약력"]')).toBeNull();
      unmount();
    }
  });

  it('홈 순서는 첫 화면 → 대표 인사말 → 업무 분야 → 셀프 진단이다(2026-11-06 주인님 지시)', () => {
    const { container } = renderAt('/');
    const ids = h2Ids(container);
    const greeting = ids.indexOf('greeting-heading');
    const services = ids.indexOf('services-heading');
    const check = ids.indexOf('check-heading');
    expect(greeting).toBeGreaterThanOrEqual(0);
    expect(greeting).toBeLessThan(services);
    expect(services).toBeLessThan(check);
  });

  it('대표 인사말 요약에 변호사와 같은 공간을 쓰는 이유가 있고, 전문은 /about으로 간다', () => {
    renderAt('/');
    // 인사말 제목은 인사 한 줄이다(따로 있던 인사 문단과 합침, 2026-11-06)
    expect(profile.greetingTitle).toBe('안녕하세요, 대표 행정사 정재훈입니다.');
    const section = screen.getByRole('region', { name: profile.greetingTitle });
    expect(within(section).getAllByText('안녕하세요, 대표 행정사 정재훈입니다.')).toHaveLength(1);
    expect(section.textContent).toContain('변호사 사무실과 같은 공간에 행정사사무소를 열었습니다');
    // 2026-11-06 주인님 문장: "처음부터 다시 설명하고 많이 비용을 부담하지 않도록"('많이 비용을'만 '많은 비용을'로)
    expect(section.textContent).toContain('새로 변호사를 찾아 처음부터 다시 설명하고 많은 비용을 부담하지 않도록, 변호사 사무실과 같은 공간에');
    expect(profile.greeting.join('\n')).toContain('시간도 비용도 마음도 두 번 듭니다');
    // 예전 세 번째 카드에만 있던 변호사 이름은 인사말 문단으로 옮겼다(2026-11-06)
    expect(section.textContent).toContain('같은 사무실의 이동호 변호사(DHL 법률사무소)에게 바로 상담받으실 수 있습니다');
    // 마지막 다짐은 주인님 문장(2026-11-06): "~ 결과가 나오는 것을 목표로 최선을 다하겠습니다"
    expect(profile.greetingSummary.at(-1)).toBe('의뢰인께 가장 좋은 결과가 나오는 것을 목표로 최선을 다하겠습니다.');
    expect(within(section).getByRole('link', { name: /인사말 전문 보기/ })).toHaveAttribute('href', '/about');
    const promises = within(section).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(promises).toEqual(['정확하게', '명쾌하게']);
  });

  it('방어적인 부정형 문구를 쓰지 않는다(2026-11-06 주인님: "장담할 수는 없습니다·아는 척하지 않고·솔직히 말씀드리고" 싫다)', () => {
    const texts = [
      profile.intro, ...profile.greeting, ...profile.greetingSummary,
      ...profile.promises.map((p) => p.detail), ...profile.strengths.map((s) => `${s.title} ${s.detail}`),
    ].join('\n');
    for (const phrase of ['장담', '아는 척', '솔직히']) expect(texts, phrase).not.toContain(phrase);
  });

  it('변호사 협업 문구는 변호사법 위험 표현을 쓰지 않는다(docs/2026-11-02-home-intro-copy-plan.md 4절)', () => {
    const texts = [
      ...profile.greeting, ...profile.greetingSummary,
      ...profile.promises.map((p) => p.detail), ...profile.strengths.map((s) => `${s.title} ${s.detail}`),
    ].join('\n');
    for (const risky of ['즉각', '만들었습니다', '원스톱', '소송까지 책임', '함께 수임', '법률 상담을 제공', '보장']) {
      expect(texts, risky).not.toContain(risky);
    }
    // 상담하는 사람이 변호사라는 것이 문장에 드러나야 한다
    expect(texts).toContain('변호사에게 바로 상담받으실 수 있');
    // 소개 대가 문장은 싣지 않는다(2026-11-06 주인님: "이게 있어서 오히려 이상한 거 같다" — 법에 게시 의무는 없다).
    // 상담·사건 의뢰는 변호사와 직접 한다는 설명은 /about 전문에 남긴다.
    expect(texts).not.toContain('소개 대가');
    expect(profile.greeting.join('\n')).toContain('변호사 상담과 사건 의뢰는 변호사와 직접 하십니다');
  });

  it('업무 분야는 명함 5개 순서이고, 머리말 아래에는 기한 안내 줄을 두지 않는다', () => {
    const { container } = renderAt('/');
    const section = screen.getByRole('region', { name: '이런 일을 도와드립니다' });
    const areas = within(section).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(areas).toEqual(['인허가 · 등록 · 변경', '출입국 · 비자', '토지개발 · 보상', '행정심판 · 권리구제', '공공조달 · 기업인증']);
    // 2026-11-06 주인님: 다섯 분야 중 행정심판에만 해당하고, 기한은 '맡기기 전에'·셀프 진단·상세 페이지 '법정 기한'에서 안내한다.
    expect(section.textContent).not.toContain('통지서를 받으셨다면');
    expect(container.textContent).not.toContain('초기 대응이 중요합니다');

    const remedy = within(section).getByRole('heading', { name: '행정심판 · 권리구제' }).closest('article') as HTMLElement;
    expect(within(remedy).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/services/suspension', '/services/dui', '/services/veterans',
    ]);
  });

  it('셀프 진단은 인허가가 먼저이고 비자 진단 사이트 카드가 함께 있다', () => {
    renderAt('/');
    const section = screen.getByRole('region', { name: '3분 셀프 진단' });
    const titles = within(section).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual([
      '인허가 신청 사전 점검', '영업정지 처분 대응 사전 점검', '음주운전 면허 구제 사전 점검',
      '국가유공자 등록 사전 점검', '외국인 비자 사전 진단',
    ]);
    const visa = within(section).getByRole('link', { name: /비자 진단 열기/ });
    expect(visa.getAttribute('href')).toMatch(/^https:\/\/visa\.jungmyungoffice\.com\/?\?utm_content=jm_main/);
    expect(within(section).getAllByText(/개 문항 · 약 3분/)).toHaveLength(4);
  });

  it('셀프 진단 섹션에 일반 정보·브라우저 저장 안내가 한 번만 있다', () => {
    renderAt('/');
    const section = screen.getByRole('region', { name: '3분 셀프 진단' });
    expect(within(section).getByText(/처분·인용 여부에 대한 판단이 아닌 일반 정보/)).toBeInTheDocument();
    expect(within(section).getByText(/브라우저에만 저장되며, 상담 신청 때 직접 선택하신 경우에만 함께 전송됩니다/)).toBeInTheDocument();
    expect(section.textContent).not.toContain('결과는 일반 정보이며');
  });

  it('진행 절차는 비용 안내를 포함한 4단계다', () => {
    renderAt('/');
    const section = screen.getByRole('region', { name: '진행 절차' });
    expect(within(section).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      '이야기 듣기', '방법과 비용 안내', '서류 준비·작성', '제출과 결과 확인',
    ]);
  });
});

describe('진단 선택 화면 — 통지서 준비 안내', () => {
  it('홈에서 옮겨 온 통지서 준비 안내가 있다', () => {
    renderAt('/check');
    const guide = screen.getByRole('complementary', { name: /통지서를 옆에 두고/ });
    expect(within(guide).getByText('받은 날짜')).toBeInTheDocument();
    expect(within(guide).getByText('처분·통지서')).toBeInTheDocument();
  });

  it('진단 선택 화면도 인허가가 먼저이고 비자 진단 카드가 있다', () => {
    renderAt('/check');
    const main = within(screen.getByRole('main'));
    const titles = main.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles.indexOf('인허가 신청 사전 점검')).toBeLessThan(titles.indexOf('영업정지 처분 대응 사전 점검'));
    expect(titles).toContain('외국인 비자 사전 진단');
  });
});

describe('홈 문서 제목 — 슬로건 + 지역', () => {
  it('홈 제목은 상호·광명KTX역·명함 슬로건을 담는다', () => {
    expect(getPageMeta('/').title).toBe(HOME_TITLE);
    expect(HOME_TITLE).toContain('정명 행정사사무소');
    expect(HOME_TITLE).toContain('광명');
    expect(HOME_TITLE).toContain(SLOGAN);
    expect(getPageMeta('/').description).toContain('광명');
  });

  it('원본 HTML(셸)의 제목도 같다', () => {
    const html = readFileSync(join(__dirname, '../../index.html'), 'utf8');
    expect(html).toContain(`<title>${HOME_TITLE}</title>`);
    expect(html).toContain(`<meta property="og:title" content="${HOME_TITLE}" />`);
    expect(html).not.toContain('정확함으로 길을 밝히다');
  });
});
