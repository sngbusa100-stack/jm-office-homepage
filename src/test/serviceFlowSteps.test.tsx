import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ServiceFlowSteps } from '../components/ServiceFlowSteps';
import { SERVICE_FLOW_STEPS } from '../data/serviceFlow';
import { findService } from '../data/services';
import { ServicePage } from '../pages/ServicePage';

function renderFor(slug: string) {
  const service = findService(slug)!;
  return render(
    <MemoryRouter>
      <ServiceFlowSteps service={service} />
    </MemoryRouter>,
  );
}

describe('업무분야 4단계 진행 표시', () => {
  it('비자 사이트와 같은 문구를 쓴다', () => {
    expect(SERVICE_FLOW_STEPS).toEqual(['설명', '요건·서류 조회', '내 상황 진단', '상담 준비']);
  });

  it('내부 진단이 있는 분야는 3단계가 진단 경로를 가리킨다', () => {
    renderFor('dui');
    expect(screen.getByRole('link', { name: /내 상황 진단/ })).toHaveAttribute('href', '/check/dui');
  });

  it('인허가 분야도 3단계가 진단 경로를 가리킨다', () => {
    renderFor('license');
    expect(screen.getByRole('link', { name: /내 상황 진단/ })).toHaveAttribute('href', '/check/permit');
  });

  it('비자 분야는 외부 이동임을 알린다', () => {
    renderFor('immigration');
    const link = screen.getByRole('link', { name: /내 상황 진단/ });
    expect(link.getAttribute('href')).toContain('jm-visa-precheck');
    expect(screen.getByText(/다국어 진단센터로 이동합니다/)).toBeInTheDocument();
  });

  it('진단이 없는 분야는 페이지 안의 확인 목록을 가리킨다', () => {
    renderFor('documents');
    expect(screen.getByRole('link', { name: /상담 전 확인 목록/ })).toHaveAttribute('href', '#preparation-review');
  });

  it('현재 단계를 접근성 속성으로 알린다', () => {
    renderFor('dui');
    expect(screen.getByText('설명').closest('li')).toHaveAttribute('aria-current', 'step');
  });
});

function renderPage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/services/${slug}`]}>
      <Routes>
        <Route path="/services/:slug" element={<ServicePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('분야 상세의 단계 안내', () => {
  it('상세 페이지 상단에 진행 단계를 보여준다', () => {
    renderPage('dui');
    expect(screen.getByRole('navigation', { name: '진행 단계' })).toBeInTheDocument();
  });

  it('확인 목록 섹션에 앵커 대상이 있다', () => {
    renderPage('documents');
    expect(document.querySelector('#preparation-review')).not.toBeNull();
  });

  it('진단이 없는 분야의 주 버튼은 확인 목록으로 간다', () => {
    renderPage('documents');
    const links = screen.getAllByRole('link', { name: /상담 전 확인 목록 보기/ });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute('href', '#preparation-review'));
  });

  it('상단에는 주 행동 하나만, 하단에는 둘을 둔다', () => {
    renderPage('dui');
    const top = document.querySelector('.service-actions--top')!;
    const bottom = document.querySelector('.service-actions--bottom')!;
    expect(top.querySelectorAll('a').length).toBe(1);
    expect(bottom.querySelectorAll('a').length).toBe(2);
  });

  it('법정 기한이 있는 분야는 기한 섹션이 조회 카드보다 먼저 나온다', () => {
    renderPage('dui');
    const headings = [...document.querySelectorAll('h2')].map((h) => h.textContent ?? '');
    const deadline = headings.findIndex((t) => t.includes('법정 기한'));
    const quick = headings.findIndex((t) => t.includes('먼저 확인할 항목'));
    expect(deadline).toBeGreaterThanOrEqual(0);
    expect(deadline).toBeLessThan(quick);
  });

  it('공식 출처는 기본으로 접혀 있고 제목은 접혀도 보인다', () => {
    renderPage('dui');
    const sources = document.querySelector('details.reference-section');
    expect(sources).not.toBeNull();
    expect((sources as HTMLDetailsElement).open).toBe(false);
    // 제목은 summary 안에 있어 접혀도 보인다.
    expect(screen.getByRole('heading', { name: /공식 기준·조회 경로/ })).toBeInTheDocument();
  });

  it('FAQ는 질문 목록이 보이도록 바깥으로 감싸지 않는다', () => {
    renderPage('dui');
    const service = findService('dui')!;
    // 질문을 훑어 자기 상황을 찾는 것이 FAQ의 핵심이다. 바깥 details로 감싸면
    // 질문까지 숨겨지고 답을 보기까지 클릭이 두 번 필요해진다.
    for (const faq of service.faqs) {
      expect(screen.getByText(faq.q)).toBeInTheDocument();
    }
    const faqHeading = screen.getByRole('heading', { name: /자주 묻는 질문/ });
    expect(faqHeading.closest('details')).toBeNull();
  });
});
