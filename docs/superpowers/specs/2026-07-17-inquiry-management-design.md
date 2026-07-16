# 접수 데이터 축적·체계적 응답 시스템 설계

- 작성일: 2026-07-17
- 배경: 기존 접수 흐름은 폼 → 텔레그램 알림뿐 — 저장·상태 관리·응답 체계 없음(텔레그램 수신함이 유일한 기록). 접수 데이터를 쌓고 응답을 체계화하는 시스템 요청.

## 구조

```
방문자 폼 제출
  → POST /api/consult (검증·허니팟·CORS — 기존 유지)
  → 접수번호 발급 (JM-YYYYMMDD-XXXX, KST 날짜 + 혼동문자 제외 4자)
  → Upstash Redis에 접수 레코드 저장 (inquiry:<id> + inquiry:index 정렬 인덱스)
  → 텔레그램 알림 (접수번호 포함, 저장 실패 시 경고 줄)
  → 방문자에게 접수번호 표시

사무소 관리자
  → /admin 페이지 (ADMIN_TOKEN 입력, sessionStorage 보관)
  → GET /api/admin: 접수 목록(최신순) + 통계(상태별·분야별·월별)
  → PATCH: 상태 변경(신규→진행 중→완료/보류)·처리 메모 추가
  → 회신문 생성: 분야별 템플릿(확인 질문 포함)에 이름·접수번호 자동 채움 → 복사해 회신
  → DELETE: 개인정보 파기 (분야·접수일·상태 등 통계 필드만 보존)
```

## 결정 사항

1. **저장소: Upstash Redis (Vercel Marketplace)** — REST API라 의존성 0개(fetch만 사용), 비공개 저장, Vercel 통합 시 환경변수 자동 주입. `KV_REST_API_*`·`UPSTASH_REDIS_REST_*` 두 이름 모두 지원.
2. **fail-open**: 저장소 미설정·장애 시에도 텔레그램 알림은 발송 (알림·저장 둘 다 실패할 때만 접수 실패 응답). 저장 실패는 알림에 "⚠ 접수 저장 실패" 줄로 표시.
3. **접수번호를 고객·알림·관리 화면에 공통 사용** — 전화 회신 시 상호 참조 가능.
4. **방문자 자동 응답(챗봇) 없음** — 2026-07-11 결정 유지. AI·템플릿은 관리자 보좌 전용, 고객 회신은 항상 사람이 한다.
5. **관리자 인증**: `ADMIN_TOKEN` 환경변수 + Bearer 헤더, sha256 해시 후 상수 시간 비교. 관리 페이지는 공개 빌드에 포함되지만 데이터는 토큰 없이 접근 불가.
6. **개인정보 파기 체계**: 파기 시 성함·연락처·상담 내용·메모 삭제, 통계 필드(접수번호·접수일·분야·상태·메모 건수)만 보존 — "회신 후 파기" 약속과 데이터 축적(통계)을 양립.
7. **답변 템플릿**: 6개 분야별 첫 회신문 + 사안 파악 확인 질문(3~5개). 결과 예단·보증 표현 금지 원칙 준수(금지 표현 테스트가 src/data·src/pages 자동 검사).

## 파일

- `api/_store.mjs` — 접수 레코드 생성·패치·파기 순수 함수 + Upstash REST 저장소 (`_store.test.mjs`)
- `api/_cors.mjs` — 공용 CORS (consult·admin 공유)
- `api/consult.js` — 저장 연동·접수번호 발급 (기존 검증·허니팟 유지)
- `api/admin.js` — 관리자 API: 인증·목록·상태/메모·파기 (`admin.test.mjs`)
- `api/_validate.mjs` — 텔레그램 메시지에 접수번호·저장 실패 경고 추가
- `src/lib/consultSubmit.ts` — 응답에서 접수번호 수신
- `src/pages/ConsultPage.tsx` — 성공 안내에 접수번호 표시
- `src/lib/adminApi.ts` — 관리 API 클라이언트 + 통계 집계
- `src/data/replyTemplates.ts` — 분야별 회신 템플릿·확인 질문
- `src/pages/AdminPage.tsx` — 접수 관리 화면 (`src/test/adminPage.test.tsx`)
- `src/pages/PrivacyPage.tsx` — 보관·위탁(Upstash)·파기 고지 갱신

## 배포 시 필요한 설정 (Vercel)

1. Vercel 대시보드 → Storage → **Upstash Redis 생성 후 프로젝트 연결** (환경변수 자동 주입)
2. 환경변수 **`ADMIN_TOKEN`** 추가 (길고 무작위한 문자열)
3. 재배포 (`vercel deploy --prod`)
4. `/admin` 접속 → 토큰 입력으로 확인

설정 전에도 기존 텔레그램 알림 흐름은 그대로 동작한다.

## 범위 제외

- 방문자 대상 자동 응답 챗봇, 이메일/SMS 발송, 다중 관리자 계정·권한, 첨부파일 접수
