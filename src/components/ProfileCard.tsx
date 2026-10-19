import { Link } from 'react-router-dom';
import { office } from '../data/office';
import type { Profile } from '../data/profile';

/**
 * 첫 화면 대표 행정사 카드. 사진을 맨 위에 크게 두고 이름·학력·경력은 그 아래에 작게 적는다.
 * 사진이 없으면 같은 자리에 사무소 엠블럼을 둔다(profile.photo를 채우면 자동 교체).
 */
export function ProfileCard({ profile }: { profile: Profile }) {
  const base = import.meta.env.BASE_URL;
  return (
    <aside className="profile-card" aria-label="대표 행정사 소개">
      <figure className={`profile-card__portrait${profile.photo ? '' : ' profile-card__portrait--empty'}`}>
        {profile.photo ? (
          <img className="profile-card__photo" src={profile.photo.src} alt={profile.photo.alt} width={800} height={1000} />
        ) : (
          <img className="profile-card__emblem" src={`${base}images/logo-mark-128.png`} alt="" width={128} height={128} />
        )}
      </figure>
      <div className="profile-card__body">
        <div className="profile-card__id">
          <p className="profile-card__role">{profile.role}</p>
          {profile.name && <h2 className="profile-card__name">{profile.name}</h2>}
          <p className="profile-card__en" lang="en">{profile.nameEn}</p>
        </div>
        <dl className="profile-card__facts">
          {profile.education.length > 0 && (
            <div>
              <dt>학력</dt>
              <dd>
                <ul>
                  {profile.education.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </dd>
            </div>
          )}
          {profile.career.length > 0 && (
            <div>
              <dt>경력</dt>
              <dd>
                <ul>
                  {profile.career.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </dd>
            </div>
          )}
          {profile.lawPartner && (
            <div>
              <dt>법률 업무제휴</dt>
              <dd>{profile.lawPartner.firm} <span className="nowrap">({profile.lawPartner.lawyer})</span></dd>
            </div>
          )}
          {office.addressNote && (
            <div>
              <dt>사무소</dt>
              <dd>
                {office.addressNote} · <Link to="/location">오시는 길</Link>
              </dd>
            </div>
          )}
        </dl>
        <a className="profile-card__more" href="#greeting">대표 인사말 보기 ↓</a>
      </div>
    </aside>
  );
}
