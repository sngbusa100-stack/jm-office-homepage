import { Link } from 'react-router-dom';
import { profile } from '../data/profile';
import { OfficeLocation } from '../components/OfficeLocation';
import { OfficeVisitFacts } from '../components/OfficeVisitFacts';
import { ProfileCard } from '../components/ProfileCard';
import { PromiseList } from '../components/PromiseList';

/** 사무소 소개: 대표 사진·인사말 전문·약력·약속·찾아오시는 길. 홈 인사말은 이 글의 요약판이다. */
export function AboutPage() {
  const bio = [
    ...profile.education.map((value) => ({ label: '학력', value })),
    ...profile.career.map((value) => ({ label: '경력', value })),
    ...(profile.lawPartner
      ? [{ label: '법률 업무제휴', value: `${profile.lawPartner.firm} (${profile.lawPartner.lawyer})` }]
      : []),
  ];

  return (
    <div className="page-shell section about-page">
      <header className="page-header page-header--lead">
        <p className="eyebrow">정명(正明) 행정사사무소</p>
        <h1>사무소 소개</h1>
        <p className="page-lead">
          복잡한 행정절차를 정확하고 명쾌하게. 광명KTX역 5번출구 앞, 변호사 사무실과 같은 공간에 있습니다.
        </p>
      </header>

      <div className="about__grid">
        <ProfileCard profile={profile} />
        <section className="greeting__letter" aria-labelledby="about-greeting">
          <p className="eyebrow">대표 인사말</p>
          <h2 id="about-greeting">{profile.greetingTitle}</h2>
          {profile.name && (
            <p className="greeting__hello">안녕하세요. 정명 행정사사무소 {profile.role} {profile.name}입니다.</p>
          )}
          {profile.greeting.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {profile.name && (
            <p className="greeting__sign">
              정명 행정사사무소 {profile.role} <strong>{profile.name}</strong>
            </p>
          )}
          {bio.length > 0 && (
            <dl className="about__bio" aria-label="약력">
              {bio.map((row) => (
                <div key={`${row.label}-${row.value}`}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      <section className="about__section" aria-labelledby="about-promises">
        <h2 id="about-promises">세 가지 약속</h2>
        <PromiseList promises={profile.promises} />
      </section>

      <section className="card about__section" aria-labelledby="about-visit">
        <h2 id="about-visit">찾아오시는 길</h2>
        <OfficeLocation />
        <OfficeVisitFacts />
        <Link className="text-link" to="/location">오시는 길 자세히 보기 →</Link>
      </section>
    </div>
  );
}
