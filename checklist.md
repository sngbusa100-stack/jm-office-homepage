# 정명 행정사사무소 홈페이지 재구축 체크리스트

설계: `docs/superpowers/specs/2026-07-09-office-homepage-redesign-design.md` (승인됨)
계획: `docs/superpowers/plans/2026-07-09-office-homepage-redesign.md`

## 1. 분석과 설계

- [x] 기존 루트 홈페이지·비자진단 프로젝트 분석
- [x] 개업 상태·구축 방식·수임 채널·진단 범위·언어 결정
- [x] 설계 4개 섹션(구조·진단 흐름·콘텐츠 원칙·기술 검증) 승인
- [x] 설계 문서 작성·자체 검토·사용자 승인

## 2. 구현 계획

- [x] writing-plans 절차로 11개 Task 상세 계획 작성
- [x] 계획 자체 검토(스펙 커버리지·플레이스홀더·타입 일관성)
- [ ] 실행 방식(서브에이전트/인라인) 선택

## 3. 구현

- [x] Task 1: 프로젝트 스캐폴딩과 기존 파일 legacy 보존
- [x] Task 2: 디자인 토큰·전역 스타일·공통 컴포넌트
- [x] Task 3: 사무소 정보 단일 출처(office)와 빌드 안전장치
- [x] Task 4: 진단 타입·질문 데이터 3종(음주운전·영업정지·국가유공자)
- [x] Task 5: 진단 4단계 분류 로직
- [x] Task 6: 콘텐츠 데이터(업무분야 6종·행정사 필요성·FAQ)와 금지 표현 검사
- [x] Task 7: 라우팅과 홈 페이지
- [x] Task 8: 행정사 필요성 페이지·업무분야 상세 페이지
- [x] Task 9: 셀프 진단 흐름(선택→질문→결과→상담 연결)
- [x] Task 10: 상담 페이지와 고지 페이지
- [x] Task 11: 접근성·배포 설정·최종 검증

## 4. 리뷰와 마무리

- [x] 리뷰 에이전트 호출·지적 사항 반영 (Task별 리뷰 + 최종 전체 리뷰 READY 판정, Critical·Important 0건)
- [x] `npm run check` 전체 통과, 브라우저 수동 검증
- [x] memory.md 최종 경과 기록, 사용자 보고
- [ ] 커밋·푸시는 사용자 지시 시에만

## 5. 2026-07-12 홈페이지 보완·발전 계획 (완료)

### 진단 기준

- [x] 기존 코드·콘텐츠·라우팅·상담 접수 구조 확인
- [x] `npm run check` 실행: 타입 검사, 테스트 68개, 빌드, 배포 산출물 검증 모두 통과
- [x] 데스크톱·모바일 실제 브라우저 화면 확인
- [x] 공개 Vercel 경로와 검색엔진용 파일 응답 확인
- [x] 핵심 법정 기한 문구를 국가법령정보센터 기준으로 대조

### 승인 후 구현 범위

- [x] 1. 모바일 첫 화면 좌우 여백 누락과 버튼 배치 보완
- [x] 2. 금색 버튼·작은 금색 문구의 명암 대비를 WCAG AA 수준으로 개선하고 전역 키보드 포커스 표시 강화
- [x] 3. `/services` 업무분야 모음 페이지를 추가하고 상단 `업무분야` 메뉴가 특정 업무가 아닌 전체 목록으로 이동하도록 개선
- [x] 4. 현재 연결 대상이 없는 `/visa/` 링크를 안전한 준비중 안내로 교체해 깨진 이동 제거
- [x] 5. `robots.txt`, `sitemap.xml`, canonical, Open Graph 기본 정보와 경로별 제목·설명을 추가해 검색 노출 기반 보완
- [x] 6. `기한이 지나면 다툴 수 없습니다` 같은 단정적 문구를 공식 법령에 맞게 `원칙적으로 제한될 수 있습니다` 취지로 정정
- [x] 7. 페이지 간격·카드·FAQ·CTA 시각 위계를 다듬되, 존재하지 않는 경력·후기·연락처는 만들지 않음
- [x] 8. 변경 사항에 대한 단위 테스트·링크/메타데이터 검증 추가
- [x] 9. `npm run check` 및 데스크톱·모바일 브라우저 회귀 검증
- [x] 10. 별도 리뷰 에이전트 검토 후 지적 사항 반영·재검증
- [x] 11. memory.md에 작업 경과·검증 결과 기록
- [x] 12. 커밋·푸시는 별도 지시 전까지 하지 않음

