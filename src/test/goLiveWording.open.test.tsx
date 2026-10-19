import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { findPreOpenPhrases } from '../../scripts/pre-open-phrases.mjs';

// 개업 상태(isOpen=true, 필수값 모두 있음)를 가정한다(docs/2026-10-19-go-live-check-plan.md 2-2).
vi.mock('../data/office', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/office')>();
  return {
    ...actual,
    office: {
      ...actual.office,
      isOpen: true,
      kakaoChannelUrl: 'https://pf.kakao.com/_test',
      registrationNumber: 'TEST-1',
      businessNumber: '000-00-00000',
    },
  };
});

const { renderPage } = await import('../prerender/entry');
const { getIndexablePaths } = await import('../lib/pageMeta');
const { AppRouter } = await import('../app/AppRouter');
const { checks } = await import('../data/checks');

/** HTML에서 화면에 보이는 글만 남긴다(React 텍스트 경계 주석 포함 제거). */
function visibleText(html: string): string {
  return html
    .replace(/<!--.*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

describe('개업 뒤 화면 문구', () => {
  it.each(getIndexablePaths())('%s 에 개업 전 문구가 남지 않는다', (path) => {
    expect(findPreOpenPhrases(visibleText(renderPage(path)))).toEqual([]);
  });

  it('개업 전 안내 띠가 사라지고 등록번호가 보인다', () => {
    const text = visibleText(renderPage('/'));
    expect(text).not.toContain('사전 공개');
    expect(text).toContain('행정사 등록번호 TEST-1');
  });

  it('홈 FAQ는 상담 신청 방법을 안내한다', () => {
    const text = visibleText(renderPage('/'));
    expect(text).toContain('상담은 어떻게 신청하나요?');
    expect(text).toContain('상담 신청 화면에서 신청하시거나 사무실 전화로 문의하실 수 있습니다.');
  });

  it('개인정보처리방침은 상담 신청 폼으로 받은 개인정보를 처리한다고 적는다', () => {
    expect(visibleText(renderPage('/privacy'))).toContain('상담 신청 폼으로 받은 개인정보는 아래 내용대로 처리합니다.');
  });

  it('진단 결과의 긴급 안내에도 개업 전 문구가 없다', async () => {
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
    expect(await screen.findByText(/지금 바로 확인이 필요합니다/)).toBeInTheDocument();
    expect(findPreOpenPhrases(document.body.textContent ?? '')).toEqual([]);
    expect((document.body.textContent ?? '').replace(/\s+/g, ' ')).toContain('상담 회신을 기다리지 마시고 국민권익위원회 상담전화');
  });
});
