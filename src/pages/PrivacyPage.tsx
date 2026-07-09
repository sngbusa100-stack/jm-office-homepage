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
          저장되지 않습니다. 개업 후 폼이 활성화되는 시점에 수집 항목, 이용 목적, 보관 기간을
          이 페이지에 구체적으로 고지하고 동의를 받은 뒤에만 개인정보를 수집합니다.
        </p>
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
