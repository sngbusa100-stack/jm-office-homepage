# 기한·긴급 신호를 접수 → 알림 → 관리 화면까지 잇기 — 계획 (2026-10-21, 주인님 승인: 3절 추천안 전부, 1~6단계 구현 완료·미커밋 — 아래 7·8절)

> 실행 방식: 승인 뒤 superpowers:executing-plans(이 세션에서 직접) 또는 subagent-driven-development. 단계는 `- [ ]` 체크박스로 추적한다.

**목표:** 접수 하나가 '기한이 급한 건'인지 한 곳에서 판정하고, 그 판정이 접수 알림·아침 요약·회신 초안·/admin·로컬 대기함에 똑같이 보이게 한다.

**구조:** 판정은 저장된 고객 답에서 매번 계산하는 순수 함수 하나(`api/_urgency.mjs`)로 모은다. 판정 결과를 레코드에 따로 저장하지 않는다. 그래서 예전 접수도 그대로 판정되고, 값이 서로 어긋날 일도 없다. 로컬에는 connector GET이 계산 결과(`urgentReasons`)를 함께 내려준다. `replyDraft`를 내려주는 방식과 같다.

**기술:** Vercel 서버리스(Node ESM `.mjs`), React+Vite, vitest·Testing Library. 로컬 쪽은 Python(store.py)과 pytest.

**근거:** 보고서 `docs/2026-10-17-homepage-improvement-review.md` 2-2 8번 `[CV-05, GP-02]`. 다만 보고서 이후 바뀐 코드가 있어 아래 1절에서 다시 실측했다.

---

## 1. 현황 실측 (2026-10-21 코드 확인)

보고서(10-17)에는 "비자의 만료·임박을 텔레그램이 무시한다"고 적혀 있다. 그 뒤 10-18에 비자 접수 질문의 `deadlineFirst`가 생겨 이 부분은 이미 해결되었다. 남은 끊김은 아래와 같다.

| # | 끊긴 곳 | 근거(파일:줄) |
|---|---|---|
| A | 업무 페이지 하단 버튼의 `?priority=urgent`를 **아무도 읽지 않는다**. 게다가 기한이 없는 분야(인허가·출입국·토지보상)에도 붙는다. | `src/pages/ServicePage.tsx:53`, ConsultPage에 `priority` 읽기 없음 |
| B | 고객이 "기한이 급하다"고 **직접 말할 칸이 없다**. 진단을 거치지 않은 일반 분야 접수는 기한이 임박해도 긴급으로 잡히지 않는다. | `api/_validate.mjs` 접수 필드 |
| C | 긴급 판정식 `diagnosis.counts.urgent ∥ visaIntake.deadlineFirst`가 **네 곳에 복제**되어 있다. 하나를 고치면 나머지가 어긋난다. | `api/consult.js:131`, `api/_daily-summary.mjs:20`, `api/_reply-draft.mjs:306`, 로컬 `admin_appeal/connector/store.py:419` |
| D | 비자 사이트에서 넘어온 진단의 `visaDiagnosis.level === 'urgent'`는 **판정에 들어가지 않는다**. /admin 상세에만 글자로 보인다. | `AdminPage.tsx:375`, 위 네 곳 |
| E | /admin 목록 요약 줄에 긴급 표시가 없고 정렬도 접수 순이다. 그래서 하나씩 펼쳐 봐야 안다. | `AdminPage.tsx:320-325`, `:178` |
| F | 저장 실패 때 보내는 텔레그램 폴백 본문에는 긴급 줄이 없다. 이 알림이 유일한 기록인 상황에서 우선순위를 놓친다. | `api/_validate.mjs:131-148` |
| G | 상담 화면의 '기한이 임박했다면 기다리지 마세요'(110 안내) 카드가 페이지 맨 끝, 오시는 길 아래에 있다. | `ConsultPage.tsx:511` |