### 별도 정보가 있어야 가능한 후속 개선

- [ ] 개업 상태 전환과 실제 대표자·등록번호·주소·전화·카카오톡 정보 게시
- [ ] 비자 진단센터 실제 공개 URL 연결
- [ ] 실제 사무소 사진·대표자 소개·검증 가능한 경력/전문분야·상담 가능 시간 게시
- [ ] 맞춤 도메인 확정 후 canonical·sitemap 주소 교체

## 2026-07-19 통합 마스터플랜 (연동 최우선 — 주인님 승인)

기준 문서: `D:\행정사\1-행정심판\docs\2026-07-19-통합-마스터플랜.md`

- [x] GPT 교차검증 반영 1차 보완 8건 배포 (`3cffcb1`) — 개업 게이트·요청 제한·트랜잭션 저장·120일 스윕·X-Robots-Tag·테스트 함수 제거
- [x] D1: `api/connector.js` — pull/ACK/파기 API + 이메일 선택 필드 (2026-07-19 배포)
- [x] D4(메인 측): /consult?topic= 프리셀렉트 — 비자 사이트 링크 연동 관문 (잔여: 비자 사이트 CTA·최초 배포·링크 교체)
- [x] 3차 보안 보완 (주인님 승인): cron 일일 파기, 안전한 멱등성 키, 저장 read-back·인덱스 복구, done→done doneAt 유지, /admin(/.*) 헤더, 세션 정리, consult/admin/cron 핸들러 테스트
  - [x] Claude 중단 지점·미커밋 파일·원격 기준선 복구
  - [x] 실패 기준 확인: `ConsultPayload.submissionId` 타입 누락, 진단 정의 런타임 로딩 오류, 선점 후 저장 실패 시 허위 성공 가능성
  - [x] 실패 테스트와 타입부터 보완
  - [x] 전체 테스트 36파일 257개·빌드·배포 산출물 검증
  - [x] 독립 리뷰 에이전트 3회 지적 반영(P0/P1 없음, 배포 가능)
  - [x] 커밋 `e0131c6`·push·Vercel 운영 검증(Ready, consult 503, cron 무인증 401, admin 하위 noindex)
- [x] D4(메인 잔여): 비자 준비중 안내를 운영 비자 진단센터 URL로 교체

## 2026-07-25 유입→조회→진단→상담 전환 퍼널 고도화 (계획 승인·구현 중)

기준 문서: `docs/superpowers/plans/2026-07-25-inflow-view-diagnosis-consultation-funnel.md`

- [x] 기존 메인 업무분야 6개·진단 3종·중앙 상담 흐름 대조
- [x] 비자 상세 6개·진단 6종·중앙 상담 링크 대조
- [x] 고객 흐름을 `유입 → 설명/조회 → 진단 → 상담 → 수임 → 업무처리`로 재정의
- [x] 공통 랜딩 템플릿·CTA·전환 이벤트·비자 안전 전달·SEO 단계 계획 작성
- [x] 주인님 계획 승인
- [x] Phase 0: URL·분야코드·이벤트·개인정보 제외 기준 확정
- [x] Phase 1: 메인 설명·조회 랜딩 고도화
- [x] Phase 2: 전환 이벤트·관리자 퍼널 통계
- [x] Phase 3: 비자 설명·조회 랜딩 고도화
- [x] Phase 4: 비자 진단→중앙 상담 직접 전달
- [x] Phase 5: SEO·사전 렌더링
- [x] Phase 6: 4개 대표 시나리오 전체 리허설·리뷰
  - [x] 음주운전·영업정지·E-7·F-6 대표 흐름 확인
  - [x] 비자 handoff POST 일회 소비·no-store·로딩 중 제출 차단
  - [x] URL 변경 시 이전 비자 진단 제거·비자 분야 서버 강제
  - [x] 개인정보 없는 source 버킷 집계·사이트 간 원 유입 연속성
  - [x] 저장소별 독립 비자 계약·동기화 스크립트
  - [x] 메인 42파일 289테스트·비자 28파일 177테스트·빌드·산출물 검증
  - [x] 독립 리뷰 3회 지적 반영 후 최종 P0/P1 없음
  - [x] 계획서·checklist·memory 최종 기록
