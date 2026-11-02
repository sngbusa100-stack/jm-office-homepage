import { Link } from 'react-router-dom';
import { homeFaqs } from '../data/faq';
import { checks } from '../data/checks';
import { office } from '../data/office';
import { profile } from '../data/profile';
import { ConsultCta } from '../components/ConsultCta';
import { OfficeStructuredData } from '../components/OfficeStructuredData';
import { ProfileCard } from '../components/ProfileCard';
import { PromiseList } from '../components/PromiseList';
import { ServiceAreaGrid } from '../components/ServiceAreaGrid';
import { VisaCheckCard } from '../components/VisaCheckCard';

// 비용을 시작 전에 글로 안내하는 단계는 FAQ "착수 전에 범위와 비용을 명확히 정하는 것을 원칙"과 같은 약속이다.
const processSteps = [
  { title: '이야기 듣기', detail: '상황과 기한부터 확인합니다.' },
  { title: '방법과 비용 안내', detail: '할 일과 비용을 시작 전에 글로 알려 드립니다.' },
  { title: '서류 준비·작성', detail: '요건에 맞는 증빙을 모으고 서류를 작성합니다.' },
  { title: '제출과 결과 확인', detail: '제출을 대행하고 보완 요구와 결과까지 챙깁니다.' },
];

/**
 * 홈 순서(docs/2026-11-02-home-intro-copy-plan.md 5-2): 첫 화면(소개) → 업무 분야 → 대표 인사말 요약 →
 * 셀프 진단 → 행정사가 필요한 이유 → 진행 절차 → FAQ → 마지막 안내.
 * 예전 '처분·통지를 받으셨다면' 띠는 업무 카드와 같은 곳으로 가서 업무 분야 머리말 한 줄로 흡수했다.
 */
export function HomePage() {
  return (
    <>
      <OfficeStructuredData />
      <section className="hero">
        <div className="page-shell hero__grid">
          <div className="hero__content">
            {office.addressNote && <p className="eyebrow">{office.addressNote} 행정사사무소</p>}
            <h1 className="hero__slogan">
              복잡한 행정절차를{' '}<br />
              <span className="slogan-mark">정</span>확하고 <span className="slogan-mark">명</span>쾌하게
            </h1>
            <p className="hero__intro">{profile.intro}</p>
            <ul className="hero__strengths" aria-label="정명 행정사사무소의 특징">
              {profile.strengths.map((strength) => (
                <li key={strength.title}>
                  <strong>{strength.title}</strong>
                  <span>{strength.detail}</span>
                </li>
              ))}
            </ul>
            <div className="button-row">
              <Link className="button button--accent" to="/services">업무 분야 살펴보기 →</Link>
              <Link className="button button--ghost" to="/check">바로 셀프 진단하기</Link>
            </div>
          </div>
          <ProfileCard profile={profile} />
        </div>
      </section>

      <section className="section page-shell" id="services" aria-labelledby="services-heading">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">업무 분야</p>
            <h2 id="services-heading">이런 일을 도와드립니다</h2>
            <p className="services-deadline-note">
              통지서를 받으셨다면 받은 날짜부터 확인하세요. 의견제출·이의신청·행정심판은 정해진 기간 안에 해야 합니다.
            </p>
          </div>
          <Link className="text-link" to="/services">전체 업무 보기 →</Link>
        </div>
        <ServiceAreaGrid headingLevel="h3" />
      </section>

      <section className="section section--tinted greeting" id="greeting" aria-labelledby="greeting-heading">
        <div className="page-shell greeting__grid">
          <div className="greeting__letter">
            <p className="eyebrow">대표 인사말</p>
            <h2 id="greeting-heading">{profile.greetingTitle}</h2>
            {profile.name && (
              <p className="greeting__hello">안녕하세요, {profile.role} {profile.name}입니다.</p>
            )}
            {profile.greetingSummary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Link className="text-link greeting__more" to="/about">인사말 전문 보기 →</Link>
          </div>
          <PromiseList promises={profile.promises} />
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="check-heading">
        <div className="section-heading">
          <p className="eyebrow">무엇부터 해야 할지 모르겠다면</p>
          <h2 id="check-heading">3분 셀프 진단</h2>
          <p>몇 가지 질문에 답하시면 지금 확인할 것과 준비할 서류가 정리됩니다.</p>
          <ul className="trust-list">
            <li>결과는 처분·인용 여부에 대한 판단이 아닌 일반 정보입니다</li>
            <li>답변은 브라우저에만 저장되며, 상담 신청 때 직접 선택하신 경우에만 함께 전송됩니다</li>
          </ul>
        </div>
        <div className="grid-3">
          {Object.values(checks).map((def) => (
            <article className="card action-card" key={def.domain}>
              <h3>{def.title}</h3>
              <p>{def.summary}</p>
              <p className="note">{def.questions.length}개 문항 · 약 3분</p>
              <Link className="button button--primary" to={`/check/${def.domain}`}>진단 시작 →</Link>
            </article>
          ))}
          <VisaCheckCard headingLevel="h3" />
        </div>
      </section>

      <section className="section section--tinted" aria-labelledby="why-heading">
        <div className="page-shell">
          <div className="feature-band">
            <div>
              <p className="eyebrow">맡기기 전에</p>
              <h2 id="why-heading">직접 하셔도 되는 일, 맡기시는 게 나은 일</h2>
              <p>
                간단한 민원은 직접 하시는 편이 낫습니다. 하지만 기한이 걸려 있거나 무엇을 증명해야 할지
                막막하다면 이야기가 다릅니다. 그 차이를 정리했습니다.
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
          {processSteps.map((step) => (
            <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>
          ))}
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
        <ConsultCta
          message={office.isOpen
            ? '혼자 고민하지 마시고 편하게 연락 주세요. 이야기를 듣는 것부터 시작하겠습니다.'
            : '개업 전에도 셀프 진단으로 지금 확인할 것부터 정리해 보실 수 있습니다.'}
        />
      </section>
    </>
  );
}