이미 되어 있는 것(바꾸지 않음): 비자 `deadlineFirst` 계산(`_visa-intake.mjs:133`), 긴급 건 24시간 지연 기준(계약 `staleRules.urgentDelayHours`), 회신 초안의 '기한 질문 먼저' 정렬, 로컬 대기함의 ⏰긴급 표시.

## 2. 설계

### 2-1. 판정 하나: `api/_urgency.mjs`
- `URGENT_REASONS = ['diagnosis', 'visaIntake', 'visaDiagnosis', 'selfReported']` (순서 고정, 표시 순서)
- `urgentReasons(record) → string[]`
  - `diagnosis`: `record.diagnosis?.counts?.urgent > 0` (서버가 다시 계산한 값이라 위조되지 않는다)
  - `visaIntake`: `record.visaIntake?.deadlineFirst === true`
  - `visaDiagnosis`: `record.visaDiagnosis?.level === 'urgent'` (등급은 서버 `_visa-handoff.mjs`가 매긴다. 분류 자체는 바꾸지 않는다)
  - `selfReported`: `record.deadlineReport`가 `'soon'` 또는 `'unknown'`
  - 파기된 레코드(`purged`)는 항상 `[]`
- `isUrgent(record) → boolean` = `urgentReasons(record).length > 0`
- 위 C의 세 곳(consult.js·_daily-summary·_reply-draft)을 이 함수로 바꾼다. 로컬은 6단계에서 바꾼다.

### 2-2. 고객 자가 응답 칸 `deadlineReport` (B)
- 상담 화면에서 분야를 고른 뒤, **출입국·비자가 아닐 때만** 보인다. 비자는 이미 접수 질문이 있다. 선택 항목이며 기본값은 없다.
- 질문: **"받으신 처분서·통지서에 적힌 기한이 있나요? (선택)"**
  - `soon` — 2주 안이거나 이미 지났습니다
  - `later` — 있지만 2주 넘게 남았습니다
  - `unknown` — 기한이 있는지, 언제인지 모릅니다
  - `none` — 받은 통지서가 없습니다
- 긴급으로 보는 값은 `soon`·`unknown`이다. '모름'을 긴급으로 보는 것은 음주운전 진단의 `unknown` 등급과 같은 기준이다(`src/data/checks/dui.ts:39`).
- 서버는 허용값이 아니면 버린다. 비자 분야로 들어온 값도 버린다. 접수는 막지 않는다.
- `?priority=urgent`로 들어와도 **답을 미리 골라 두지 않는다**. 고객이 고르지 않은 답을 만들지 않기 위해서다. 대신 110 안내 카드를 폼 위로 올리고, 이 질문을 바로 보여 준다(2-5).
- 개인정보처리방침은 고치지 않는다. 수집 항목이 "상담 신청 때 입력하신 항목 … 전체"(`privacyPolicy.ts:30`)로 적혀 있어 이 칸도 포함된다고 판단했다. 주인님 확인 질문 5번 참고.
  - **정정(2026-10-21 리뷰):** 이 판단은 틀렸다. `privacyPolicy.ts:30`은 국외 이전 표의 한 줄이다. 실제 수집 항목 목록(`PrivacyPage.tsx:47` 선택 항목, `:60` 파기 방법)은 항목을 하나하나 적고 있고, 기한 질문의 답은 빠져 있다. 아래 "구현 결과와 정정" 참고.

### 2-3. 알림과 아침 요약
- 평상시 텔레그램에는 근거를 두 종류로만 구분한다. 분야가 드러나지 않게 하려는 것이다(방침 `privacyPolicy.ts:48` "접수번호와 기한 긴급 표시만").
  - 답변 근거(diagnosis·visaIntake·visaDiagnosis): `⏰ 기한 우선 확인 — 고객 답변 기준`
  - 자가 응답(selfReported): `⏰ 기한 우선 확인 — 고객이 '급함·모름'을 직접 선택`
  - 둘 다 있으면 두 줄을 모두 쓴다. 기존 문구 '⏰ 기한 관련 긴급 확인 항목 포함'은 없앤다.
