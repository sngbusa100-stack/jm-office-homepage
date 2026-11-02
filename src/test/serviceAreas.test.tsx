import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { serviceAreas, unassignedServices } from '../data/serviceAreas';
import { services } from '../data/services';

const CARD_AREAS = ['인허가 · 등록 · 변경', '출입국 · 비자', '토지개발 · 보상', '행정심판 · 권리구제', '공공조달 · 기업인증'];

describe('업무 분야 5개(명함 기준) — 기존 상세 페이지는 그대로 묶기만 한다', () => {
  it('분야 이름과 순서가 명함과 같다', () => {
    expect(serviceAreas.map((area) => area.name)).toEqual(CARD_AREAS);
  });

  it('업무 상세 페이지 6개가 빠짐없이, 한 분야에만 속한다', () => {
    expect(unassignedServices()).toEqual([]);
    const assigned = serviceAreas.flatMap((area) => area.serviceSlugs);
    expect(new Set(assigned).size).toBe(assigned.length);
    expect([...assigned].sort()).toEqual(services.map((s) => s.slug).sort());
  });

  it('상세 페이지 주소·상담 분야 코드는 바꾸지 않는다(검색 등록·접수 연동 유지)', () => {
    expect(services.map((s) => [s.slug, s.consultTopic])).toEqual([
      ['license', 'permit'], ['immigration', 'visa'], ['documents', 'land'],
      ['suspension', 'suspension'], ['dui', 'dui'], ['veterans', 'veterans'],
    ]);
  });

  it('/services는 5개 분야 카드와 분야별 상세 링크를 보여준다', () => {
    render(
      <MemoryRouter initialEntries={['/services']}>
        <AppRouter />
      </MemoryRouter>,
    );
    const main = within(screen.getByRole('main'));
    expect(main.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(CARD_AREAS);
    const procurement = main.getByRole('heading', { name: '공공조달 · 기업인증' }).closest('article') as HTMLElement;
    expect(within(procurement).getByText('분야별 안내 페이지를 준비하고 있습니다.')).toBeInTheDocument();
    const permit = main.getByRole('heading', { name: '인허가 · 등록 · 변경' }).closest('article') as HTMLElement;
    expect(within(permit).getByRole('link', { name: /인허가 대리/ })).toHaveAttribute('href', '/services/license');
    expect(permit.textContent).toContain('비영리법인 설립 허가');
  });
});
