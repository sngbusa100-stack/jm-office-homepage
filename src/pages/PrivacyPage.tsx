import { office } from '../data/office';
import {
  OVERSEAS_TRANSFERS,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_HISTORY,
  PRIVACY_SOURCES,
  PRIVACY_SOURCES_CHECKED_AT,
} from '../data/privacyPolicy';

function koreanDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

// 개인정보 보호법 제30조①(법률 제21445호, 2026-09-11 시행)과 시행령 제31조①의 기재사항 순서를 따른다.
export function PrivacyPage() {
  return (
    <div className="page-shell section narrow-page">
      <header className="page-header">
        <h1>개인정보처리방침</h1>
      </header>

      <p>
        정명 행정사사무소(이하 “사무소”)는 개인정보 보호법에 따라 이용자의 개인정보를 보호하고, 관련 고충을
        신속하게 처리하기 위해 다음과 같이 개인정보처리방침을 둡니다. 이 사이트는 광고 쿠키나 제3자 방문자 분석
        도구를 사용하지 않습니다. 상담 신청 폼은 개업 준비 중이라 비활성화되어 있어 현재는 상담 개인정보가
        접수되지 않으며, 폼을 열면 아래 내용대로 처리합니다.
      </p>

      <section aria-labelledby="purpose">
        <h2 id="purpose">처리 목적</h2>
        <ul>
          <li><strong>상담 신청 처리:</strong> 상담 회신과 일정 안내, 상담 진행 상황 관리. 그 외 목적으로 사용하지 않습니다.</li>
          <li><strong>셀프 진단:</strong> 진단 결과 정리(답변은 방문 중인 브라우저에만 보관).</li>
          <li><strong>이용 단계 통계:</strong> 개인을 알아볼 수 없는 단계별 이용 횟수 합계로 서비스 개선.</li>
          <li><strong>요청 남용 방지:</strong> 짧은 시간에 요청이 몰리는 것을 막는 보안 목적.</li>
        </ul>
      </section>

      <section aria-labelledby="items">
        <h2 id="items">처리하는 개인정보 항목</h2>
        <ul>
          <li><strong>상담 신청 필수 항목:</strong> 성함, 연락처, 상담 분야, 개인정보 수집·이용 동의 여부</li>
          <li><strong>상담 신청 선택 항목:</strong> 이메일, 상담 내용, 셀프 진단 답변(상담 신청 화면에서 함께 보내기를 선택하신 경우에 한함), 비자 사전진단 결과(비자 사전진단 사이트에서 전달에 동의하신 경우에 한함)</li>
          <li><strong>출입국·비자 분야 추가 항목:</strong> 문의하는 분과 비자를 받을 분의 관계, 회사 문의 시 처리할 직원 수(선택), 비자를 받을 분의 체류 상태·체류기간 만료일(선택)·현재 체류자격, 하려는 절차와 원하는 체류자격(선택), 진행 단계와 기관 문서의 받은 날짜·마감일, 출입국 관련 기록 유무(선택), 연락 언어, 해외에 있거나 처음 입국하는 경우의 목표 시점(선택)과 국적(선택). 외국인등록번호·여권번호·여권 사진·상세주소·생년월일은 받지 않습니다. 선택 항목은 답하지 않아도 상담을 받으실 수 있습니다.</li>
          <li><strong>자동으로 생성·수집되는 항목:</strong> 접수번호, 접수일시, 동의 문구 버전과 동의 일시, 요청 출처(접속한 사이트 주소), 유입 경로(유입 페이지·광고 유입 정보), 처리 상태·진행 단계·처리 완료 일시, 사무소 메모, 요청 남용 방지용 접속 IP 해시값</li>
          <li><strong>당사자가 아닌 분의 문의:</strong> 가족·회사 등이 비자를 받을 분을 대신해 문의하는 경우, 신청하시는 분이 당사자에게 알린 뒤 위 항목만 받으며 당사자의 이름·연락처·식별번호는 받지 않습니다. 당사자는 요구하시면 수집 출처, 처리 목적, 처리정지 요구권을 안내받으실 수 있습니다(개인정보 보호법 제20조). 만 14세 미만 아동에 관한 문의는 법정대리인이 신청해 주세요.</li>
          <li><strong>받지 않는 정보:</strong> 주민등록번호·외국인등록번호·여권번호·운전면허번호 같은 고유식별정보와 계좌번호, 신분증 사진, 병명 같은 민감한 내용은 상담 신청 단계에서 받지 않습니다. 상담 내용 칸에도 적지 말아 주세요.</li>
        </ul>
      </section>

      <section aria-labelledby="retention">
        <h2 id="retention">보유 기간과 파기</h2>
        <ul>
          <li><strong>보유 기간:</strong> 상담 접수 기록은 상담 처리 완료 후 120일 동안 보관한 뒤 파기합니다. 보관 기간은 추가 문의와 행정심판 등 후속 절차 안내에 대응하기 위한 것이며, 그 전에라도 사무소가 직접 파기할 수 있습니다.</li>
          <li><strong>파기 절차:</strong> 보관 기간이 지난 기록은 매일 한 번 자동 점검해 파기합니다.</li>
          <li><strong>파기 방법:</strong> 성함·연락처·이메일·상담 내용·셀프 진단 답변·비자 관련 답변·유입 경로·요청 출처·메모·동의 기록을 저장소에서 지웁니다.</li>
          <li><strong>파기 뒤 남는 항목:</strong> 중복 파기 방지와 통계를 위해 접수번호, 접수일시, 상담 분야, 최종 상태, 진행 단계, 메모 개수만 접근이 제한된 상태로 남습니다. 이 항목으로는 신청하신 분을 알아볼 수 없습니다.</li>
          <li><strong>업무를 맡기신 경우:</strong> 상담 뒤 업무를 위임하시면 해당 기록은 사무소 업무용 컴퓨터의 사건 관리 프로그램으로 옮겨, 위임 계약 때 따로 안내하는 기간 동안 보관합니다.</li>
          <li><strong>브라우저 보관 정보:</strong> 셀프 진단 답변과 유입 정보는 브라우저의 세션 저장소에만 있으며 탭을 닫으면 삭제됩니다. 이용 단계 통계 합계는 최대 400일 뒤 자동 삭제됩니다.</li>
        </ul>
      </section>

      <section aria-labelledby="third-party">
        <h2 id="third-party">제3자 제공</h2>
        <p>
          사무소는 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나, 법률 검토가 필요해
          의뢰인이 원하시는 경우 따로 동의를 받은 뒤에만 그 범위에서 제공합니다.
        </p>
      </section>

      <section aria-labelledby="overseas">
        <h2 id="overseas">처리 위탁과 국외 이전</h2>
        <p>
          상담 신청을 처리하기 위해 아래 국외 사업자에게 개인정보 처리를 위탁하고 보관합니다. 근거는 상담과 위임
          계약의 체결을 위한 처리위탁·보관으로서 이 방침에 이전 사항을 공개한 경우입니다(개인정보 보호법
          제28조의8제1항제3호).
        </p>
        <div className="table-scroll">
          <table className="privacy-transfer-table">
            <caption className="sr-only">처리 위탁·국외 이전 현황</caption>
            <thead>
              <tr>
                <th scope="col">이전받는 자(연락처)</th>
                <th scope="col">국가</th>
                <th scope="col">이전 항목</th>
                <th scope="col">시기와 방법</th>
                <th scope="col">이용 목적</th>
                <th scope="col">보유·이용 기간</th>
              </tr>
            </thead>
            <tbody>
              {OVERSEAS_TRANSFERS.map((row) => (
                <tr key={row.recipient}>
                  <th scope="row">{row.recipient}<br /><span className="note">{row.contact}</span></th>
                  <td data-label="국가">{row.country}</td>
                  <td data-label="이전 항목">{row.items}</td>
                  <td data-label="시기와 방법">{row.when}</td>
                  <td data-label="이용 목적">{row.purpose}</td>
                  <td data-label="보유·이용 기간">{row.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>국외 이전 거부 방법과 효과:</strong> 상담 신청 화면의 동의를 하지 않으시면 온라인 신청은
          접수되지 않고 국외 이전도 일어나지 않습니다. 이 경우 사무소 전화나 이메일로 상담을 문의하실 수 있습니다.
        </p>
        <p className="note">
          이전받는 자의 명칭과 연락처는 각 사의 공개 문서에서 확인했습니다(확인일 {koreanDate(PRIVACY_SOURCES_CHECKED_AT)}):{' '}
          {PRIVACY_SOURCES.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ', '}
              <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
            </span>
          ))}
        </p>
      </section>

      <section aria-labelledby="rights">
        <h2 id="rights">정보주체의 권리와 행사 방법</h2>
        <ul>
          <li>언제든지 개인정보의 열람, 정정·삭제, 처리정지를 요구하시거나 동의를 철회하실 수 있습니다.</li>
          <li>아래 보호책임자에게 전화·이메일·서면으로 요구하시면 됩니다. 법정대리인이나 위임을 받은 분도 대신 요구하실 수 있습니다.</li>
          <li>요구를 받은 날부터 10일 이내에 조치하고 그 결과를 알려 드립니다. 법령에 따라 요구에 응할 수 없는 경우에는 그 사유와 이의제기 방법을 알려 드립니다.</li>
          <li>만 14세 미만 아동의 권리는 법정대리인이 행사하실 수 있습니다.</li>
        </ul>
      </section>

      <section aria-labelledby="safety">
        <h2 id="safety">안전성 확보 조치</h2>
        <ul>
          <li>모든 전송은 암호화된 연결(HTTPS)로 이루어집니다.</li>
          <li>접수 관리 화면은 비밀 토큰으로 인증한 경우에만 열리고, 인증 실패가 반복되면 일정 시간 접근을 막습니다.</li>
          <li>사무소 사건 관리 프로그램과의 연동에는 관리 화면과 다른 별도 토큰을 씁니다.</li>
          <li>보관 기간이 지난 기록은 매일 자동 파기합니다.</li>
          <li>업무용 알림(Telegram)에는 평상시 접수번호만 보내고 성함·연락처·상담 내용은 보내지 않습니다(저장 장애 때만 예외).</li>
          <li>요청 남용 방지에는 접속 IP 원문이 아니라 비밀값으로 변환한 해시값만 저장하며 60초(관리자 로그인 실패 제한은 5분) 뒤 자동 삭제됩니다.</li>
        </ul>
      </section>

      <section aria-labelledby="auto-collect">
        <h2 id="auto-collect">자동 수집 장치(쿠키 등)</h2>
        <p>
          이 사이트는 쿠키를 사용하지 않습니다. 셀프 진단 답변과 유입 정보(광고·검색 유입 표시)는 브라우저의 세션
          저장소(session storage)에만 보관되며 탭을 닫으면 삭제됩니다. 브라우저 설정에서 사이트 데이터를 지우셔도
          됩니다. 진단 답변은 상담 신청 때 직접 함께 보내기를 선택하신 경우에만 접수 서버로 전송되며, 상담 분야와
          진단 분야가 다르거나 비자 사전진단 결과를 함께 보내는 경우에는 전송하지 않습니다.
        </p>
        <p>
          별도 비자 사전진단 사이트의 답변은 결과 화면에서 “진단 결과 전달”에 동의하신 경우에만 이름·연락처 없이
          30분 동안 유효한 일회성 연결정보로 이 상담 화면에 전달됩니다. 연결정보는 한 번 불러오면 즉시 소진됩니다.
        </p>
        <p>
          이용 단계 통계는 설명 페이지 조회, 다음 단계 클릭, 진단 시작·완료, 상담 화면 조회·접수 완료 횟수를 날짜·업무
          분야·유입 출처별 합계로만 저장하며, 이름·연락처·상담 내용·진단 답변이나 개인별 방문 경로는 포함하지
          않습니다. 서버 운영사(Vercel)가 접속 기록을 일정 기간 보관할 수 있습니다.
        </p>
      </section>

      <section aria-labelledby="officer">
        <h2 id="officer">개인정보 보호책임자</h2>
        <p>
          개인정보 보호책임자: 대표 행정사 {office.representative ?? '정재훈'}
        </p>
        {office.email && office.phone ? (
          <p>
            개인정보 처리와 관련한 문의, 권리 행사, 고충 처리는 사무소 이메일(
            <a href={`mailto:${office.email}`}>{office.email}</a>) 또는 전화(
            <a href={`tel:${office.phone}`}>{office.phone}</a>)로 하실 수 있습니다.
          </p>
        ) : (
          <p>
            개인정보 처리에 관한 문의는 개업 후 이 사이트와 사무소 안내에 공개되는 연락처로 가능합니다.
          </p>
        )}
      </section>

      <section aria-labelledby="remedy">
        <h2 id="remedy">권익침해 구제 방법</h2>
        <p>개인정보 침해에 대한 상담이나 분쟁 해결이 필요하시면 아래 기관에 문의하실 수 있습니다.</p>
        <ul>
          <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
          <li>개인정보침해신고센터: 국번 없이 118 (privacy.kisa.or.kr)</li>
          <li>대검찰청: 국번 없이 1301</li>
          <li>경찰청: 국번 없이 182</li>
        </ul>
      </section>

      <section aria-labelledby="history">
        <h2 id="history">시행일과 변경 이력</h2>
        <p>이 개인정보처리방침은 {koreanDate(PRIVACY_EFFECTIVE_DATE)}부터 시행합니다.</p>
        <ul>
          {PRIVACY_HISTORY.map((entry) => (
            <li key={entry.date}>{koreanDate(entry.date)} 시행 — {entry.note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