- 저장 실패 폴백(F)에도 같은 줄을 접수번호 바로 아래에 넣는다.
- 아침 요약은 판정만 공유 함수로 바꾼다. 문구는 그대로 둔다.

### 2-4. 회신 초안
- 판정을 공유 함수로 바꾼다.
- `selfReported`가 있는데 기한 질문(`deadline: true`)이 하나도 없으면, 맨 앞에 `처분서·통지서에 적힌 기한 날짜`(deadline: true)를 넣는다. 그러면 기존 규칙에 따라 `URGENT_LINE`이 붙는다.

### 2-5. 화면
- **ServicePage**: `service.deadlines`가 있을 때만 `&priority=urgent`를 붙인다(음주운전·영업정지·국가보훈). 버튼 문구는 그대로 둔다.
- **ConsultPage**: `priority=urgent`이면 110 안내 카드를 폼 위로 옮긴다. 아니면 지금 위치에 둔다. 카드 문구는 바꾸지 않는다.
- **/admin 목록(E)**
  - 요약 줄 맨 앞에 배지 `⏰ 기한 우선`을 단다. 배지의 title에는 근거 라벨(셀프 진단·비자 접수 답변·비자 사전진단·고객 직접 선택)을 넣는다.
  - 정렬: 미처리(new)이면서 긴급인 건을 맨 위에 두고, 나머지는 지금 순서를 유지한다.
  - 필터에 '기한 우선 (N)' 버튼을 더한다.
  - 상세에는 `deadlineReport` 답을 '고객 자가 응답(증빙 미확인)'으로 표시한다. 비자 접수 질문과 같은 표기다.
- 판정은 서버에서 한다. `/api/admin` 목록 응답의 각 항목에 `urgentReasons`를 붙인다. 화면에서 판정식을 다시 만들지 않기 위해서다.

### 2-6. 연동 계약과 로컬 (2단계, 다른 저장소)
- `api/_inquiry-contract.json`
  - `recordFields`·`localMustKeep`에 `deadlineReport`를 추가한다. 로컬이 새 고객 답을 버리지 않게 하려는 것이다(10-19 ①의 재발 방지).
  - `connectorGetExtras`에 `urgentReasons`를 추가한다.
  - 새 키 `urgentReasonLabels`와 `deadlineReportLabels`를 둔다.
- connector GET 항목마다 `urgentReasons`를 넣는다. 예전 로컬 연동기는 모르는 필드를 무시하므로 홈페이지를 먼저 배포해도 깨지지 않는다(replyDraft 때와 같음).
  - **정정(2026-10-21 리뷰):** 깨지지 않을 뿐 데이터는 잃는다. 로컬은 정해진 열만 `INSERT OR IGNORE`로 적재하고, 한 번 가져간 건은 다시 내려오지 않는다(`connector.js` GET은 `!pulledAt`만 보냄). 그래서 홈페이지 배포와 6단계 사이에 들어온 접수의 `deadlineReport`는 로컬에 영영 남지 않는다.
- 로컬 store.py
  - `deadline_report`·`urgent_reasons_json` 열을 추가한다.
  - `_is_urgent`는 `urgent_reasons_json`을 먼저 쓰고, 값이 없는 예전 건은 지금 식으로 판정한다.
  - 대기함 표시에 근거를 넣는다.
- ~~순서: 로컬은 커밋하는 즉시 운영에 반영되므로 **홈페이지 배포 뒤에** 커밋한다.~~ → **정정: 6단계(로컬 열 추가)를 홈페이지 배포 "전"에 한다.** 새 열은 비어 있어도 되므로(예전 홈페이지는 값을 안 보냄) 로컬을 먼저 바꿔도 운영이 깨지지 않는다. 그러면 데이터 공백이 생기지 않는다. 계약을 sync하면 로컬 계약 테스트(`test_connector_status_sync.py:112`)가 새 열이 생길 때까지 실패한다. 이것은 의도한 안전장치다.

