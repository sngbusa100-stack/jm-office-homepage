export function DisclaimerPage() {
  return (
    <div className="page-shell section narrow-page">
      <header className="page-header">
        <h1>면책 고지</h1>
      </header>

      <section aria-labelledby="general-info">
        <h2 id="general-info">일반 정보 제공 목적</h2>
        <p>
          본 사이트에 실린 모든 안내와 셀프 진단 결과는 일반적인 정보 제공을 목적으로 하며,
          개별 사안에 대한 법률 자문을 대신하지 않습니다.
        </p>
      </section>

      <section aria-labelledby="no-prediction">
        <h2 id="no-prediction">결과를 예측하거나 보증하지 않습니다</h2>
        <p>
          셀프 진단 결과는 입력하신 답변을 정리한 것일 뿐, 처분 여부나 행정심판 인용 여부 등
          실제 결과를 예측하거나 보증하지 않으며, 최종 판단은 관할 행정기관 또는 행정심판위원회 등
          심판기관이 합니다.
        </p>
      </section>

      <section aria-labelledby="check-latest">
        <h2 id="check-latest">법령·제도 확인 안내</h2>
        <p>
          관련 법령과 제도는 개정될 수 있으므로, 중요한 결정을 내리시기 전에는 반드시 공식 출처를
          통해 최신 내용을 확인하시기 바랍니다.
        </p>
      </section>

      <section className="card level-urgent" aria-labelledby="urgent">
        <h2 id="urgent">긴급한 사안이라면</h2>
        <p>
          법정 기한이 임박하는 등 긴급한 사안은 이 사이트의 개업을 기다리지 마시고 국민권익위원회
          상담전화(국번 없이 <a href="tel:110">110</a>) 또는 해당 처분을 한 관할 기관에 즉시
          확인하시기 바랍니다.
        </p>
      </section>

      <section aria-labelledby="pre-opening">
        <h2 id="pre-opening">사전 공개 사이트 안내</h2>
        <p>이 사이트는 개업 준비 중에 미리 공개한 사이트입니다.</p>
      </section>
    </div>
  );
}
