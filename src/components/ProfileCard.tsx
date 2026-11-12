import type { Profile } from '../data/profile';

/**
 * 대표 행정사 카드. 사진과 그 아래 한 줄(직함·이름·영문)만 둔다(2026-11-02 주인님 요청).
 * 학력·경력은 싣지 않는다(2026-11-06 /about 약력도 뺌). 사진이 없으면 같은 자리에 사무소 엠블럼을 둔다(profile.photo를 채우면 자동 교체).
 */
export function ProfileCard({ profile }: { profile: Profile }) {
  const base = import.meta.env.BASE_URL;
  return (
    <aside className="profile-card" aria-label="대표 행정사 소개">
      <figure className={`profile-card__portrait${profile.photo ? '' : ' profile-card__portrait--empty'}`}>
        {profile.photo ? (
          <img
            className="profile-card__photo"
            src={profile.photo.src}
            alt={profile.photo.alt}
            width={profile.photo.width}
            height={profile.photo.height}
            decoding="async"
          />
        ) : (
          <img className="profile-card__emblem" src={`${base}images/logo-mark-128.png`} alt="" width={128} height={128} />
        )}
      </figure>
      <p className="profile-card__id">
        <span className="profile-card__role">{profile.role}</span>
        {profile.name && <strong className="profile-card__name">{profile.name}</strong>}
        <span className="profile-card__en" lang="en">{profile.nameEn}</span>
      </p>
    </aside>
  );
}