### 2-7. 하지 않는 것
- 비자 사이트 쪽 등급 분류와 비자 `deadlineFirst` 규칙은 바꾸지 않는다. `stayStatus: 'unsure'`를 포함할지는 질문 2번에서 정한다.
- 기한 날짜 자체를 받지 않는다. 날짜는 회신에서 묻는다. 접수 단계에서는 최소한으로 수집한다.
- 텔레그램 즉시 재알림이나 기한 임박 독촉은 하지 않는다. 기한은 로컬 DB에만 있다(10-19 ③ 미결 항목).

## 3. 주인님 결정 질문 (추천안 먼저)

1. **자가 응답 칸의 기준 '2주'와 선택지 4개**: 추천은 위 2-2 그대로다. 이유는 의견제출·보완 기한이 보통 10~14일이어서다.
2. **비자 `stayStatus: 'unsure'`(체류 만료일 모름)도 긴급으로 볼지**: 추천은 **지금은 넣지 않음**이다. 회사 담당자 접수에서 '모름'이 흔해 긴급 표시가 묻힐 수 있다. 회신 초안이 이미 만료일을 묻고 있다.
3. **비자 사전진단 등급 'urgent'를 긴급 근거에 넣을지**: 추천은 **넣음**이다.
4. **/admin 정렬**: 추천은 '미처리 긴급 건 맨 위 + 기한 우선 필터'다. 대안은 배지만 다는 것이다.
5. **방침 개정 없이 진행**: 추천은 진행이다(2-2 마지막 줄의 판단). 개정한다면 시행일과 CONSENT_VERSION을 배포일로 함께 바꿔야 한다.

## 4. 작업 순서 (각 단계 TDD: 실패 테스트 → 구현 → 통과 → 커밋은 승인 뒤)

### 1단계 — 판정 함수와 서버 쪽 소비자
**파일:** 새 파일 `api/_urgency.mjs`·`api/_urgency.test.mjs`, 수정 `api/_validate.mjs`(sanitize·formatTelegramMessage), `api/consult.js:131`, `api/_daily-summary.mjs:18-21`, `api/_reply-draft.mjs:305-321`, `api/_store.mjs` buildInquiryRecord
**만드는 것:** `URGENT_REASONS`, `urgentReasons(record): string[]`, `isUrgent(record): boolean`, 레코드 필드 `deadlineReport?: 'soon'|'later'|'unknown'|'none'`, `formatTelegramMessage(value, { urgentReasons })`. `meta.urgent`를 이것으로 대체한다.
- [ ] 실패 테스트 `_urgency.test.mjs`
  - 근거 네 가지가 각각 하나씩 판정된다.
  - 여러 근거가 있으면 `URGENT_REASONS` 순서로 나온다.
  - `deadlineReport: 'later'|'none'`은 긴급이 아니다.
  - `purged: true`이면 `[]`이다.
  - 새 필드가 없는 예전 레코드는 지금 식과 같은 결과를 낸다(회귀 고정).
- [ ] 실패 테스트 `_validate.test.mjs`
  - `deadlineReport`가 허용값이 아니면 버린다.
  - 비자 분야에 붙어 온 값도 버린다.
  - 알림은 근거별로 두 가지 줄을 쓴다.
  - 폴백 본문에 긴급 줄이 들어간다.
  - 평상시 알림에 분야 문자열이 들어가지 않는다(6개 분야 전부 검사).
- [ ] 실패 테스트 `_daily-summary.test.mjs`·`_reply-draft.test.mjs`
  - selfReported 건이 긴급으로 집계된다.
  - selfReported인데 기한 질문이 없는 템플릿은 '처분서·통지서에 적힌 기한 날짜'가 첫 질문이 되고 URGENT_LINE이 붙는다.
- [ ] 구현 후 `npx vitest run api` 통과

