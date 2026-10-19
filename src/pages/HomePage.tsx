import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { homeFaqs } from '../data/faq';
import { checks } from '../data/checks';
import { profile } from '../data/profile';
import { ConsultCta } from '../components/ConsultCta';
import { OfficeStructuredData } from '../components/OfficeStructuredData';
import { ProfileCard } from '../components/ProfileCard';

// 처분·통지를 받은 방문자를 상황별 업무 안내로 바로 보낸다(예전 첫 화면 문구의 새 자리).
const noticeLinks = [
  { to: '/services/suspension', label: '영업정지·과징금 통지', detail: '의견제출·행정심판' },
  { to: '/services/dui', label: '운전면허 정지·취소', detail: '이의신청·행정심판' },
  { to: '/services/license', label: '신청 반려·보완 요구', detail: '반려 사유 검토·재신청' },
];

export function HomePage() {
  return (
    <>
      <OfficeStructuredData />
      <section className="hero">
        <div className="page-shell hero__grid">
          <div className="hero__content">
            <p className="eyebrow">정명(正明) 행정사사무소</p>
            <h1 className="hero__slogan">
              복잡한 행정절차를{' '}<br />
              <span className="slogan-mark">정</span>확하고 <span className="slogan-mark">명</span>쾌하게
            </h1>
            <p className="hero__intro">
              <strong className="hero__lead">{profile.intro.lead}</strong>{' '}
              {profile.intro.body}
            </p>
            <div className="button-row">
              <Link className="button button--accent" to="/services">업무 분야 살펴보기 →</Link>
              <Link className="button button--ghost" to="/check">바로 셀프 진단하기</Link>
            </div>
          </div>
          <ProfileCard profile={profile} />
        </div>
      </section>

      <section className="section page-shell greeting" id="greeting" aria-labelledby="greeting-heading">
        <div className="greeting__grid">
          <div className="greeting__letter">
            <p className="eyebrow">대표 인사말</p>
            <h2 id="greeting-heading">정확하게 확인하고, 명쾌하게 설명드리겠습니다</h2>
            {profile.name && (
              <p className="greeting__hello">안녕하세요. 정명 행정사사무소 {profile.role} {profile.name}입니다.</p>
            )}
            {profile.greeting.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {profile.name && (
              <p className="greeting__sign">
                정명 행정사사무소 {profile.role} <strong>{profile.name}</strong>
              </p>
            )}
          </div>
          <ol className="promise-list">
            {profile.promises.map((promise) => (
              <li key={promise.rest}>
                <h3>
                  {promise.mark && <span className="slogan-mark">{promise.mark}</span>}
                  {promise.rest}
                </h3>
                <p>{promise.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section page-shell" id="services" aria-labelledby="services-heading">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">분야별 절차 안내</p>
            <h2 id="services-heading">업무 분야</h2>
          </div>
          <Link className="text-link" to="/services">전체 업무 보기 →</Link>
        </div>
        <div className="grid-3 service-grid">
          {services.map((s, index) => (
            <article className="card service-card" key={s.slug}>
              <p className="service-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
              <h3>{s.name}</h3>
              <p>{s.short}</p>
              <Link className="text-link" to={`/services/${s.slug}`}>자세히 보기 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted" aria-labelledby="notice-heading">
        <div className="page-shell notice-band">
          <div>
            <p className="eyebrow">처분·통지를 받으셨다면</p>
            <h2 id="notice-heading">행정 문제는 초기 대응이 중요합니다</h2>
            <p>
              영업정지 통지, 면허 취소, 반려된 신청 — 처분에 대한 불복과 의견제출에는 정해진
              기간이 있습니다. 통지서를 받은 날짜부터 확인하고, 가까운 상황의 안내를 열어 보세요.
            </p>
          </div>
          <ul className="notice-links">
            {noticeLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>
                  <strong>{item.label}</strong>
                  <span>{item.detail} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="check-heading">
        <div className="section-heading">
          <p className="eyebrow">분야를 모르겠다면</p>
          <h2 id="check-heading">3분 셀프 진단</h2>
          <p>어느 분야에 해당하는지 애매하다면 진단으로 먼저 확인할 항목을 정리해 보세요.</p>
          <ul className="trust-list">
            <li>결과는 처분·인용 여부에 대한 판단이 아닌 일반 정보입니다</li>
            <li>답변은 브라우저에만 저장되며, 상담 신청 때 직접 선택하신 경우에만 함께 전송됩니다</li>
          </ul>
        </div>
        <div className="grid-3">
          {Object.values(checks).map((def) => (
            <article className="card action-card" key={def.domain}>
              <h3>{def.title}</h3>
              <p>{def.intro}</p>
              <Link className="button button--primary" to={`/check/${def.domain}`}>진단 시작 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="page-shell">
          <div className="feature-band">
            <div>
              <p className="eyebrow">역할과 범위</p>
              <h2>왜 전문가와 함께해야 하나요?</h2>
              <p>
                행정 절차는 기한과 요건을 함께 살펴야 합니다. 행정사가 하는 일과,
                혼자 진행할 때의 차이를 알기 쉽게 정리했습니다.
              </p>
            </div>
            <Link className="button button--ghost" to="/why">행정사가 필요한 이유 보기 →</Link>
          </div>
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="process-heading">
        <div className="section-heading">
          <p className="eyebrow">처음부터 제출 이후까지</p>
          <h2 id="process-heading">진행 절차</h2>
        </div>
        <ol className="process-grid">
          <li><h3>셀프 진단·상담</h3><p>상황과 기한을 확인하고 진행 방향을 정합니다.</p></li>
          <li><h3>서류 준비·작성</h3><p>요건에 맞는 증빙을 수집하고 서류를 작성합니다.</p></li>
          <li><h3>제출·결과 확인</h3><p>제출을 대행하고 보완 요구와 결과에 대응합니다.</p></li>
        </ol>
      </section>

      <section className="section page-shell faq-section" aria-labelledby="faq-heading">
        <div className="section-heading">
          <p className="eyebrow">이용 전 확인</p>
          <h2 id="faq-heading">자주 묻는 질문</h2>
        </div>
        <div className="faq-list">
          {homeFaqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section page-shell">
        <ConsultCta message="어디서부터 시작해야 할지 막막하다면, 셀프 진단으로 확인할 항목부터 정리해 보세요." />
      </section>
    </>
  );
}
