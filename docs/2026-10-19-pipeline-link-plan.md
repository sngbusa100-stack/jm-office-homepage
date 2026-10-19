# 접수 이후 고리 잇기 계획 (①+②) — 2026-10-19

방향 문서 `docs/2026-10-19-function-direction.md`의 ①·②를 구현하는 계획이다.

- 주인님 결정(2026-10-19): 로컬 '종결'은 홈페이지 '처리 완료'로 본다.
- 미처리 건 기준은 아래 4절의 제안을 승인받아 확정한다.

## 1. 목표

1. 홈페이지 접수의 모든 항목이 로컬 대기함에 남는다. 그래야 수임 뒤 클라우드를 파기해도 잃는 것이 없다.
2. 로컬에서 한 처리(종결·사건 전환·수임 확인)가 30분 안에 홈페이지 접수함 상태로 돌아간다. 120일 파기는 사람이 `/admin`을 다시 누르지 않아도 시작된다.
3. 방치된 문의는 정해진 기준에 따라 표시되고, 결국 자동으로 종결된다.
4. 두 저장소가 서로 다른 필드를 쓰게 되면 테스트가 바로 실패한다(연동 계약).

## 2. 현재 상태 (코드 확인, 2026-10-19)

- **홈페이지 `api/connector.js`**: GET(미수집 목록), PATCH(ACK = `pulledAt`·`localCaseId` 기록), DELETE(파기)만 있다. 접수 상태를 바꾸는 경로가 없다.
- **홈페이지 `api/_store.mjs:150`**: 자동 파기는 `status === 'done'`에서만 시작한다.
- **로컬 `admin_appeal/connector/store.py`**
  - 대기함 저장 항목은 이름·연락처·이메일·분야·내용·진단·유입 경로 일부(`utm_source`·`source_path`)뿐이다.
  - 상태는 `imported`·`case_created`·`dismissed` 세 가지이고, 상태 칸에 CHECK 제약이 걸려 있다.
- **로컬 `admin_appeal/ui_admin.py:244`**: '문의 종결' 버튼은 로컬 상태만 바꾼다. 사건 전환 뒤 수임이 되지 않은 건은 닫을 방법이 없다.
- **로컬 `pull_inquiries.py`**: 30분마다 실행되고 결과는 정상이다(작업 `JM_Homepage_Pull`, 2026-10-19 13:45 결과 0).

## 3. 설계

### 3-1. 홈페이지(연동 API) — 하위 호환을 유지하며 먼저 배포

- `api/_store.mjs`에 순수 함수 `applyConnectorStatus(record, { status, pipelineStage }, now)`를 추가한다.
  - 연동 토큰이 바꿀 수 있는 값을 제한한다.
    - status: `in_progress`·`done`
    - pipelineStage: `qualified`(사건 전환)·`retained`(수임)
  - `done`으로 처음 바뀔 때만 `doneAt`을 기록한다. 기존 `applyInquiryPatch` 규칙과 같다.
  - 같은 값이 다시 와도 결과가 같다(멱등).
  - 파기된 레코드에는 409를 돌려준다.
  - 이 경로로는 메모·연락처를 바꿀 수 없다.
  - 처리 시각을 남긴다: `localStatus`·`localStatusAt`·`localCloseReason`.
- `api/connector.js` PATCH가 `body.action`으로 갈린다.
  - `action`이 없거나 `'ack'`이면 지금과 같은 ACK. 지금의 로컬 연동기가 그대로 동작한다.
  - `'status'`이면 위 함수를 쓴다.
- `/admin` 목록에 로컬 처리 상태를 한 줄 표시한다. 예: "로컬: 종결(자동·90일) 2026-…".
- **연동 계약 파일** `api/_inquiry-contract.json`을 둔다.
  - 담는 것: SCHEMA_VERSION 6 레코드의 필드 목록과 "로컬에 반드시 보관할 필드", 연동 API가 받는 status·pipelineStage 값, 비자 접수 질문의 선택지 값과 한국어 라벨.
  - 홈페이지 테스트가 `buildInquiryRecord`·`VISA_INTAKE_VALUES`·`visaIntake.ts` 라벨과 이 파일이 같은지 확인한다.
  - `scripts/sync-inquiry-contract.mjs`로 로컬 저장소 `tests/fixtures/`에 복사한다. 기존 `sync-visa-handoff-contract.mjs`와 같은 방식이다.

### 3-2. 로컬(행정심판) — 홈페이지 배포 뒤 적용

- **대기함 열 추가** (`_OPTIONAL_COLUMNS`에 넣어 기존 DB에 멱등 추가)
  - 비자·동의: `visa_intake_json`, `visa_diagnosis_json`, `attribution_json`, `consent_json`, `schema_version`
  - 종결: `closed_at`, `close_reason`(`manual`·`not_engaged`·`auto_stale`)
  - 상태 동기화: `remote_status`, `remote_status_synced_at`, `remote_status_error`
  - 상태 칸의 CHECK 제약은 SQLite에서 고치려면 표를 다시 만들어야 한다. 그래서 상태 값은 늘리지 않고 `closed_at`으로 종결을 표시한다.