### 2단계 — 연동 계약과 connector·admin API
**파일:** `api/_inquiry-contract.json`(`npm run contract:inquiry`로 생성), `api/connector.js:51`, `api/admin.js` 목록 응답, `src/lib/adminApi.ts`, `src/lib/inquiryContract.ts`
**만드는 것:** GET 항목의 `urgentReasons: string[]`, 계약 키 `urgentReasonLabels`·`deadlineReportLabels`
- [ ] 실패 테스트
  - `_connector.test.mjs`: GET 항목마다 `urgentReasons`가 있다.
  - `_admin.test.mjs`: 목록 항목에 `urgentReasons`가 있고, 파기된 건은 `[]`이다.
  - `inquiryContract.test.ts`: `deadlineReport`가 `localMustKeep`에 있고, 라벨이 `_urgency.mjs`·화면 데이터와 같다.
- [ ] 계약 재생성 → 통과. **로컬로 sync하지 않는다**(6단계에서 한다).

### 3단계 — 상담 화면과 업무 페이지
**파일:** `src/pages/ConsultPage.tsx`, `src/pages/ServicePage.tsx:53`, 라벨 데이터 `src/data/deadlineReport.ts`(새 파일, 계약과 sync 테스트), `src/lib/consultSubmit.ts`
- [ ] 실패 테스트 `consultPage.test.tsx`·`consultSubmitFlow.test.tsx`
  - 비자가 아닌 분야를 고르면 질문이 보이고, 비자 분야면 보이지 않는다.
  - 고르지 않으면 페이로드에 필드가 없다.
  - `priority=urgent`여도 미리 선택된 답이 없다.
  - `priority=urgent`이면 110 카드가 폼보다 앞에 있다(DOM 순서).
- [ ] 실패 테스트 `serviceNextStep.test.ts`(또는 serviceFlow 테스트): deadlines가 없는 업무(인허가·출입국·토지보상)의 하단 링크에는 `priority`가 없다.
- [ ] 접근성: 라디오 묶음에 fieldset·legend를 단다. `accessibility.test.tsx` 통과.
- [ ] `test:guard`(금지어)·`goLiveWording` 통과. 새 문구에 개업 전 표현이나 결과 보장 표현이 없어야 한다.

### 4단계 — /admin 목록
**파일:** `src/pages/AdminPage.tsx`(요약 줄 320-325, 필터 178·300-315), `src/test/adminPage.test.tsx`
- [ ] 실패 테스트
  - 긴급 건의 요약 줄에 '⏰ 기한 우선'이 보인다.
  - 미처리 긴급 건이 접수 순서와 상관없이 맨 위에 있다.
  - '기한 우선' 필터가 긴급 건만 보여 준다.
  - 파기된 건이 섞여도 오류가 없다.
  - 상세에 자가 응답이 '고객 자가 응답(증빙 미확인)'으로 보인다.
- [ ] 구현 → 통과

### 5단계 — 검증·문서
- [ ] `npm run check`(타입·전체 테스트·빌드·verify-dist). 테스트 수는 `.claude/worktrees` 사본을 빼고 센다(직전 기준 50파일 515, 10-19).
- [ ] 브라우저 실측(로컬 dev)
  - 음주운전 업무 페이지 하단 버튼 → 상담 화면에서 110 카드가 위에 있다.
  - 인허가 업무 페이지 버튼에는 priority가 없다.
  - 375px에서 가로 넘침이 없다.
  - /admin은 `scripts/dev-connector-server.mjs`의 메모리 저장소로 정렬·배지를 확인한다. (정정: 이 서버는 /api/connector만 띄워 /admin 실측은 할 수 없었다. 컴포넌트 테스트로만 확인)
- [ ] 리뷰 에이전트 1회(P0·P1 수정)
- [ ] checklist.md·memory.md 갱신 → 커밋 승인 → 배포 승인

