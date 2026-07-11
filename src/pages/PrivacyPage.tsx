export function PrivacyPage() {
  return (
    <div className="page-shell section narrow-page">
      <header className="page-header">
        <h1>개인정보처리방침</h1>
      </header>

      <section aria-labelledby="current-status">
        <h2 id="current-status">현재 수집 현황</h2>
        <p>
          이 사이트는 현재 쿠키, 방문자 분석 도구, 서버를 통한 개인정보 수집을 사용하지 않습니다.
          페이지를 둘러보시는 동안 방문자를 식별하거나 추적하는 어떠한 정보도 별도로 수집하지 않습니다.
        </p>
      </section>

      <section aria-labelledby="self-check-data">
        <h2 id="self-check-data">셀프 진단 답변의 보관 위치</h2>
        <p>
          셀프 진단에서 입력하신 답변과 진단 요약은 방문 중인 브라우저의 세션 저장소(session storage)에만
          보관됩니다. 이 정보는 서버로 전송되지 않으며, 브라우저 탭을 닫으면 함께 삭제됩니다.
        </p>
      </section>

      <section aria-labelledby="consult-form">
        <h2 id="consult-form">상담 신청 폼</h2>
        <p>
          상담 신청 폼은 현재 개업 준비 중으로 비활성화되어 있으며, 입력하신 내용이 접수되거나
          저장되지 않습니다. 개업 후 폼이 활성화되면 아래 내용으로 개인정보를 처리하며,
          동의를 받은 경우에만 수집합니다.
        </p>
        <ul>
          <li><strong>수집 항목:</strong> 성함, 연락처, 상담 분야, 상담 내용</li>
          <li><strong>이용 목적:</strong> 상담 회신과 일정 안내 (그 외 목적으로 사용하지 않음)</li>
          <li><strong>전송 방식:</strong> 입력하신 내용은 암호화된 연결(HTTPS)로 접수 서버를 거쳐 사무소의 업무용 알림 채널(텔레그램 메신저)로 전달됩니다.</li>
          <li><strong>처리 위탁·국외 이전:</strong> 전송 과정에서 접수 서버 운영사 Vercel Inc.와 메시지 전달을 위한 Telegram(모두 국외 사업자)의 인프라를 경유합니다. 별도의 데이터베이스에 저장하지 않습니다.</li>
          <li><strong>보관·파기:</strong> 상담 회신 완료 후 지체 없이 파기합니다.</li>
        </ul>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact">문의</h2>
        <p>
          개인정보 처리방침에 관한 문의는 개업 후 이 사이트와 사무소 안내에 공개되는 연락처로
          가능합니다.
        </p>
      </section>
    </div>
  );
}
