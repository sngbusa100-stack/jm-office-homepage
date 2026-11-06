import { Link } from 'react-router-dom';
import { profile } from '../data/profile';
import { OfficeLocation } from '../components/OfficeLocation';
import { OfficeVisitFacts } from '../components/OfficeVisitFacts';
import { ProfileCard } from '../components/ProfileCard';
import { PromiseList } from '../components/PromiseList';

/**
 * 사무소 소개: 대표 사진·인사말 전문·약속·찾아오시는 길. 홈 인사말은 이 글의 요약판이다.
 * 학력·경력·업무제휴 약력과 머리말 한 줄은 2026-11-06에 뺐다(약력은 주인님 지시, 머리말은 아래 내용과 겹침).
 */
export function AboutPage() {
  return (
    <div className="page-shell section about-page">
      <header className="page-header page-header--lead">
        <p className="eyebrow">정명(正明) 행정사사무소</p>
        <h1>사무소 소개</h1>
      </header>

      <div className="about__grid">
        <ProfileCard profile={profile} />
        <section className="greeting__letter" aria-labelledby="about-greeting">
          <p className="eyebrow">대표 인사말</p>
          <h2 id="about-greeting">{profile.greetingTitle}</h2>
          {profile.greeting.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {profile.name && (
            <p className="greeting__sign">
              정명 행정사사무소 {profile.role} <strong>{profile.name}</strong>
            </p>
          )}
        </section>
      </div>

      <section className="about__section" aria-labelledby="about-promises">
        <h2 id="about-promises">두 가지 약속</h2>
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