### 6단계 — 로컬 행정심판 시스템 (홈페이지 배포 뒤, 별도 승인)
- [ ] `npm run sync:inquiry-contract` → 로컬 계약 테스트가 실패하는지 확인
- [ ] store.py: 열 2개 추가(마이그레이션), `_is_urgent`는 urgentReasons를 먼저 쓰고 없으면 예전 식, 대기함 표시에 근거 라벨
- [ ] pytest(계약·status_sync·inbox_ui) → 연동기 왕복 실측(`--db 임시경로` 필수)
- [ ] 로컬 커밋(즉시 운영) → 다음 30분 주기 실행 로그 확인

## 5. 리뷰에서 특히 볼 것
1. **예전 레코드 회귀**: `deadlineReport`가 없는 운영 접수 건의 판정이 지금과 같아야 한다. 1단계 회귀 테스트로 고정한다.
2. **위조**
   - `priority=urgent`나 조작한 `counts`만으로는 긴급이 되지 않는다.
   - 자가 응답은 '고객이 선택'으로만 표시하고, 증빙으로 확인한 것처럼 쓰지 않는다.
3. **분야 노출**: 평상시 텔레그램에 분야나 근거별 분야 단서가 들어가지 않아야 한다. 1단계 테스트로 막는다.
4. **파기 건**: 목록·요약·connector에서 `purged` 건이 긴급으로 집계되면 안 된다.
5. **배포 순서**: 홈페이지 배포 전에 계약을 로컬로 sync하면 로컬 계약 테스트가 깨진다. sync는 반드시 6단계에서 한다. (정정: 6단계 자체를 홈페이지 배포 전에 한다 — 2-6 정정 참고)

## 6. 작업량
- 홈페이지 1~5단계: M(테스트 약 25~30개 추가 예상)
- 로컬 6단계: S~M

## 7. 구현 결과와 정정 (2026-10-21)

**구현(1~5단계, 미커밋):** 판정 함수 `api/_urgency.mjs`, 서버 소비자 5곳(접수 알림·아침 요약·회신 초안·connector GET·/api/admin GET/PATCH/DELETE 응답), `deadlineReport` 검증·저장(SCHEMA_VERSION 6→7), 연동 계약 재생성(로컬 sync 안 함), 상담 화면 기한 질문·110 카드 위치, 업무 페이지 priority 조건, /admin 배지·정렬·필터·자가 응답 표시.

**검증:** 타입 검사, 전체 51파일 556테스트(.claude 제외, 이전 50파일 515 → +1파일 +41), 빌드, verify-dist(18경로) 통과. dist 미리보기에서 dui 하단 버튼만 `priority=urgent`, 인허가는 없음, 상담 화면 110 카드가 폼 위, 기한 질문 표시(개업 전이라 비활성), 375px 가로 넘침 없음.

**구현 중 판단:**
- 커밋은 단계마다 하지 않았다(주인님 지시: 커밋·배포는 다시 묻기).
- 상담 화면 동의 문구가 수집 항목을 하나하나 적고 있어 "기한 질문의 답(답한 경우)"을 넣었다. 동의 문구에 없는 항목을 받으면 동의가 부정확해지기 때문이다.
- /api/admin은 GET뿐 아니라 PATCH·DELETE 응답에도 `urgentReasons`를 붙였다. 그러지 않으면 상태를 바꾸는 순간 배지가 사라진다.
- 회신 초안에서 자가 응답만 있고 기한 질문이 없는 분야(인허가·토지보상 등)는 "처분서·통지서에 적힌 기한 날짜"를 첫 질문으로 넣는다.
- 개발 서버(`npm run dev`)는 `/api` 경로를 프록시해서, 화면 번들이 가져오는 `api/_reply-draft.mjs`를 불러오지 못한다(이번 변경 전부터 있던 import). 그래서 화면 확인은 dist 미리보기로 했다.

