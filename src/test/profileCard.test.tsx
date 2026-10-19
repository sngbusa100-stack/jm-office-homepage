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

describe('대표 행정사 카드 — 사진 위, 문구는 아래에 작게', () => {
  it('사진 자리가 카드 맨 위에 있고 이름·학력·경력은 그 아래에 있다', () => {
    renderCard();
    const card = screen.getByRole('complementary', { name: '대표 행정사 소개' });
    const portrait = card.querySelector('.profile-card__portrait');
    expect(portrait).not.toBeNull();
    expect(card.firstElementChild).toBe(portrait);

    const body = card.querySelector('.profile-card__body') as HTMLElement;
    expect(within(body).getByRole('heading', { name: '정재훈' })).toBeInTheDocument();
    expect(within(body).getByText('중앙대학교 행정대학원 석사과정')).toBeInTheDocument();
    expect(within(body).getByText('DHL 법률사무소 고문')).toBeInTheDocument();
  });

  it('사진이 없으면 사진 자리에 사무소 엠블럼을 보여준다', () => {
    renderCard({ ...profile, photo: null });
    const img = document.querySelector('.profile-card__portrait img');
    expect(img?.getAttribute('src')).toContain('logo-mark');
    expect(img).toHaveAttribute('alt', '');
  });

  it('사진을 넣으면 엠블럼 대신 사진이 대체 텍스트와 함께 나온다', () => {
    renderCard({ ...profile, photo: { src: '/images/representative.jpg', alt: '대표 행정사 정재훈' } });
    const img = screen.getByRole('img', { name: '대표 행정사 정재훈' });
    expect(img).toHaveAttribute('src', '/images/representative.jpg');
    expect(img.closest('.profile-card__portrait')).not.toBeNull();
    expect(document.querySelector('.profile-card__portrait img[src*="logo-mark"]')).toBeNull();
  });
});
