import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { checks } from '../data/checks';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

async function finishDui(choices: Record<string, string>) {
  const user = userEvent.setup();
  renderAt('/check/dui');
  const visited: string[] = [];
  for (let i = 0; i < checks.dui.questions.length; i++) {
    const options = await screen.findAllByRole<HTMLInputElement>('radio');
    const id = options[0].name;
    visited.push(id);
    const selected = choices[id] ? options.find((option) => option.value === choices[id]) : options[0];
    expect(selected, id).toBeDefined();
    await user.click(selected!);
    const next = screen.getByRole('button', { name: /다음|결과 보기/ });
    const last = next.textContent === '결과 보기';
    await user.click(next);
    if (last) break;
  }
  expect(await screen.findByRole('heading', { name: /진단 결과/ })).toBeInTheDocument();
  return visited;
}

describe('진단 흐름', () => {
  beforeEach(() => sessionStorage.clear());

  it('/check에서 모든 진단을 고를 수 있다', () => {
    renderAt('/check');
    const links = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    for (const def of Object.values(checks)) {
      expect(links).toContain(`/check/${def.domain}`);
    }
    expect(screen.getByRole('link', { name: /비자 진단 열기/ })).toHaveAttribute('href', expect.stringContaining('visa.jungmyungoffice.com'));
  });

  it('조사 중이고 측정을 거부했다면 통지서 날짜와 측정 수치를 묻거나 저장하지 않는다', async () => {
    const visited = await finishDui({ 'dui-disposition': 'investigation', 'dui-refusal': 'yes' });
    const stored = JSON.parse(sessionStorage.getItem('check:dui')!).answers;
    for (const id of ['dui-elapsed', 'dui-procedure', 'dui-bac']) {
      expect(visited).not.toContain(id);
      expect(stored).not.toHaveProperty(id);
    }
    expect(stored['dui-refusal']).toBe('yes');
  });

  it('긴급 답변이 있으면 결과 상단에 긴급 확인과 110 안내가 나온다', async () => {
    await finishDui({ 'dui-disposition': 'revoke', 'dui-elapsed': 'over90' });
    expect(screen.getByRole('heading', { name: /지금 바로 확인이 필요합니다/ })).toBeInTheDocument();
    expect(screen.getAllByText(/110/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /상담 안내 보기/ })).toHaveAttribute('href', '/consult?topic=dui');
  });

  it('답변 없이 결과 주소로 직행하면 진단 시작을 안내한다', () => {
    renderAt('/check/dui/result');
    expect(screen.getByText(/진단을 먼저 진행해 주세요/)).toBeInTheDocument();
  });
});