- [x] 커밋 `7fe3f4d`·push·Vercel Production 배포 및 운영 URL 최종 검증

## 2026-07-26 운영 배포

- [x] 주인님 커밋·푸시·배포 승인
- [x] 기능 고도화 커밋 `7fe3f4d`를 `master`에 push
- [x] Vercel Production `Ready` 및 공식 별칭 연결 확인
- [x] 운영 `robots.txt`·`sitemap.xml`·출입국 설명 페이지 응답 확인
- [x] `/admin`의 `X-Robots-Tag: noindex, nofollow` 확인
- [x] 개업 전 `CONSULT_OPEN=false`에 따른 상담 API 503 유지 확인

## 2026-08-08 업무분야 설명 → 진단 동선 재정렬 Phase 1 (구조)

기준 문서: `docs/superpowers/specs/2026-08-07-service-to-diagnosis-flow-design.md`
계획 문서: `docs/superpowers/plans/2026-08-07-service-to-diagnosis-flow-phase1.md`
구현 codex-cli 0.146.0, 계획 대조·검증 Claude.

- [x] Task 1: 인허가 진단(permit) 신설 — 주인님 검수 반영해 10문항 → 12문항 구체화
  - [x] 유형 5종(법인설립·공장·창고물류·영업·미정), 각 유형에 근거 조문 부착
  - [x] 선택지를 '확인했다/안했다'에서 실제 행동 단위로 (대조했다/보기만 했다/모른다)
  - [x] 업종별 조문 원문 확인 (민법 32, 산집법 13·16, 물류시설법 21의2, 식품위생법 37·38·41+시행규칙 36 별표14, 학원법 6)
  - [x] 학원 시설기준은 시행령 별표가 아니라 시·도 조례임을 확인해 문구 정정