- **`import_inquiry`**: 위 JSON 열을 함께 저장한다.
- **`format_visa_intake()`**: 계약 파일의 라벨로 비자 답변을 한국어 문장으로 풀어 대기함 화면에 보여 준다. 기한 우선(`deadlineFirst`)이면 제목에 ⏰를 붙인다.
- **로컬 처리 → 원격 목표 상태**는 순수 함수 `desired_remote_state(row)` 하나로 정한다.

  | 로컬 상태 | 홈페이지 상태 |
  |---|---|
  | 종결(`dismissed` 또는 `closed_at`) | `done` |
  | 사건 전환(`case_created`) | `in_progress` + `qualified` |
  | 수임 확인(`engagement_confirmed_at`) | `in_progress` + `retained` |
  | 그대로 대기(`imported`) | 보내지 않음 |

- **동기화 단계**: `sync()`가 매 실행마다 다음을 한다.
  1. 수집·ACK
  2. 자동 종결 점검(4절)
  3. 목표 상태가 마지막으로 보낸 값과 다른 건만 `PATCH action=status`로 보낸다.

  실패는 건별로 기록하고 다음 실행에서 다시 시도한다.
- **수임 건 파기 순서**
  1. 목표 상태(`done`+`retained`)를 먼저 보낸다.
  2. 그 뒤 DELETE한다.

  이렇게 해야 파기 뒤 남는 통계(최종 상태·진행 단계)가 실제와 맞는다. 지금은 '신규'로 남는다.
- **화면** (`ui_admin.py`)
  - 사건 전환 목록에 '수임 안 됨 — 종결' 버튼을 추가한다(`not_engaged`).
  - 대기함 제목에 경과일과 4절의 지연 표시를 붙인다.

## 4. 미처리 건 기준 (제안 — 승인 필요)

| 구분 | 기준 | 처리 |
|---|---|---|
| 첫 연락 목표 | 접수 후 1영업일. 기한 우선·긴급 건은 당일 | 기준만 정함(알림은 ③ 일일 점검에서) |
| 지연 표시 | 대기함에서 72시간 경과. 기한 우선·긴급은 24시간 | 대기함 제목에 '지연' 표시 |
| 장기 미처리 | 30일 경과 | 화면 맨 위에 "종결 또는 사건 전환 필요" 경고 |
| 자동 종결 | 접수 후 90일 동안 처리가 없을 때. 사건 전환·수임 확인 건은 제외 | 로컬 `closed_at`(`auto_stale`) → 홈페이지 `done` → 120일 뒤 파기 |
| 수집 이상 | 홈페이지에 접수됐는데 2시간 넘게 로컬로 오지 않을 때 | ③ 일일 점검 알림의 점검 항목으로 넘김 |

**왜 이렇게 정하나**
- 행정심판 청구 기한이 90일이다. 그 기간 동안 연락이 닿지 않은 문의는 사실상 끝난 것으로 본다.
- 이 기준이면 한 번도 처리되지 않은 문의도 접수 후 최대 약 210일(90+120) 안에 파기된다.
- 지금은 '완료'를 누르지 않으면 영원히 남는다.

**방침 문구 추가**(보유 기간 절):
> 처리되지 않은 상담 문의는 접수 후 90일이 지나면 종결로 보고, 그때부터 120일 뒤 파기합니다.

## 5. 작업 순서와 검증

1. **홈페이지**: 테스트 먼저(RED) → `applyConnectorStatus`, connector 분기, 계약 파일·동기화 스크립트, `/admin` 표시, 방침 문구 → 전체 검사 → 커밋 → **배포 승인 요청**.
   - 이 배포에는 그동안 쌓인 커밋 3개도 함께 나간다. 그래서 배포 당일 시행일·CONSENT_VERSION을 배포일로 바꾸고, 검색 재수집 3가지를 함께 한다.
2. **로컬**: 테스트 먼저(`tests/test_connector.py`에 열 저장·목표 상태·자동 종결·재시도·계약 대조) → 구현 → 기존 18개를 포함한 연동 테스트 전체 실행.
3. **왕복 실측**
   - 운영 접수는 닫혀 있다(`CONSULT_OPEN=false`). 그래서 로컬 `vercel dev` 또는 테스트 서버에 시험 접수 1건을 넣는다.
   - pull → 종결 → 홈페이지 `done`·`doneAt` 확인 → 파기 경로를 끝까지 따라간다.
4. **문서**: 두 저장소의 checklist·memory와 통합 마스터플랜 2절을 갱신한다.

## 6. 범위 밖

- Telegram 일일 점검 알림(③)
- 회신 초안 자동 작성(④)
- 분야별 처리 경로(⑤)
- 로컬 저장소의 기존 미커밋 파일(마스터플랜 수정, `tests/_*.py` PoC 4개). 손대지 않고 커밋하지 않는다.
