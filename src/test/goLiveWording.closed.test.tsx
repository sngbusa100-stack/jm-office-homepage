import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRouter } from '../app/AppRouter';
import { checks } from '../data/checks';
import { findPreOpenPhrases } from '../../scripts/pre-open-phrases.mjs';
import { office } from '../data/office';
import { renderPage } from '../prerender/entry';

// 개업 전(지금 상태)에는 개업 문구 전환 작업 뒤에도 화면이 바뀌지 않아야 한다.
function visibleText(html: string): string {
  return html.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

describe('개업 전 화면 문구(현재 상태)', () => {
  it('지금은 개업 전이다', () => {
    expect(office.isOpen).toBe(false);
  });

  it('모든 페이지에 개업 준비 띠가 있다', () => {
    const text = visibleText(renderPage('/'));
    expect(text).toContain('개업 준비 중');
    expect(text).toContain('이 사이트는 정식 개업 전 사전 공개 화면입니다.');
  });

  it('홈 FAQ·방침·면책은 개업 전 문구 그대로다', () => {
    expect(visibleText(renderPage('/'))).toContain('현재 개업 준비 중으로, 상담·수임 접수는 정식 개업 후 시작됩니다.');
    expect(visibleText(renderPage('/privacy'))).toContain('상담 신청 폼은 개업 준비 중이라 비활성화되어 있어');
    const disclaimer = visibleText(renderPage('/disclaimer'));
    expect(disclaimer).toContain('이 사이트의 개업을 기다리지 마시고');
    expect(disclaimer).toContain('이 사이트는 개업 준비 중에 미리 공개한 사이트입니다.');
    expect(visibleText(renderPage('/services/immigration'))).toContain('개별 상담 접수는 개업 후 시작됩니다.');
  });

  it('진단 결과 긴급 안내 문장이 띄어쓰기까지 그대로다', async () => {
    sessionStorage.clear();
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/check/dui']}>
        <AppRouter />
      </MemoryRouter>,
    );
    for (const question of checks.dui.questions) {
      if (question.id === 'dui-elapsed') {
        await user.click(await screen.findByRole('radio', { name: /90일이 지남/ }));
      } else {
        await user.click((await screen.findAllByRole('radio'))[0]);
      }
      await user.click(screen.getByRole('button', { name: /다음|결과 보기/ }));
    }
    await screen.findByText(/지금 바로 확인이 필요합니다/);
    const text = (document.body.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('이 사이트의 개업을 기다리지 마시고 국민권익위원회 상담전화');
  });

  it('개업 전 문구 검사는 실제 문구를 찾아낸다', () => {
    expect(findPreOpenPhrases(visibleText(renderPage('/')))).toContain('개업 준비');
  });
});
