import type { ReactNode } from 'react';
import type { Profile } from '../data/profile';

/**
 * 대표 행정사 작은 사진(56×70)과 "대표 행정사 정재훈" 한 줄. 모바일 홈 첫 화면(hero__rep)과 업무 상세(service-rep)에서 함께 쓴다.
 * 사진 alt는 비워 둔다(옆 글자가 설명). profile.photo가 없으면 글자만 그린다. 영문 이름·학력·경력은 넣지 않는다.
 */
export function RepresentativeBadge({
  profile,
  className,
  lazy = false,
  children,
}: {
  profile: Profile;
  className?: string;
  lazy?: boolean;
  children?: ReactNode;
}) {
  const label = [profile.role, profile.name].filter(Boolean).join(' ');
  return (
    <div className={`rep-badge${className ? ` ${className}` : ''}`}>
      {profile.photo && (
        <img
          className="rep-badge__photo"
          src={profile.photo.src}
          alt=""
          width={56}
          height={70}
          decoding="async"
          loading={lazy ? 'lazy' : undefined}
        />
      )}
      <div className="rep-badge__text">
        <strong className="rep-badge__name">{label}</strong>
        {children}
      </div>
    </div>
  );
}
