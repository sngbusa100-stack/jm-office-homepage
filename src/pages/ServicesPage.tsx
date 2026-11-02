import { ConsultCta } from '../components/ConsultCta';
import { ServiceAreaGrid } from '../components/ServiceAreaGrid';

export function ServicesPage() {
  return (
    <div className="page-shell section">
      <header className="page-header page-header--lead">
        <p className="eyebrow">정명 업무 안내</p>
        <h1>업무 분야</h1>
        <p className="page-lead">
          정명 행정사사무소의 다섯 가지 업무 분야입니다. 지금 상황에 가까운 안내를 열어
          절차·기한·준비 서류를 먼저 확인해 보세요.
        </p>
      </header>

      <ServiceAreaGrid headingLevel="h2" />

      <ConsultCta message="어느 분야에 해당하는지 판단하기 어렵다면, 먼저 셀프 진단으로 확인할 항목을 정리해 보세요." />
    </div>
  );
}
