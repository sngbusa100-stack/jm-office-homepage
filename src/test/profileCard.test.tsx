import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileCard } from '../components/ProfileCard';
import { profile } from '../data/profile';
import type { Profile } from '../data/profile';

function renderCard(data: Profile = profile) {
  return render(
    <MemoryRouter>
      <ProfileCard profile={data} />
    </MemoryRouter>,
  );
}

describe('대표 행정사 카드 — 사진과 그 아래 한 줄만', () => {
  it('사진 자리가 카드 맨 위에 있고, 그 아래에는 직함·이름·영문 한 줄만 있다', () => {
    renderCard();
    const card = screen.getByRole('complementary', { name: '대표 행정사 소개' });
    const portrait = card.querySelector('.profile-card__portrait');
    expect(portrait).not.toBeNull();
    expect(card.firstElementChild).toBe(portrait);
    expect(card.children).toHaveLength(2);

    const line = card.querySelector('.profile-card__id') as HTMLElement;
    expect(line.tagName).toBe('P');
    expect(line).toHaveTextContent('대표 행정사정재훈JUNG JAE HOON');
    // 학력·경력·제휴·링크는 카드에 싣지 않는다(2026-11-02 주인님 요청, /about 약력으로 이동)
    expect(within(card).queryByText('중앙대학교 행정대학원 석사과정')).toBeNull();
    expect(within(card).queryByText('DHL 법률사무소 고문')).toBeNull();
    expect(within(card).queryAllByRole('link')).toHaveLength(0);
  });

  it('사진이 없으면 사진 자리에 사무소 엠블럼을 보여준다', () => {
    renderCard({ ...profile, photo: null });
    const img = document.querySelector('.profile-card__portrait img');
    expect(img?.getAttribute('src')).toContain('logo-mark');
    expect(img).toHaveAttribute('alt', '');
  });

  it('사진을 넣으면 엠블럼 대신 사진이 대체 텍스트·크기와 함께 나온다', () => {
    renderCard({ ...profile, photo: { src: '/images/representative.jpg', alt: '대표 행정사 정재훈', width: 800, height: 1000 } });
    const img = screen.getByRole('img', { name: '대표 행정사 정재훈' });
    expect(img).toHaveAttribute('src', '/images/representative.jpg');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '1000');
    expect(img.closest('.profile-card__portrait')).not.toBeNull();
    expect(document.querySelector('.profile-card__portrait img[src*="logo-mark"]')).toBeNull();
  });
});