**리뷰(새 에이전트 1회) — 중요 2건, 주인님 결정 필요:**
1. 로컬 데이터 공백 → 2-6 정정대로 6단계를 홈페이지 배포 전에 하는 순서로 바꾸자고 제안한다.
2. 방침 수집 항목에 기한 질문의 답이 없다(`PrivacyPage.tsx:47` 선택 항목, `:60` 파기 방법). 동의 문구(새로 넣음)와 방침이 어긋난다. 고치려면 방침 두 곳에 한 구절씩 넣고, 배포일로 시행일·`CONSENT_VERSION`·변경 이력을 함께 바꾼다. 3절 질문 5의 추천은 잘못된 근거에서 나왔으므로 다시 여쭌다.

**리뷰 사소한 지적(미반영, 기록만):**
- /admin에서 펼친 긴급 건의 상태를 바꾸면 곧바로 재정렬되어 위치가 튄다.
- '기한 우선 (N)'은 완료·보류 건도 센다(아침 요약은 신규만 센다).
- 배지 근거가 title 툴팁에만 있다(터치·화면낭독기에서 잘 안 보임).
- 기한 답을 한 번 고르면 '답 안 함'으로 되돌릴 수 없다.
- 비자 외 분야끼리 바꾸면 앞서 고른 기한 답이 유지된다.
- 자가 응답 줄은 '비자 아님'을 간접적으로 드러낸다(분야 문자열은 없음).

## 8. 리뷰 반영 — 방침 보완과 6단계 선행 (2026-10-21, 주인님: "방침 두 곳에 기한 질문의 답을 넣고, 6단계를 홈페이지 배포 전에 하는 순서로 진행해. 시행일·CONSENT_VERSION은 배포일에 맞추고, 커밋·배포는 다시 물어봐")

**방침:** `PrivacyPage.tsx`의 선택 항목에 "처분서·통지서 기한 질문의 답(출입국·비자 외 분야에서 답하신 경우에 한함)"을 넣고, 파기 방법에 "기한 질문의 답"을 넣었다. 시행일과 `CONSENT_VERSION`은 임시로 2026-10-21이다. 변경 이력에는 이전 방침 2026-10-19를 남겼다. **배포일이 10-21이 아니면 배포 당일 두 값을 배포일로 바꾼다.** 테스트 2개를 추가했다(수집 항목·파기 방법 문구, 이전 시행일 이력).

**6단계(로컬):** worktree `D:\행정사\wt-deadline-signal`(브랜치 feat/deadline-signal)에서 했다. 예약 작업이 메인 폴더 코드를 30분마다 실행하기 때문이다.
- 열 `deadline_report`·`urgent_reasons_json`을 추가하고, 파기 대상에도 넣었다.
- 판정은 urgentReasons를 먼저 쓴다. 값이 없는 예전 건만 로컬 필드로 판정한다(비자 사전진단 urgent 포함).
- 대기함 제목에 근거를, 펼친 화면에 자가 응답을 표시한다.
- 로컬 테스트: worktree 471 통과·18 실패. 18건은 무시 파일인 hwpx 원본이 없어서 16건, 날짜 의존 2건이다. 원본을 연결하면 487 통과·2 실패(날짜 의존 2건만 남음).
- 왕복 실측(`scripts/dev-connector-server.mjs`에 기한 자가 응답 시험 접수 1건 추가): 4건 적재·ACK, 근거·자가 응답 보관, 24시간 기준 적용.

**검사(홈페이지):** 타입 검사, 51파일 558테스트, 빌드, verify-dist 통과. 사전 렌더링 `/privacy`에 새 문구와 시행일이 들어감.

**배포 순서(승인 뒤):**
1. 로컬 feat/deadline-signal을 master에 병합·커밋(즉시 운영). 다음 30분 실행이 오류 없이 끝나는지 확인
2. 홈페이지 커밋·푸시(Vercel 운영 배포). 배포일이 10-21이 아니면 먼저 시행일·CONSENT_VERSION을 바꾼다
3. 배포 뒤 확인: `/privacy` 시행일, 상담 화면 기한 질문(개업 전이라 비활성), connector GET이 urgentReasons를 붙이는지(다음 연동 실행 로그)