- [x] Task 2: license ↔ permit 연결 + 진단 공백 방지 커버리지 테스트
- [x] Task 3: 4단계 진행 표시 컴포넌트 (비자 사이트 flowSteps와 문구 고정)
- [x] Task 4: 분야 상세에 스텝 배치 + 확인 목록 앵커 (#preparation-review)
- [x] Task 5: 홈 섹션 순서 교체 (업무 분야 → 셀프 진단), '대표 3개 분야' 표기 해소
- [x] Task 6: 상단 메뉴 4개 → 2개 + 상시 상담 버튼
- [x] `npm run check` 전량 통과 (typecheck·테스트·빌드·verify:dist)
- [x] 브라우저 실측: 6개 화면 + 모바일 375px (가로 오버플로 없음, 메뉴 열림, CTA 전폭)
- [ ] 커밋·푸시·배포 승인 대기 — master push는 Vercel Production 자동 배포

### 검증 중 잡아낸 결함 4건

1. `b0c460f`가 불완전 커밋 — 12문항 개편 후 재생성한 `api/_check-levels.mjs` 스테이징 누락. `b9f0237`로 보완.
2. 계획서의 확인 목록 버튼 테스트가 `getByRole` 단일 조회 — `ServiceActions`가 상단·하단 2회 렌더되어 실패. `getAllByRole`(length 2)로 교정.
3. 계획서의 `.navbar__cta` 선택자가 `nav#global-nav a`보다 명시도가 낮아 글자색이 덮여 대비 1.13:1. `nav#global-nav .navbar__cta`로 구체화, 실측 5.67:1 확인.
4. `ServiceFlowSteps`가 `attribution ?? {}`를 넘겨 `readAttribution()` 세션 폴백 유실. `95f9e15`로 보완.

### 별도 확인 필요 (이번 범위 밖)

- `npm run test:run`이 gitignored `.claude/worktrees/admin-inquiry-system-e8017d/`의 낡은 사본 15파일을 중복 수집한다. 실제 저장소는 29파일 213테스트, 중복 포함 시 44파일 309테스트로 부풀려진다. `vite.config.ts`의 `test.exclude` 설정 필요.

## 2026-08-09 업무분야 동선 재정렬 Phase 2 (디자인·가독성)

계획 문서: `docs/superpowers/plans/2026-08-09-service-to-diagnosis-flow-phase2.md`
구현 codex-cli 0.146.0, 계획 대조·브라우저 실측·보완 Claude.

- [x] Task 1: 타이포 토큰 5단계 신설, 하드코딩 폰트 크기 31곳 치환, 본문 17px/1.75
- [x] Task 2: 분야 상세 본문 읽기 폭 1072px → 780px (텍스트 요소만, 그리드는 전체 폭)
- [x] Task 3: 섹션 3단 위계 — 기한 상단 강조 / 실행 24.8px / 참고 19px·접힘
- [x] Task 4: 태블릿 브레이크포인트 1024px 추가 (3열 → 2열 → 1열)
- [x] Task 5: 상단 CTA 2개 → 1개 (페이지당 같은 버튼 4개 → 3개)
- [x] Task 6: 모바일 분야별 문맥 CTA 바 + serviceNextStep.ts 공용 함수 추출
- [x] `npm run check` 전량 통과 (typecheck·30파일 224테스트·빌드·verify:dist)
- [x] 브라우저 실측 — 1400/1280/900/500/375px
- [ ] 커밋·푸시·배포 승인 대기 — master push는 Vercel Production 자동 배포

### 실측값 (2026-08-09)

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 본문 크기 / 줄간격 | 16px / 1.65 | 17px / 1.75 |
| 본문 문단 폭 | 1072px | 780px |
| 줄당 글자 수 | 약 80자 | 53~56자 |
| 하드코딩 폰트 크기 | 31곳 | 0곳 |
| grid-3 열 수 | 3 → 1 (768px) | 3 → 2 (1024px) → 1 (768px) |
| 분야 상세 같은 버튼 수 | 4개 | 3개 |
| 접힘 참고 섹션 | 0개 | 1개 (공식 출처) |
| 테스트 | 29파일 213 | 30파일 224 |

### 계획서를 뒤집은 결정 2건

1. **FAQ는 바깥 details로 감싸지 않는다.** 계획서대로 감쌌더니 접힌 상태에서 질문 3개가 전부 숨겨지고 답을 보기까지 클릭이 두 번 필요했다. 질문을 훑어 자기 상황을 찾는 것이 FAQ의 핵심이므로 바깥 접힘을 없애고 제목 무게만 19px로 낮췄다. 회귀 방지 테스트 추가.
2. **모바일 하단 고정 CTA를 분야별 문맥 CTA로 변경** (주인님 승인). Phase 1에서 sticky 상단 바에 상시 상담 버튼이 생겨 범용 상담 CTA를 하단에 또 두면 중복이다.

### 검증에서 잡아낸 결함 3건

1. 계획서의 "치환 30곳"이 실제로는 31곳 — 치환표에는 31곳이 다 있어 누락 없음(코덱스 지적).
2. 계획서의 읽기 폭 목표 "한글 45~50자"는 글자 폭을 17px로 잘못 잡은 추정치. Range API 실측 53~56자(실제 글자당 약 13.7px). 설계 문서·CSS 주석을 실측값으로 정정.
3. 하단 바 여백이 고정 88px이라 홈 인디케이터가 있는 기기에서 마지막 내용이 가려질 수 있었다 → `calc(88px + env(safe-area-inset-bottom))`(코덱스 독립 리뷰 지적).

## 2026-10-13 맞춤 도메인 연결 (jungmyungoffice.com)

- [x] 가비아 구매: `jungmyungoffice.com`·`jungmyungoffice.co.kr` (2년, .co.kr 등록정보숨김, 안전잠금은 연결 후 켜기)
- [x] Vercel(CLI 로그인 → REST API) 도메인 등록: 메인 프로젝트에 apex + `www`/`.co.kr`/`www.co.kr`(308 → apex), 비자 프로젝트에 `visa.`
- [x] 가비아 DNS: .com 4건(A 216.198.79.1·64.29.17.1, CNAME www·visa), .co.kr 3건(A 2건, CNAME www) — 21:08/21:09 저장
- [x] Google DNS 반영·Vercel `misconfigured=false` 5건 확인, `vercel certs issue`로 인증서 5건 발급
- [x] 실측: apex 200, www/.co.kr/www.co.kr/http → 308 apex, visa 200, `/api/consult` GET 405
- [ ] 가비아 안전잠금 켜기 (주인님)
- [x] 3단계: 코드 내 주소 교체 — 메인 `2b3c3cb`(CORS 새 도메인 선반영) → 비자 `e05fb97` 배포, 운영 canonical·sitemap·CORS·비자→중앙 상담 링크 실측 확인. 이전 vercel.app 주소는 리다이렉트 없이 유지
- [ ] 메인 사이트는 사전 렌더링이 없어 모든 경로 원본 HTML의 title·canonical이 홈 기준(실측 `/services/dui`) — 네이버 등록 전 보완 검토
- [ ] 개업 상태 전환(광명 사무소 정보, 등록번호·사업자번호 필요), 네이버 서치어드바이저·구글 서치콘솔 등록

## 2026-10-13~14 메인 사전 렌더링 (3.5단계) — 완료·배포

계획 문서: `docs/superpowers/plans/2026-10-13-main-site-prerender.md` (직접 실행 + 마지막 독립 검토 1회)

- [x] 운영 실측으로 문제 확인: `/services/dui` 원본 HTML의 title·canonical이 홈과 같고 본문이 비어 있음
- [x] Task 1: 색인 경로 단일 출처 `getIndexablePaths()`와 sitemap 생성 함수 (`4f03118`)
- [x] Task 2: 브라우저 없이 렌더링하는 SSR 진입점, `ServicePage.tsx:67` window 가드 (`dbd1a38`)
- [x] Task 3: 빌드 파이프라인·vercel.json 경로별 rewrite·셸 `spa-fallback.html`·verify-dist (`fef5f00`)
- [x] 독립 검토(opus): Critical 0, Important 1 → 상담 폼이 스크립트 전 제출되면 GET으로 개인정보 노출 → 사전 렌더링 중 입력·제출 차단 (`032eb78`)
- [x] 주인님 요청 재점검: 17개 페이지 head·본문·자산 경로 전수 확인, React 개발/운영 빌드 출력 동일(해시 일치), 비자 사이트로 Vercel 규칙 실증
- [x] 보완 3건(주인님 A안 승인): 없는 페이지 화면 차단, postbuild 검사 + vercel.json 빌드 명령 고정, 옛 `_redirects` 삭제 (`505a7ec`)
- [x] 검사: 실제 저장소 33파일 239테스트(옛 worktree 사본 포함 시 48파일 335)·빌드·verify-dist 통과
- [x] master fast-forward·push(`337e313..505a7ec`)·Vercel Production 반영

### 운영 실측 (2026-10-14)

| 경로 | 결과 |
|---|---|
| `/`, `/why`, `/services`, `/services/dui`, `/services/immigration`, `/check`, `/check/permit`, `/consult`, `/privacy`, `/disclaimer` | 200, index, 각자 canonical |
| `/services/dui?utm_source=naver`, `/services/dui/` | 200, index, canonical `/services/dui` (끝 슬래시도 사전 렌더링 파일) |
| `/services/nope` | 200, noindex, canonical 없음 (셸) |
| `/admin`, `/check/dui/result` | 200, noindex + X-Robots-Tag noindex |
| sitemap | 17개 (`/check/permit` 포함) |
| `/api/consult` POST | 503 (개업 전 닫힘 유지) |
| 이전 주소 `jm-office-homepage.vercel.app/services/dui` | canonical이 새 도메인 |
| 브라우저 | 본문 1회·콘솔 오류 0, /admin 로그인 폼, /consult?topic=dui 분야 미리 선택, /check/dui 문항 진행 |

### 남은 경미 항목 (미룸)

- [ ] 연결이 느릴 때 스크립트가 붙기 전 스크롤한 위치가 마운트 시 맨 위로 돌아감(`Layout.tsx` scrollTo)
- [ ] 개업 전환 전에는 "개업 준비 중" 문구가 검색로봇에도 보임 → 네이버 등록은 개업 전환 뒤에

## 2026-10-14 개업 전 연락처·오시는 길 공개 (설계 승인: 대화)

- [x] 결정: 사무실 전화·팩스·이메일·주소 공개(휴대폰 제외), 지도는 앱 바로가기 버튼, "개업 준비 중" 띠·접수 안내는 그대로, 운영 시간 미표기
- [x] `office.json`: 대표·전화·팩스·이메일·블로그·주소(시도·시군구·도로명 분리)·"광명KTX역 5번출구 앞"·지도 검색어. isOpen·카카오·등록번호·사업자번호는 null 유지
- [x] 연락처 표시와 접수 가능 여부 분리: 하단은 값이 있으면 표시, 등록번호 줄만 개업 후
- [x] 상담 안내: 전화 걸기 버튼, 카카오 "준비 중입니다.", 새 "오시는 길"(네이버 지도·카카오맵 새 창)
- [x] 개인정보처리방침 문의처를 사무소 이메일·전화로
- [x] 홈에 schema.org LegalService 구조화 데이터(사무소 데이터에서 생성, `<` 이스케이프)
- [x] 테스트 `src/test/officeContact.test.tsx` 10개 — 화면 4개는 "표시 없음"으로 실패 확인 후 통과
- [x] 검사: 실제 저장소 34파일 249테스트(옛 worktree 사본 포함 49파일 345)·빌드·verify-dist 통과, 사전 렌더링 HTML에 전화·LegalService·오시는 길 포함
- [x] 브라우저: 카카오맵 링크 첫 결과 "경기 광명시 새빛공원로 67"·"광명역자이타워 B동" 확인. 네이버 지도는 내장 브라우저 차단으로 200 응답만 확인(주인님 실기기 확인 필요). 375px 가로 넘침 없음
- [x] 상담 안내 개업 전 카드 문구 "(등록번호·연락처 게시)" → "(등록번호 게시)" (주인님 요청, 테스트 RED→GREEN)
- [x] 카카오톡 채널은 주인님이 나중에 개설 — 개업 전환 필수 항목(`REQUIRED_WHEN_OPEN`)은 그대로 둠
- [x] master push(`12938e1..ef60eca`)·운영 확인: 홈 하단 전화·LegalService·개업 준비 띠 유지, 상담 전화 버튼·오시는 길·수정 문구·신청서 잠금, 개인정보처리방침 문의처, `/api/consult` 503, `/services/dui` canonical 유지
- [ ] 네이버 지도 버튼 실기기 확인(주인님)

## 2026-10-15 상단 메뉴 "오시는 길"과 전용 페이지 (설계 승인: 대화)

- [x] 상단 주요 메뉴 3번째에 글자 링크 "오시는 길" (상담 문의 버튼과 시선 경쟁 피함), 모바일은 메뉴 안
- [x] 전용 페이지 `/location`: 주소·"광명KTX역 5번출구 앞"·네이버 지도/카카오맵·전화 걸기·팩스·이메일 (명함에 없는 주차·노선 정보는 넣지 않음)
- [x] 공용 부품 `OfficeLocation`을 오시는 길 페이지와 상담 안내가 함께 사용
- [x] 검색 대상 18개로 확대(`getIndexablePaths` 자동), vercel.json `/location` 규칙 — 규칙 추가 전 `vercelConfig.test`가 누락을 실패로 잡음
- [x] 테스트 `src/test/locationPage.test.tsx` 3개 RED→GREEN, 실제 저장소 35파일 252테스트·빌드·verify-dist(18개) 통과
- [x] 브라우저: 1280·800·769px 메뉴 한 줄·로고와 겹침 없음, 375px 메뉴 안 "오시는 길"→/location 이동·가로 넘침 없음
- [x] master push(`b6f4b06..2fda867`)·운영 확인: /location 200·index·고유 canonical·주소·지도 버튼·전화, 홈 메뉴 링크, sitemap 18개, 상담 안내 오시는 길 유지, /api/consult 503
