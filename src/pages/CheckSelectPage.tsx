import { CheckCards } from '../components/CheckCards';

export function CheckSelectPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>셀프 진단</h1>
        <p>준비 중인 일을 고르세요. 지금 아는 내용만 답하면 다음에 확인할 일정과 챙길 자료를 볼 수 있습니다.</p>
        <p className="note">답변은 브라우저에 저장됩니다. 상담을 신청할 때 함께 보낼 수 있습니다.</p>
      </header>
      <CheckCards headingLevel="h2" />
    </div>
  );
}
