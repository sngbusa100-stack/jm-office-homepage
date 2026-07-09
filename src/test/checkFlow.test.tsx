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

describe('진단 흐름', () => {
  beforeEach(() => sessionStorage.clear());

  it('/check에서 3개 진단을 고를 수 있다', () => {
    renderAt('/check');
    for (const def of Object.values(checks)) {
      expect(screen.getByRole('link', { name: new RegExp(def.title) })).toBeInTheDocument();
    }
  });

  it('질문에 모두 답하면 결과 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    renderAt('/check/dui');
    const total = checks.dui.questions.length;
    for (let i = 0; i < total; i += 1) {
      const options = await screen.findAllByRole('radio');
      await user.click(options[0]);
      await user.click(screen.getByRole('button', { name: /다음|결과 보기/ }));
    }
    expect(await screen.findByText(/진단 결과/)).toBeInTheDocument();
  });

  it('긴급 답변이 있으면 결과 상단에 긴급 확인과 110 안내가 나온다', async () => {
    const user = userEvent.setup();
    renderAt('/check/dui');
    const total = checks.dui.questions.length;
    for (let i = 0; i < total; i += 1) {
      const question = checks.dui.questions[i];
      if (question.id === 'dui-elapsed') {
        await user.click(await screen.findByRole('radio', { name: /90일이 지남/ }));
      } else {
        const options = await screen.findAllByRole('radio');
        await user.click(options[0]);
      }
      await user.click(screen.getByRole('button', { name: /다음|결과 보기/ }));
    }
    expect(await screen.findByText(/지금 바로 확인이 필요합니다/)).toBeInTheDocument();
    expect(screen.getAllByText(/110/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /상담 안내 보기/ })).toHaveAttribute('href', '/consult');
  });

  it('답변 없이 결과 주소로 직행하면 진단 시작을 안내한다', () => {
    renderAt('/check/dui/result');
    expect(screen.getByText(/진단을 먼저 진행해 주세요/)).toBeInTheDocument();
  });
});
