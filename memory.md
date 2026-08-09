# 정명 행정사사무소 홈페이지

- 프로젝트: 정명 행정사사무소 홈페이지 (음주운전 구제·영업정지 행정심판·인허가·국가보훈 등)
- 위치: `D:\홈페이지\정명 행정사사무소 홈페이지`
- 목적: 기존 루트 홈페이지(`D:\홈페이지`)를 대체할 Vite + React + TypeScript SPA로 재구축. 셀프 진단 기능을 중심으로 개업 준비 중 사전 공개.
- 스택 참조: `D:\홈페이지\행정사 비자진단 홈페이지` (동일 스택, 검증된 헬퍼 스크립트 재사용)

## 2026-07-09 구현 경과

### Task 1: 프로젝트 스캐폴딩과 기존 파일 legacy 보존 — 완료

- `git init` 완료 (커밋은 하지 않음, 사용자 지시 시에만).
- 기존 루트 홈페이지 파일 보존: `legacy/original-site/`에 `index.html`, `styles.css`, `script.js`, `images/` 전체(hero.png, logo.png, logo_final.png, logo_new.png, logo_transparent.png, thumb.jpg) 복사.
- 로고 파일 `public/images/`에 복사: `logo.png`, `logo_final.png` (두 파일 모두 `D:\홈페이지\images\`에 존재, 스펙과 일치).
- 참조 프로젝트(`행정사 비자진단 홈페이지/scripts/`)에서 `clean-dist.mjs`, `clean-dist.ps1`을 `scripts/`로 복사. (`verify-dist.mjs`는 해당 폴더에 이미 존재하지만 이번 Task 범위 밖이라 복사하지 않음 — Task 3/11에서 필요 시 다룸)
- 스캐폴딩 파일 생성: `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`, `src/main.tsx`, `src/App.tsx`(임시, Task 7에서 교체 예정), `src/vite-env.d.ts`, `src/test/setup.ts`, `src/styles/tokens.css`(빈 파일, Task 2에서 채움), `src/styles/app.css`(빈 파일, Task 2에서 채움).
- 환경: Node v24.13.0, npm 11.6.2 (package.json engines 요구사항 `>=20.19.0` 충족).
- `npm install` 결과: 118 packages added, **0 vulnerabilities**.
- `npm run typecheck` 결과: **0 errors** (출력 없음, 정상 종료).
- `npm run build`는 이번 Task에서 실행하지 않음 — `verify-office.mjs`가 아직 존재하지 않아 `prebuild` 스크립트가 실패하기 때문 (Task 3에서 생성 예정).

### Task 2: 디자인 토큰·전역 스타일·공통 컴포넌트 — 완료

- TDD로 진행: `src/test/components.test.tsx` 작성 후 `Layout` 모듈 부재로 실패 확인 → `src/styles/tokens.css`, `src/styles/app.css`(navbar/footer/hero/FAQ/폼/진행바 등 향후 Task용 클래스 포함) 및 `Layout.tsx`, `Navbar.tsx`, `Footer.tsx`, `PreOpeningNotice.tsx`, `ConsultCta.tsx` 구현 후 재실행하여 통과.
- 테스트 결과: 3개 테스트 모두 통과(개업 준비 중 안내 표시, 본문 건너뛰기·주요 메뉴 링크, 푸터에 가짜 연락처 없음·면책 고지 링크 존재). `npm run typecheck` 0 errors.
- 푸터는 실제 연락처 대신 "사무소 정보는 정식 개업 후 게시됩니다" 안내 문구만 포함(가짜 전화번호·주소 없음), 사무소 정보 실데이터 연동은 Task 3에서 처리 예정.

### Task 3: 사무소 정보 단일 출처(office)와 빌드 안전장치 — 완료

- TDD로 진행: `src/test/office.test.ts` 작성 후 `../data/office` 모듈 부재로 실패 확인(vite import 해석 오류) → `src/data/office.json`(전 필드 `null`, `isOpen: false`), `src/data/office.ts`(`Office` 타입, `assertOfficeValid`, `isAcceptingRequests`, 모듈 로드 시 자체 검증) 구현 후 재실행하여 3개 테스트 모두 통과.
- `scripts/verify-office.mjs` 신규 작성(빌드 전 `isOpen`인데 필수 필드 누락 시 종료코드 1로 실패) — `package.json`의 `prebuild`가 이미 이 스크립트를 참조하고 있었음(Task 1에서 예정된 대로). `node scripts/verify-office.mjs` 단독 실행 시 통과 메시지 출력 확인.
- `Footer.tsx`를 `office`/`isAcceptingRequests` 연동으로 수정: 접수 가능 시 실주소·등록번호·사업자번호·전화(tel: 링크)를 노출하고, 그 외에는 기존 "정식 개업 후 게시" 문구 유지. 법적 고지 링크·구조는 변경 없음.
- 전체 검증: `npx vitest run` 6개 테스트 모두 통과(2개 파일), `npm run typecheck` 0 errors.

### Task 4: 진단 타입·질문 데이터 3종 — 완료

- 공유 타입 `src/types/content.ts` 신규: `CheckDomain`, `ResultLevel`('ready'|'documents'|'official'|'urgent'), `QuestionOption`(id/label/level/note/lawRef?), `Question`(id/text/help?/options), `CheckDefinition`(domain/title/intro/questions).
- TDD로 진행: `src/test/checkData.test.ts` 작성 후 `../data/checks` 모듈 부재로 실패 확인 → 데이터 4파일 구현 후 통과.
- 데이터 파일: `src/data/checks/dui.ts`(계획서 제공 코드 그대로 사용), `suspension.ts`, `veterans.ts`, `index.ts`(`checks: Record<CheckDomain, CheckDefinition>`).
- 문항 수: dui 10문항, suspension 10문항, veterans 9문항(모두 8~12 범위 충족). 각 문항 2개 이상 선택지, ID 중복 없음, 모든 선택지 level·note 존재.
- 기한 관련 긴급(urgent) 선택지에는 모두 근거 법령(lawRef) 부여: 행정심판법 제27조(90일 청구 기한)·제30조(집행정지), 행정절차법 제21조(사전통지)·제27조(의견제출), 도로교통법 제94조.
- 콘텐츠 원칙 준수: 금지 표현(100%·보장·확실히·무조건·성공률·별점·후기형식 등) grep 검사 결과 매칭 없음. note는 예측이 아닌 사실·확인/준비 사항 위주로 작성. intro에 "결과는 일반 정보이며 …에 대한 판단이 아닙니다" 면책 문장 포함.
- 검증: `npx vitest run` 13개 테스트 모두 통과(3개 파일, checkData 7개 신규), `npm run typecheck` 0 errors.

### Task 5: 진단 4단계 분류 로직 — 완료

- TDD로 진행: `src/domain/diagnosis.test.ts` 작성 후 `./diagnosis` 모듈 부재로 실패 확인(vite import 해석 오류) → `src/domain/diagnosis.ts`(`LEVEL_ORDER`, `classifyAnswers`, `summarize`, `ResultItem`/`DiagnosisResult`/`DiagnosisSummary` 타입) 구현 후 재실행하여 4개 테스트 모두 통과.
- `src/lib/browserStorage.ts`는 `행정사 비자진단 홈페이지` 프로젝트에서 그대로 복사(`readStorage`/`writeStorage`/`removeStorage`, storage명 파라미터 방식). 원본에 `safeSessionGet`/`safeSessionSet`이 없어 파일 끝에 `sessionStorage` 전용 얇은 래퍼 2개를 추가(기존 함수는 그대로 유지).
- 전체 검증: `npx vitest run` 17개 테스트 모두 통과(4개 파일), `npm run typecheck` 0 errors.

### Task 6: 콘텐츠 데이터(업무분야 6종·행정사 필요성·FAQ)와 금지 표현 검사 — 완료

- TDD로 진행: `src/test/forbiddenPhrases.test.ts` 작성(계획서 코드 그대로) → `src/data` 디렉터리는 이미 존재해 가드 테스트가 처음부터 통과(11개 테스트, `src/pages`는 아직 없어 검사 대상에서 자동 제외).
- `src/data/services.ts`: 업무분야 6종(음주운전 면허 구제·영업정지 행정심판·인허가 대리·출입국 비자·국가보훈 등록·토지보상/내용증명/계약서) — 계획서 제공 콘텐츠 그대로 사용, 한 글자도 수정하지 않음.
- `src/data/why.ts`: 행정사 필요성 콘텐츠(업무 범위·필요한 순간·변호사/법무사 비교·DIY 비교·흔한 오해) — 계획서 제공 콘텐츠 그대로 사용.
- `src/data/faq.ts`: 홈 FAQ 6문항 — 계획서 제공 콘텐츠 그대로 사용.
- 콘텐츠는 변경 없이 그대로 반영됨(조정 사항 없음). "보장할 수 있는 사람은 아무도 없으며" 등 금지어 반대 취지 문장은 계획서 노트대로 정상적으로 테스트를 통과함.
- 타입체크 과정에서 `node:fs`/`node:path`/`__dirname` 관련 오류 발견 — 프로젝트에 `@types/node`가 없어서 발생(테스트 실행 자체는 vitest/vite-node 자체 해석으로 정상 동작했으나 `tsc --noEmit`은 실패). `npm install --save-dev @types/node`로 설치하고 `tsconfig.json`의 `compilerOptions.types`에 `"node"` 추가하여 해결(계획에 없던 인프라 보완, 콘텐츠 변경 아님).
- 전체 검증: `npx vitest run` 28개 테스트 모두 통과(5개 파일, forbiddenPhrases 11개 신규), `npm run typecheck` 0 errors.

### Task 7: 라우팅과 홈 페이지 — 완료

- TDD로 진행: `src/test/routing.test.tsx` 작성(계획서 코드 그대로) 후 `../app/AppRouter` 모듈 부재로 실패 확인(vite import 해석 오류) → `src/app/AppRouter.tsx`(`/` → HomePage, `*` → NotFoundPage, `Layout`으로 감쌈), `src/pages/HomePage.tsx`, `src/pages/NotFoundPage.tsx` 구현, `src/App.tsx`를 `BrowserRouter` + `AppRouter`로 교체 후 재실행하여 2개 테스트 모두 통과.
- 콘텐츠는 계획서 제공 코드 그대로 사용(한 글자도 수정하지 않음). HomePage는 hero·3분 셀프 진단(checks 3종 카드)·업무 분야(services 6종 카드)·행정사 필요성 안내·진행 절차·FAQ(homeFaqs)·ConsultCta 순서로 구성. NotFoundPage는 홈/셀프 진단/상담 안내로 복구 경로 3개 제공.
- `src/pages/`가 새로 생겨 `forbiddenPhrases.test.ts`의 검사 대상에 자동 포함됨 — 별도 조정 없이 통과(금지 표현 없음).
- 전체 검증: `npx vitest run` 30개 테스트 모두 통과(6개 파일, routing 2개 신규), `npm run typecheck` 0 errors, `npm run build` 성공(prebuild의 `verify-office.mjs` 통과 포함, `tsc --noEmit` + `vite build` 정상 산출: `dist/index.html`, `dist/assets/index-*.css`(6.62kB), `dist/assets/index-*.js`(271.53kB)).

### Task 8: 행정사 필요성 페이지·업무분야 상세 페이지 — 완료

- TDD로 진행: `src/test/infoPages.test.tsx` 작성(계획서 코드 그대로) 후 `/why`, `/services/:slug` 라우트 부재로 실패 확인(8개 실패, 1개 통과) → `src/pages/WhyPage.tsx`, `src/pages/ServicePage.tsx` 구현, `src/app/AppRouter.tsx`에 `/why`, `/services/:slug` 라우트 추가(HomePage 다음, `*` 앞) 후 재실행하여 통과.
- 콘텐츠는 계획서 제공 코드 그대로 사용(한 글자도 수정하지 않음). `WhyPage`는 업무 범위(행정사법 제2조)·필요한 순간·변호사/법무사 비교표·DIY 비교표·흔한 오해(details/summary) 순으로 구성. `ServicePage`는 `useParams`로 slug를 받아 `findService`로 조회, 없으면 `NotFoundPage`를 그대로 반환, `checkDomain` 있으면 진단 버튼(`/check/:domain`), `externalLink` 있으면 외부 링크(출입국→비자진단 사이트), 둘 다 없으면 `ConsultCta`.
- `src/pages/`에 파일이 추가되어 `forbiddenPhrases.test.ts` 검사 대상에 자동 포함됨 — 별도 조정 없이 통과(금지 표현 없음).
- 전체 검증: `npx vitest run` 39개 테스트 모두 통과(7개 파일, infoPages 8개 신규 — services 6종 각 상세 페이지 1개씩 포함), `npm run typecheck` 0 errors, `npm run build` 성공(`dist/assets/index-*.js` 280.17kB).

### Task 9: 셀프 진단 흐름(선택→질문→결과→상담 연결) — 완료

- TDD로 진행: `src/test/checkFlow.test.tsx` 작성(계획서 코드 그대로) 후 `/check` 라우트 부재로 4개 테스트 모두 실패 확인 → `src/pages/CheckSelectPage.tsx`, `src/pages/CheckPage.tsx`, `src/pages/CheckResultPage.tsx` 구현, `src/app/AppRouter.tsx`에 `/check`, `/check/:domain`, `/check/:domain/result` 라우트 추가(`*` 앞) 후 재실행.
- 계획서 제공 코드는 대부분 그대로 사용. 단, `CheckResultPage`의 상담 안내 링크 문구를 계획서의 "이 진단 결과로 상담 안내 보기 →"에서 "상담 안내 보기 →"로 축약함 — 원문 그대로일 경우 결과 페이지 `<h1>진단 결과 — {title}</h1>`와 링크 텍스트가 둘 다 "진단 결과" 부분 문자열을 포함해 `findByText(/진단 결과/)`가 다중 매칭으로 실패했기 때문(실제 버그: 테스트 코드 자체의 모호성, 구현 로직 문제 아님). 다른 테스트(`getByRole('link', { name: /상담 안내 보기/ })`)는 역할 기반 조회라 영향 없음.
- `CheckPage`는 `useState`로 문항 인덱스·답변을 관리, 마지막 문항에서 "결과 보기" 클릭 시 `safeSessionSet('check:{domain}', JSON.stringify(answers))` 후 결과 페이지로 이동. `CheckResultPage`는 `safeSessionGet`으로 답변을 복원해 `classifyAnswers`/`summarize`로 4단계 분류·긴급 배너(110 안내)·상담 연결 시 `consult:summary` 세션 저장을 수행. 답변 미저장 시 "진단을 먼저 진행해 주세요" 안내로 대체.
- 전체 검증: `npx vitest run` 43개 테스트 모두 통과(8개 파일, checkFlow 4개 신규), `npm run typecheck` 0 errors, `npm run build` 성공(`dist/assets/index-*.js` 285.56kB).

### Task 10: 상담 페이지와 고지 페이지 — 완료

- TDD로 진행: `src/test/consultPage.test.tsx` 작성(계획서 코드 그대로) 후 `/consult`, `/privacy`, `/disclaimer` 라우트 부재로 4개 테스트 모두 실패 확인(NotFoundPage로 대체 렌더링) → `src/pages/ConsultPage.tsx`(계획서 제공 코드 그대로), `src/pages/PrivacyPage.tsx`, `src/pages/DisclaimerPage.tsx` 신규 작성, `src/app/AppRouter.tsx`에 `/consult`, `/privacy`, `/disclaimer` 라우트 추가(`/check/:domain/result` 다음, `*` 앞) 후 재실행하여 통과.
- `ConsultPage`는 `isAcceptingRequests(office)`로 접수 가능 여부 판단 — 현재 `office.isOpen`이 false라 모든 입력·버튼이 `disabled`, 가짜 연락처 없이 "개업 후 공개됩니다" 안내만 노출. 진단 결과 페이지에서 넘어온 `consult:summary`(세션 저장소)를 `buildPrefill`로 파싱해 상담 내용 textarea에 미리 채움(레벨별 개수 요약 문구 포함). 긴급 대안 채널로 국민권익위원회 110 안내 카드 포함. 폼 제출은 `preventDefault`만 하는 no-op(개업 후 `office.formEndpoint` 연동은 후속 작업, YAGNI로 지금은 fetch 로직 추가하지 않음).
- `PrivacyPage`(`개인정보처리방침`)는 4개 섹션: 현재 수집 현황(쿠키·분석·서버 수집 없음), 셀프 진단 답변 보관 위치(세션 저장소만, 서버 미전송, 탭 닫으면 삭제), 상담 신청 폼(개업 전 비활성·접수 안 됨, 개업 시 수집 항목·목적·보관 기간 고지 후 동의 받아 수집), 문의(개업 후 공개되는 연락처로 안내).
- `DisclaimerPage`(`면책 고지`)는 5개 섹션: 일반 정보 제공 목적(법률 자문 아님), 결과를 예측·보증하지 않음(처분·인용 여부는 관할 기관·심판기관이 최종 판단), 법령·제도 확인 안내(개정 가능성, 공식 출처 확인 필요), 긴급한 사안(법정 기한 임박 시 국민권익위원회 110 `tel:` 링크 또는 관할 기관 즉시 확인), 사전 공개 사이트 안내(개업 준비 중 사전 공개임을 명시).
- `src/pages/`에 파일이 추가되어 `forbiddenPhrases.test.ts` 검사 대상에 자동 포함됨 — "보증하지 않으며"는 금지어 목록(`보장합니다`, `보장해` 등)에 해당하지 않아 별도 조정 없이 통과.
- 전체 검증: `npx vitest run` 47개 테스트 모두 통과(9개 파일, consultPage 4개 신규), `npm run typecheck` 0 errors, `npm run build` 성공(`dist/assets/index-*.js` 293.44kB, gzip 91.35kB).

### Task 11: 접근성·배포 설정·최종 검증 — 완료

- `src/components/Layout.tsx`에 경로별 `document.title` 매핑(`TITLES`), 경로 변경 시 `<main>`에 프로그램적 포커스, `window.scrollTo(0, 0)`을 `useEffect`로 추가(계획서 코드 그대로). `src/styles/app.css`에 `main:focus { outline: none; }` 추가(프로그램적 포커스 시 전체 `<main>`에 포커스 링이 그려지지 않도록).
- TDD로 진행: `src/test/accessibility.test.tsx` 신규 작성(계획서 코드 그대로) — 7개 라우트 각각 `<h1>` 1개씩, 진단 화면 진행률 `aria-valuenow="1"`, 경로 변경 시 문서 제목 변경(`/why` → "행정사가 필요한 이유" 포함) 검증. 9개 테스트 모두 처음부터 통과(별도 수정 불필요).
- 배포 설정 파일 신규: `public/_redirects`(Netlify류 SPA 폴백), `vercel.json`(Vercel rewrites), `scripts/verify-dist.mjs`(빌드 산출물에 `index.html` 존재·legacy 파일(`legacy`/`styles.css`/`script.js`) 혼입 여부 검사) — 모두 계획서 제공 코드 그대로.
- 전체 검증: `npx vitest run` **56개 테스트 모두 통과**(10개 파일, accessibility 9개 신규). `npm run check`(typecheck → test:run → build → verify:dist) 전체 통과: `tsc --noEmit` 0 errors, 테스트 56개 통과, `prebuild`(clean-dist + verify-office) 통과, `vite build` 성공(`dist/index.html` 0.74kB, `dist/assets/index-*.css` 7.47kB, `dist/assets/index-*.js` 294.03kB gzip 91.52kB), `verify-dist` 통과.
- `npm run build`를 연달아 두 번째 실행해 Windows용 `clean-dist.ps1` 기반 정리 스크립트가 반복 실행에서도 정상 동작함을 확인(동일한 산출물로 재빌드 성공). `dist/_redirects`가 Vite의 `public/` 복사로 산출물에 포함됨을 `dist/` 디렉터리 목록으로 확인.
- 브라우저 수동 검증: 임시 `.claude/launch.json`으로 `npm run dev`를 미리보기 서버에 띄워 확인 후 정리(삭제)함. 홈 화면 렌더링·콘솔 에러 없음 확인, `/why` 이동 시 `document.title`이 "행정사가 필요한 이유 | 정명 행정사사무소"로 바뀌고 `document.activeElement.id === 'main'`, `scrollY === 0` 확인(접근성 개선 사항이 실제 브라우저에서도 동작). `/check/dui` 접근성 트리에서 `progressbar` 값 "1"과 라벨("전체 10문항 중 1번째") 확인.
- 남은 일: 개업 시 `src/data/office.json` 실데이터 기입(대표자·등록번호·소재지·연락처, `isOpen: true`), `ServicePage`의 출입국 비자 외부 링크를 실제 비자진단 사이트 URL로 교체, 커밋·푸시는 사용자 지시 대기(이번 세션에서 커밋하지 않음).

## 2026-07-09 최종 리뷰와 완료

- Task별 구현 리뷰(스펙·품질)에서 반영한 사항: 진단 문구 결과예측성 표현 1건 수정, 110 안내를 국민권익위원회 상담전화로 정정, 인피→인적 피해 표기, CheckResultPage 손상 JSON 방어, .consult-form 폼 스타일 추가.
- 최종 전체 리뷰(별도 에이전트) 판정: READY. Critical 0, Important 0, Minor 3(모두 의도된 설계 또는 후속 과제).
- 최종 상태: 테스트 10파일 56개 통과, typecheck 0오류, 프로덕션 빌드·verify-dist 통과.
- Minor 관찰: 금지표현 테스트는 src/data·src/pages만 스캔(컴포넌트 카피 추가 시 주의).

## 2026-07-09 커밋·배포

- GitHub 저장소: https://github.com/sngbusa100-stack/jm-office-homepage (master)
- 공개 URL: https://sngbusa100-stack.github.io/jm-office-homepage/ (GitHub Pages, gh-pages 브랜치)
- Pages 배포 방식: `npm run build -- --base=/jm-office-homepage/` → dist에 404.html(SPA 폴백)·.nojekyll 추가 → gh-pages 브랜치로 강제 푸시. 재배포 시 같은 절차 반복.
- App.tsx의 BrowserRouter에 `basename={import.meta.env.BASE_URL}` 적용(루트 배포 시 영향 없음).
- 향후 도메인 구매·Vercel 이전 시: vercel.json이 이미 있으므로 저장소 연결만 하면 됨. 그때 --base 없이 빌드(기본 '/').

## 2026-07-11 상담 접수→텔레그램 연동 및 보안 점검

- Vercel 프로젝트 jm-office-homepage: 사이트+api/consult(서버리스) 프로덕션 배포. https://jm-office-homepage.vercel.app
- 접수 흐름: 폼 → /api/consult(검증·허니팟·CORS) → 사무소 텔레그램 알림. 실수신 확인 완료.
- 비밀값 보관: TELEGRAM_BOT_TOKEN·TELEGRAM_CHAT_ID는 Vercel 환경변수(Production, 암호화)에만 존재. 코드·저장소에 없음.
- 보안 점검 결과: 전체 git 이력에 토큰·API키 패턴 0건, .env/.vercel 미추적, 프런트 번들에 비밀값 0건, API 오류 응답에 내부정보 미노출, 텔레그램 전송은 parse_mode 없는 일반 텍스트(주입 무해화).
- 조치 1건: 설계 문서에 있던 챗 ID를 제거하고 커밋 amend + force-push로 공개 이력에서 삭제(재검사 0건).
- 잔여 위험(수용): CORS는 브라우저 차단용이라 curl 직접 호출은 가능 — 허니팟·입력 상한·주제 화이트리스트로 완화. 스팸 발생 시 Vercel 방화벽/간단한 IP 제한 추가 예정.
- GitHub Pages(gh-pages)도 동일 코드로 재배포 완료. 개업 시: office.json 실데이터+isOpen true → vercel deploy --prod 한 번.

## 2026-07-17 접수 데이터 축적·체계적 응답 시스템

- 설계: `docs/superpowers/specs/2026-07-17-inquiry-management-design.md`
- 접수 흐름 확장: 접수번호(JM-YYYYMMDD-XXXX) 발급 → Upstash Redis 저장(inquiry:<id> + inquiry:index) → 텔레그램 알림에 접수번호 포함 → 방문자 성공 안내에 접수번호 표시. 저장소 미설정·장애 시에도 알림은 발송(fail-open, 알림·저장 모두 실패 시에만 접수 실패).
- 관리자: `/admin` 페이지 + `api/admin.js` (ADMIN_TOKEN Bearer, sha256 상수시간 비교). 접수 목록·통계(상태/분야/월별)·상태 변경(신규/진행 중/완료/보류)·처리 메모·분야별 회신문 템플릿 생성(확인 질문 포함)·개인정보 파기(통계 필드만 보존).
- 답변 템플릿: `src/data/replyTemplates.ts` — 6개 분야별 첫 회신문+확인 질문. 방문자 자동 응답 챗봇 없음(2026-07-11 결정 유지, 회신은 항상 사람).
- 개인정보처리방침에 보관(접근 제한 DB)·위탁(Upstash 추가)·파기(통계 필드만 잔존) 갱신.
- 검증: 테스트 15파일 96개 통과, typecheck 0오류, 빌드·verify-dist 통과.
- **배포 전 필요 설정(사용자)**: Vercel Storage에서 Upstash Redis 생성·연결(환경변수 자동 주입) + `ADMIN_TOKEN` 환경변수 추가 + 재배포. 설정 전에도 기존 알림 흐름은 그대로 동작.
- **배포 완료(2026-07-17)**: Upstash Redis(upstash-kv-coquelicot-book, Free, Washington D.C., Eviction OFF) 생성·연결, `KV_REST_API_*` 자동 주입, `ADMIN_TOKEN`(Production, Sensitive) 설정. master 푸시로 Vercel 자동 배포(Production이 master 추적 — git 연동 확인됨). 실환경 검증: 테스트 접수 JM-20260717-XKG8 → 저장·텔레그램 알림·/admin 목록·상태 변경·파기 전부 정상. 파기 후 통계 스텁 1건 잔존(완전 삭제는 Upstash CLI에서 DEL/ZREM).
- GitHub Pages(gh-pages)는 아직 이전 버전 — 접수 API·관리 페이지는 vercel.app이 본체라 무방, 필요 시 재배포.

## 2026-07-12 홈페이지 보완·발전 사전 진단

- 사용자 요청에 따라 기존 홈페이지의 구조, 화면, 접근성, 검색 노출, 콘텐츠 신뢰성, 공개 경로를 읽기 전용으로 점검했다. 실제 수정은 계획 승인 전이므로 아직 수행하지 않았다.
- 현재 기준 검증: `npm run check` 전체 통과. 테스트 12개 파일 68개 통과, TypeScript 오류 0건, Vite 프로덕션 빌드와 `verify-dist` 통과.
- 모바일 실제 화면에서 hero가 `.hero { padding: ... 0 }` 규칙에 의해 `.page-shell`의 좌우 20px 여백을 덮어써 제목과 본문이 화면 가장자리에 붙는 문제를 확인했다.
- 색상 대비 계산 결과 금색 `#b98a2f` 위 흰 글자는 3.12:1, 배경 `#fafaf8` 위 금색 작은 글자는 2.98:1로 일반 텍스트 WCAG AA 기준에 미달한다.
- 공개 Vercel에서 `/visa/`, `/robots.txt`, `/sitemap.xml`이 모두 상태 200의 홈페이지 HTML로 반환된다. `/visa/`는 실제 비자센터가 아니라 SPA 404로 이어지는 깨진 연결이고, robots/sitemap은 존재하지 않는다.
- `index.html`에는 description만 있고 canonical, Open Graph, JSON-LD가 없다. `Layout.tsx` 제목 매핑도 정적 6개 경로뿐이라 서비스·진단 상세 화면의 제목이 일반 사무소명으로만 표시된다.
- 상단 `업무분야` 메뉴가 전체 업무 목록이 아니라 `/services/dui`로 바로 연결되어 정보 구조상 오해 가능성이 있다. 별도 `/services` 모음 페이지가 필요하다.
- 국가법령정보센터 대조 결과 도로교통법 제94조의 운전면허 처분 이의신청 60일, 행정심판법 제27조의 원칙적 90일, 행정절차법 제27조의 의견제출 취지는 현재 문구와 대체로 맞는다. 다만 `기한이 지나면 다툴 수 없습니다`, `다툴 방법 자체가 사라집니다`는 예외 가능성을 배제하는 단정적 표현이므로 `원칙적으로 불복이 제한될 수 있습니다` 취지로 완화할 필요가 있다.
- 인접 비자진단 프로젝트는 메모상 아직 실제 인터넷 배포가 되지 않아 연결할 공개 URL이 없다. 따라서 이번 1차 개선에서는 `/visa/` 링크를 준비중 안내로 바꾸고, 실제 URL 확보 후 다시 연결하는 것이 안전하다.
- 승인 대기 계획은 `checklist.md`의 `2026-07-12 홈페이지 보완·발전 계획`에 기록했다. 커밋·푸시·배포는 별도 지시 전까지 하지 않는다.

## 2026-07-15 홈페이지 보완·발전 구현 완료

- 사용자가 `checklist.md`의 2026-07-12 계획을 승인해 구현을 진행했다. 커밋·푸시·배포는 수행하지 않았다.
- 모바일 hero를 내부 `.page-shell` 2열 구조로 재구성해 390px 화면에서 좌우 20px 여백과 가로 넘침 없음이 확인됐다. 1440px에서는 안내 패널을 포함한 2열 레이아웃과 데스크톱 메뉴가 정상 표시됐다.
- 강조색을 `#86601d`로 조정해 흰색 대비 5.67:1, 배경색 대비 5.42:1을 확보했고, 전역 `:focus-visible` 표시와 모바일 전체 폭 CTA를 추가했다.
- `/services` 업무분야 전체 페이지를 추가하고 상단 메뉴를 특정 음주운전 페이지가 아닌 전체 목록으로 연결했다. 홈 hero·업무 카드·진행 절차·FAQ·CTA의 시각 위계를 개선했다.
- 배포되지 않은 `/visa/` 링크를 제거하고 출입국 상세 페이지에 비자 진단센터 공개 준비중 안내를 표시했다. 실제 공개 URL이 생길 때까지 깨진 주소로 이동하지 않는다.
- `pageMeta.ts`를 추가해 홈·업무·진단·상담·고지 페이지별 title, description, canonical, robots, Open Graph 메타를 동적으로 갱신한다. 진단 결과와 404는 `noindex, nofollow`다.
- `public/robots.txt`, `public/sitemap.xml`, 초기 HTML canonical·Open Graph·WebSite JSON-LD를 추가하고 `verify-dist.mjs`가 해당 산출물을 필수 검증하도록 강화했다.
- 법정 기한을 단정하던 문구를 `원칙적으로 절차가 제한될 수 있다`는 취지로 완화하고, 근거가 불명확하게 단정되던 `통상 110일 정지` 표현도 개별 사정에 따라 달라진다는 안내로 교체했다.
- `findCheck`가 `Object.hasOwn`으로 진단 도메인을 검증하도록 해 `/check/toString` 같은 객체 프로토타입 이름 경로의 런타임 오류를 방지했다. 잘못된 결과 경로도 화면과 일치하는 404 메타를 사용한다.
- 리뷰 에이전트가 발견한 robots/noindex 충돌, 진행 절차 번호 CSS 덮어쓰기, 프로토타입 경로 오류, 잘못된 결과 경로 메타 불일치를 모두 수정하고 회귀 테스트를 추가했다. 최종 독립 리뷰 판정은 READY(Critical 0, Important 0, Minor 0).
- 최종 `npm run check`: 테스트 14파일 80개 통과, TypeScript 오류 0건, 프로덕션 빌드와 `verify-dist` 통과. `npm audit --audit-level=high` 취약점 0건, `git diff --check` 통과.
- 실제 브라우저 검증: 모바일·데스크톱 가로 넘침 없음, 모바일 메뉴 열기·업무분야 이동 후 자동 닫힘, `/services` 카드 6개, 비자 링크 0개, 경로별 title/canonical, 브라우저 경고·오류 0건을 확인했다. GitHub Pages 하위 경로 빌드에서도 파비콘·스크립트·로고 경로가 정상 생성됐다.

## 2026-07-18 로컬·원격 통합과 접수 개인정보 보강 (A·B단계)

- 배경: 로컬에는 7-12 보완계획 구현 28건이 미커밋, 원격에는 7-17 접수 시스템 2커밋이 앞서 있었다. GPT 교차 검토와 합의된 계획에 따라 진행했다.
- A단계(안전 병합): 로컬 작업을 `local-work-0718` 브랜치에 커밋해 보존 → master를 origin/master로 fast-forward → 병합. 충돌 4파일 중 `Layout.tsx`만 실질 충돌(구 TITLES ↔ pageMeta) — pageMeta 방식을 채택하고 `/admin`을 `noindex, nofollow`로 등록. app.css·memory.md는 양쪽 추가분 보존, AppRouter는 자동 병합(/services + /admin 공존).
- B단계(배포 전 개인정보·데이터 보강):
  - **텔레그램 탈개인정보화**: 정상 저장 시 알림은 접수번호(+긴급 여부)만 담고 이름·연락처·분야·상담 내용은 싣지 않는다. 저장 실패 시에만 유실 방지를 위해 전체 내용 폴백(경고 줄 포함). `consult.js`의 storeError 판정을 `!stored`로 바꿔 저장소 미설정 시에도 폴백이 동작한다.
  - **접수 레코드 v2**: `schemaVersion: 2`, `consent: {version, at}`(동의 문구 버전 `CONSENT_VERSION`), 셀프 진단 상세(`diagnosis: {domain, answers, counts}`), `sourcePath`, `utmSource` 추가. 서버 `sanitizeDiagnosis`가 상한(답변 40개·60자, counts 등급 화이트리스트)을 강제하고, 손상된 진단은 접수를 막지 않고 제외한다.
  - **진단→상담 연결**: 진단 결과에서 상담 이동 시 `consult:diagnosis` 세션 저장 → 접수 payload에 포함. 등급 요약만 넘어가던 기존 문제 해결. `Layout`이 `utm_source` 쿼리를 세션에 보관해 유입경로를 접수에 붙인다.
  - **관리 화면**: 접수 상세에 셀프 진단 답변(문항·답변 라벨로 변환 표시)·유입경로 표시 추가.
  - **파기 정합**: purge 시 diagnosis·consent도 함께 파기(통계용 sourcePath·utmSource·schemaVersion만 잔존). 개인정보처리방침을 실동작(텔레그램 개인정보 미포함·저장 장애 예외, 진단 결과 수집 항목)과 일치하게 갱신.
- 검증: `npm run check` 테스트 32파일 214개 통과(신규 10개), typecheck 0, 빌드·verify-dist 통과. 실브라우저: 진단→결과→상담 이동 시 diagnosis(답변 6·urgent 1) 저장·프리필 정상, `/admin` noindex·토큰 게이트 정상, 콘솔 오류 0건.
- **미해결(push 전 결정 필요)**: ① Upstash Redis가 미국 워싱턴 D.C. 리전 — 국내(또는 아시아) 리전 재생성 여부는 주인님 결정 필요(재생성 시 함수 리전도 함께 지정). ② master push 시 Vercel Production 자동 배포 — push는 별도 승인 후. ③ 자동 보존기간(완료 후 N일 자동 파기)은 다음 단계.
- **운영 배포 완료(2026-07-18)**: master push(`5f9640c`) → Vercel Production 자동 배포 Ready 확인. 실환경 검증: `/robots.txt` 200 text/plain, `/sitemap.xml` 200 application/xml(admin 미포함) — HTML 반환 버그 해결. `/admin` 실브라우저에서 `noindex, nofollow`·canonical 정상. 접수 API 테스트 `JM-20260718-D4CP`(진단 상세·urgent 포함, utm=deploy_verification) 정상 접수 — 텔레그램 알림은 접수번호·긴급 표시만 포함(개인정보 미포함) 확인 대상. 테스트 접수는 /admin에서 파기 예정.

## 2026-07-18 GPT 교차검증 지적 보완 (접수 보안·개인정보 1차)

- 사용자 결정: 저장 실패 시 텔레그램 전체 폴백은 **현행 유지**(재연락 대응 목적, 방침에 고지됨). 개인정보 보존기간은 **처리 완료 후 120일**(행정심판 90일+후속 소송·변호사 연계 대응) 후 자동 파기.
- 구현: ① 텔레그램 fetch try/catch — 저장 성공 시 알림 예외가 500·중복 접수로 번지지 않음 ② 개업 게이트 — `CONSULT_OPEN=true` 환경변수 없으면 `/api/consult` 503 (개업 시 Vercel에서 설정) ③ SET+ZADD를 Upstash `multi-exec` 트랜잭션으로 원자화(고아 레코드 방지) ④ IP 요청 제한(분당 5회, INCR+EXPIRE NX, 제한기 장애 시 fail-open) ⑤ 파기 시 origin·sourcePath·utmSource까지 제거(방침 문구와 일치) ⑥ done 전환 시 `doneAt` 기록, 관리자 GET에서 120일 경과 건 자동 파기 스윕 ⑦ `/admin`에 `X-Robots-Tag: noindex, nofollow` 헤더(vercel.json) ⑧ `api/admin.test.mjs` → `api/_admin.test.mjs` 이름 변경으로 서버리스 함수 노출 제거.
- 방침·동의 문구를 120일 보관으로 갱신(처리방침 보관·파기 조항, 상담 폼 동의 라벨).
- 검증: 테스트 32파일 222개 통과(신규 8: 트랜잭션·부분실패·파기필드·doneAt·보존판정·레거시 기산점·요청제한 2), typecheck 0, 빌드·verify-dist 통과.
- 잔여(2차): 진단 정의 src/api 공유 JSON + 서버측 counts 재계산, 500건 초과 페이지네이션, 개업 전 방침의 국외이전 상세 고지(보호법 제28조의8) 전문 검토, Upstash 리전 이전 여부.

## 2026-07-19 통합 최우선 전환

- 주인님 지시로 우선순위 확정: **시스템 연동(자동 수임 파이프라인)이 최우선**, 3차 보안 보완은 통합 후·개업 전 필수로 보류. 기준 문서는 `D:\행정사\1-행정심판\docs\2026-07-19-통합-마스터플랜.md`.
- 이 프로젝트의 다음 작업은 D1(`api/connector.js` pull/ACK API). 접수 레코드 v2 스키마(diagnosis·consent·sourcePath·utmSource)는 `api/_store.mjs` 기준.
- GPT 재검증 결과 기록: 1차 보완 중 "자동 파기"는 정확히는 관리자 조회 시 스윕(스케줄러 아님·500건 한도), multi-exec는 네트워크 부분실패만 제거(런타임 오류 롤백 없음), 중복 방지는 텔레그램 예외 경로만 차단. 정확한 해결(cron·멱등성·read-back)은 3차에서.

## 2026-07-19 D1 — 연동기 API 구현·배포

- `api/connector.js` 신규: `CONNECTOR_TOKEN` Bearer 인증(ADMIN_TOKEN과 별개, 상수시간 비교 재사용). GET=미pull·미파기 접수 목록, PATCH=ACK(`pulledAt`·`localCaseId` 기록, 재시도 멱등·최초 값 유지), DELETE=수임 이관 후 파기(멱등). 로컬 스크립트 전용이라 CORS 미적용.
- 이메일(선택) 필드 추가: 폼→검증(형식 오류 시 error)→레코드→관리 화면(mailto 링크)→저장실패 폴백 알림→방침 수집 항목. D3 이메일 답변 발송의 전제.
- 관리 화면에 `localCaseId`(행정심판 등록 사건번호) 표시.
- `CONNECTOR_TOKEN` Vercel Production 등록(CLI) + 행정심판 `.env`에 동일 값·`CONNECTOR_BASE_URL` 보관.
- 검증: 테스트 33파일 231개 통과(연동기 핸들러·ACK 멱등·이메일 검증 신규 9개).

## 2026-07-19 D2·D3·D4(부분) — 통합 파이프라인 가동

- D1 connector API 운영 검증 완료(무토큰 401, 토큰 200). 행정심판 쪽 연동기(D2)가 실환경 왕복 성공: JM-20260718-D4CP pull→로컬 대기함 적재(driver_license 라우팅)→ACK→원격 목록 0건→재실행 멱등. `JM_Homepage_Pull` 30분 스케줄 가동(LastResult=0).
- D3: 행정심판 관리자 UI 접수 탭에 홈페이지 대기함 섹션(진단 상세·사건 전환·수임 확정 시 connector DELETE로 클라우드 파기). 비심판 분야 회신은 이 프로젝트 /admin 회신 템플릿 활용.
- D4(메인 측): `/consult?topic=슬러그` 프리셀렉트 추가(dui·suspension·permit·visa·veterans·land) — 비자 사이트가 `…/consult?topic=visa&utm_source=visa_site` 링크 한 줄로 접수함에 합류 가능. utm은 Layout이 세션 캡처.
- D4 잔여(다음 세션): 비자 사이트에 상담 CTA 추가 + 최초 배포(신규 Vercel 프로젝트 — 주인님 확인 후) + 메인 "준비중" 링크 교체.
- 검증: 테스트 33파일 233개 통과.

## 2026-07-19 3차 보안 보완·D4 공개 연결

- Claude 중단 코드에서 `submissionId` 타입 누락, Vitest에서 동작하지 않는 런타임 JSON 로딩, 선점 키만 남은 접수의 허위 성공, 본문만 저장된 인덱스 고아 가능성을 재현했다.
- 진단 정의를 정적 ESM으로 생성하고 클라이언트 정의와 완전 동기화 테스트를 추가했다. 진단 답변·긴급도는 서버 정의로 다시 계산한다.
- 멱등성은 실제 기존 본문 확인 후에만 duplicate 성공을 반환한다. 기존 본문은 인덱스를 재등록하고, 동시 요청은 30초 처리 잠금으로 409 처리하며, 기존 ID 조회 장애는 새 ID로 갈라지지 않도록 503을 반환한다.
- 저장 응답/부분 실패 시 본문 read-back 후 인덱스를 복구한다. Vercel 일일 cron이 인덱스 전체를 페이지로 읽어 완료 120일 경과 개인정보를 파기하며 `CRON_SECRET`을 Production 민감 환경변수로 설정했다.
- 브라우저 제출 키는 sessionStorage에 유지해 새로고침 재시도를 묶고, 성공 시 진단·유입·제출 키를 삭제하며 성공 상태에서 재제출 버튼을 막는다.
- 비자 진단센터 운영 URL `https://jm-visa-precheck.vercel.app`을 출입국 서비스 페이지에 연결했다. 저장 실패 텔레그램 폴백의 수동 로컬 등록·확인·메시지 삭제 절차는 `docs/OPERATIONS_CONSULT_FALLBACK.md`에 기록했다.
- 최종 검증: 36파일 257테스트, 타입 검사, 프로덕션 빌드, 산출물 검증, diff check 통과. 독립 리뷰 최종 P0/P1 없음·배포 가능 판정.
- 운영 배포: `e0131c6` push 후 Vercel Production Ready. 실환경에서 `CONSULT_OPEN=false`에 따른 POST 503, `/api/cron-purge` 무인증 401, `/admin`과 `/admin/*`의 `X-Robots-Tag: noindex, nofollow`, robots.txt text/plain, 비자 운영 링크 번들 포함을 확인했다. `CRON_SECRET`은 Production Sensitive로 존재해 로컬에서 원문을 다시 꺼낼 수 없으며 첫 예약 실행 로그는 다음 03:00 KST에 확인한다.

## 2026-07-19 셀프 리허설 — 로컬 시험환경 전 구간 검증 완료

- 시험환경(운영 완전 분리): 로컬 Redis REST 셧(127.0.0.1:8079) + `vercel dev`(API, :3300) + vite(:5173, /api 프록시) + 임시 SQLite. 시험 데이터는 서버 종료로 소멸, office.json 임시 오버라이드는 원복.
- **발견·수정 1건**: `vercel dev` 단독 실행 시 vercel.json SPA rewrite가 vite 모듈 경로(/src/main.tsx)를 가로채 React가 마운트되지 않음(운영 무관, 로컬 한정). → `vite.config.ts`에 `/api` 프록시 추가로 해결·커밋. 이후 로컬 시험 표준 절차: `npx vercel dev --listen 3300` + `npm run dev` 병행.
- 브라우저 실클릭 검증(가짜 고객): 진단 10문항 → 결과 → 상담 프리필 → 접수 `JM-20260719-P5FK`(이메일·진단 상세·동의 v2026-07-19 포함) → 접수 후 세션 정리 확인.
- API 검증: 서버 urgent 재계산(10답변→긴급1), 멱등성(같은 submissionId 재제출=같은 접수번호·duplicate:true, 5연발에도 레코드 1건), 요청 제한(분당 5회, 6번째 429), cron-purge 인증·스캔, connector DELETE 파기(통계만 잔존).
- /admin 검증: 목록·진단 상세(문항·답변 한글 라벨 10건)·회신문 자동 생성(이름·접수번호·확인질문 삽입)·파기 버튼.
- 행정심판 연동 검증(임시 DB): pull 3건 적재·라우팅(음주운전→driver_license) → 사건 전환 `CASE-2026-0001`(유효마감 D-25 자동계산) → 자동 진단(준비도 46점 risk·경고 3건·증거 체크리스트 11항목, 필수 5건 미비 식별) → 대기함-사건 연결.
- **미검증(환경 필요)**: LLM 문서 생성(HWPX — LM Studio/Gemini 필요), notify 이메일 실발송(SMTP 설정), 실기기(스마트폰) UX. 개업 전 확인 항목으로 이관.

## 2026-07-25 유입→조회→진단→상담 전환 퍼널 계획

- 주인님이 홈페이지의 가장 앞단을 `유입 → 분야 설명·조회 → 진단 → 상담` 순서로 명확히 구성해야 한다고 지시했다.
- 기존 메인 업무분야 6개와 비자 상세 6개가 이미 있으므로 새 페이지를 무작정 늘리지 않고, 기존 페이지를 검색의도형 설명·조회 랜딩으로 고도화하는 방향으로 계획했다.
- `조회`는 별도의 긴 설문이 아니라 대상·기한·핵심요건·준비서류·공식확인 경로를 페이지에서 빠르게 확인하는 단계로 정의했다.
- 기본 경로 외에 고의도 방문자의 진단 바로 시작과 긴급 방문자의 진단 생략 상담·공식확인 경로를 함께 제공한다.
- 전환 이벤트는 landing/diagnosis/consult/qualified/retained/work_completed로 구성하고 개인정보·진단답변 원문은 분석 이벤트에서 제외한다.
- 비자 진단 결과는 현재 중앙 상담 URL로 이동만 하므로, 동의 기반의 버전된 스키마·서버 검증·일회성 handoff/submission 방식으로 중앙 접수에 전달하는 계획을 포함했다.
- 우선순위는 음주운전 → 영업정지 → E-7 → F-6이며, 이 네 분야로 전체 흐름을 검증한 뒤 나머지 분야를 확장한다.
- 기준 문서: `docs/superpowers/plans/2026-07-25-inflow-view-diagnosis-consultation-funnel.md`
- 2026-07-25 주인님이 계획을 승인하고 Phase 0부터 순차 구현을 지시했다. 커밋·푸시·배포는 별도 지시 전까지 금지한다.
- Phase 0 완료: `src/lib/funnel.ts`에 허용 이벤트·분야 코드, UTM 4종, 익명 여정 ID 규격을 두고 임의 개인정보 필드를 구조적으로 제외했다.
- 상담 접수는 `attribution`을 함께 저장하도록 스키마 v3로 올렸고, 기존 `utmSource`는 호환 목적으로 유지했다. 관련 단위 테스트 85개와 타입 검사를 통과했다.
- Phase 1 완료: 메인 업무분야 6개 상세를 공통 설명·조회 랜딩으로 개편했다. 각 페이지에 빠른 조회 4항목, 공식 출처·확인일, 직접 준비/사건별 검토 구분, 상·하단 진단/상담 CTA를 배치했다.
- 음주운전은 도로교통법 제94조와 행정심판법 제27조, 영업정지는 행정절차법 제27조와 행정심판법 제27조를 2026-07-25 현행 공식 조문으로 재대조했다. 비자 6종 상세 바로가기와 보훈부 등록 안내도 공식 경로로 연결했다.
- Phase 1 대상 테스트 64개와 타입 검사를 통과했다.
- Phase 2 완료: `/api/funnel`이 허용된 단계·분야·UTM source만 일별 합계로 저장하고 개별 경로·익명 여정 ID·개인정보·진단 답변은 저장하지 않도록 했다. 일별 합계는 400일 만료다.
- 공개 이벤트 6종(설명 조회, CTA 클릭, 진단 시작/완료, 상담 화면/접수)과 내부 수임 단계 4종(상담 접수, 수임 적합, 수임 확정, 업무 완료)을 분리했다.
- `/admin`에 최근 30일 퍼널과 유입 출처 합계, 접수별 수임 단계 버튼을 추가하고 개인정보처리방침을 실제 동작과 일치시켰다. 메인 전체 39파일 268테스트와 타입 검사를 통과했다.
- Phase 3 완료: 비자 사이트 6개 상세가 공통으로 `설명 → 요건·서류 조회 → 진단 → 상담 준비` 흐름을 표시하고, 비자·언어 코드가 붙은 중앙 상담 바로가기를 제공한다.
- Phase 4 완료: 비자 결과 화면에서 고객이 별도 체크박스로 동의한 경우에만 비자 종류·언어·진단 답변을 중앙 `/api/visa-handoff`로 보낸다. 서버는 6개 비자별 문항·선택지와 완전 대조해 등급을 재계산하고, 이름·연락처 없이 30분 TTL·GETDEL 일회 토큰으로 중앙 상담 화면에 전달한다.
- 중앙 상담은 일회 토큰을 읽은 뒤 브라우저 세션에 임시 보관하고 실제 상담 동의 제출 때만 접수 레코드 v5의 `visaDiagnosis`로 저장한다. 토큰 만료·장애 시에도 일반 상담은 계속 가능하다. 양쪽 질문 정의는 교차 프로젝트 동기화 테스트로 불일치 배포를 막는다.
- Phase 5 완료: 비자 사이트에 비자별 다국어 title·description·canonical, robots.txt, sitemap.xml, Open Graph, WebSite/WebPage 구조화 데이터를 추가했다. 6개 비자 설명 URL은 빌드 시 검색엔진용 본문까지 사전 렌더링된다.
- 결과 화면과 개별 진단 문항은 클라이언트 meta뿐 아니라 Vercel `X-Robots-Tag`로 색인을 차단한다. 현재 5개 언어는 같은 URL에서 전환되므로 서로 다른 언어 URL이 없는 상태에서 잘못된 hreflang을 넣지 않기로 했다. 향후 `/en/...` 같은 URL 전략을 먼저 확정한 뒤 hreflang을 적용한다.

## 2026-07-25 유입→조회→진단→상담 퍼널 최종 완료

- 최종 고객 흐름은 `분야 검색·유입 → 설명/빠른 조회 → 셀프 진단 또는 긴급 우회 → 상담 → 수임 단계 → 내부 업무처리`로 확정했다. 새 페이지를 양산하지 않고 기존 메인 업무분야 6개와 비자 6개 상세를 검색의도형 랜딩으로 고도화했다.
- 메인 랜딩에는 대상·기한·핵심 확인값·공식 출처와 확인일·직접 준비/사건별 검토·상하단 CTA를 배치했다. 비자는 `설명 → 요건·서류 → 진단 → 상담 준비` 공통 구조와 5개 언어를 유지한다.
- 퍼널 이벤트는 공개 6단계와 내부 수임 4단계를 분리했다. 최종 구현에서는 중간 기록과 달리 **개별 경로와 익명 여정 ID를 전송하지 않는다**. 클라이언트가 원본 UTM을 그대로 보내지 않고 허용된 source 버킷 하나만 `/api/funnel`에 전송하며 서버는 분야·단계·source 일별 합계만 400일 보관한다.
- 메인→비자→중앙 상담 링크는 허용된 원 source/medium/campaign을 이어가고 `jm_main`, `jm_visa_precheck` 접점을 content에 누적해 최초 유입과 중간 경유를 함께 확인할 수 있다.
- 비자 결과는 별도 동의 뒤 이름·연락처 없이 전달한다. 외부 HTTP 소비는 부작용 GET이 아니라 `POST {action:"consume"}`이고 모든 응답은 `Cache-Control: no-store, private`다. Redis 내부에서만 GETDEL로 30분 토큰을 한 번 소비한다.
- 상담 화면은 토큰 로딩 중 제출을 막고, 현재 URL 토큰과 상태가 일치할 때만 `visaDiagnosis`를 첨부한다. 같은 컴포넌트에서 쿼리를 제거·변경해도 이전 진단·자동 요약·분야 잠금이 남지 않는다. 서버도 비자 진단이 붙은 접수는 `출입국 · 비자` 분야만 허용한다.
- 비자 문항 계약은 형제 저장소 직접 import를 제거했다. 각 저장소가 내부 버전 JSON을 자체 검사하며 메인의 `npm run sync:visa-contract`로 명시 동기화한다. 최종 두 파일 SHA-256은 동일했다.
- 관리자 화면은 비자 문항·답변을 한국어 라벨과 원 ID로 함께 보여 준다.
- 독립 리뷰에서 1차 P1 6건·P2 2건, 재리뷰 P1 2건을 발견해 모두 수정했다. 최종 재리뷰는 새 P0/P1 없음 판정이다.
- 검증: 메인 `npm run check` 42파일 289테스트, 비자 28파일 177테스트, 두 프로젝트 타입 검사·프로덕션 빌드·산출물 검증 통과. 행정심판 연결 표적 30테스트 통과. 로컬 격리 브라우저에서 E-7 handoff, URL 변경 후 이전 진단 제거, 원 UTM 연속성, 음주운전·영업정지·F-6 대표 화면과 390px 모바일을 확인했다.
- 이번 승인 범위에서는 운영 환경변수·운영 데이터·커밋·푸시·배포를 변경하지 않았다. 다음 단계는 주인님의 별도 지시가 있을 때 변경 파일 검토 후 커밋·푸시하며, 운영 배포 뒤 실제 도메인에서 robots/sitemap/handoff/퍼널을 재검증하는 것이다.

## 2026-07-26 유입→조회→진단→상담 퍼널 운영 배포

- 주인님 승인에 따라 기능 고도화 전체를 커밋 `7fe3f4d`로 `master`에 push했다.
- Vercel Production 배포가 `Ready`가 되었고 공식 운영 주소 `https://jm-office-homepage.vercel.app`에 연결됐다.
- 운영 주소에서 `robots.txt` 200 text/plain, `sitemap.xml` 200 XML 및 `/admin` 제외, `/services/immigration` 200을 확인했다.
- `/admin`은 `X-Robots-Tag: noindex, nofollow`이며, 개업 전 게이트 `CONSULT_OPEN=false`에 따라 `/api/consult` POST가 503을 반환하는 상태를 확인했다.
- 비자 사이트의 새 운영판과 함께 설명·조회→진단→중앙 상담 흐름을 공개했으며, 실제 개인정보 접수는 개업 스위치를 켜기 전까지 닫혀 있다.

## 2026-08-08 업무분야 설명 → 진단 동선 재정렬 Phase 1 (구조)

- 문제: 홈에서 셀프 진단 섹션이 업무 분야보다 위에 있고 상단 메뉴가 둘을 동급으로 나열해, 방문자가 자기 문제 설명을 읽기 전에 진단부터 만났다. 업무분야 6개 중 진단이 있는 건 3개뿐이라 나머지는 다음 행동이 끊겼다.
- 확정: 비자만 외부 사이트(jm-visa-precheck)로 나가고, 행정심판은 별도 사이트가 아니라 메인 내부 `/check/suspension`이다. `D:\행정사\1-행정심판`은 수임 후 내부 업무 시스템이라 홈페이지에 노출되지 않는다.
- 주인님 결정 3건: ① 인허가만 진단 신설(문서 분야는 확인 목록으로 대체) ② 비자는 별도 유지 + 시각 통일 ③ 구조 먼저, 디자인은 Phase 2.
- 결과: 업무분야 6개 전부가 `설명 → 진단(또는 확인 목록) → 상담`으로 이어진다. 내부 진단 4(dui·suspension·veterans·permit) + 외부 진단 1(비자) + 확인 목록 1(문서).

### 인허가 진단(permit) — 12문항

주인님 검수로 초안 10문항을 12문항으로 재작성. "문항이 곧 고객 체크리스트이자 상담 질문지"라는 지시에 따라 선택지를 실제 행동 단위로 바꾸고(대조했다/보기만 했다/어디 있는지 모른다) 도움말에 조회처를 실명으로 넣었다(토지이음 eum.go.kr, 건축물대장 정부24).

업종별 근거 조문 — 2026-08-08 국가법령정보센터 원문 확인:
- 민법 제32조 (비영리법인의 설립과 허가) — 목적사업이 2개 이상 부처에 걸치면 각 주무관청 허가 모두 필요
- 산업집적활성화 및 공장설립에 관한 법률 제13조·제16조 — 제조시설 500㎡ 이상 승인 대상
- 물류시설의 개발 및 운영에 관한 법률 제21조의2 — 바닥면적 합계 1천㎡ 이상 등록 대상
- 식품위생법 제37조(영업허가)·제38조(취소 후 2년 제한)·제41조(영업 전 위생교육), 시행규칙 제36조 별표14(업종별 시설기준)
- 학원법 제6조 — **시설기준은 시행령 별표가 아니라 시·도 조례**. 초안이 "근거 법령의 별표"로 일반화했던 것을 이 확인으로 정정했다.
- 긴급 등급 근거: 민원 처리에 관한 법률 제22조(보완 요구), 행정절차법 제19조(처리기간의 설정·공표)
- 업종별 개별 법령은 유형 선택지의 `lawRef`에만 붙였다. 결격사유는 업종마다 기간·대상이 달라 선택지에 특정 조문을 달지 않고 도움말 예시로만 두었다.

### 작업 방식

주인님 지시로 codex-cli 0.146.0이 계획서대로 구현하고 Claude가 계획 대조·검증·커밋을 담당했다. **코덱스를 백그라운드로 띄울 때는 반드시 `< /dev/null`로 stdin을 닫아야 한다** — stdin이 파이프로 열려 있으면 `Reading additional input from stdin...` 상태로 19시간 멈춘 사례가 있다. 코덱스 샌드박스는 `.git` 쓰기가 막혀 커밋을 못 하므로 커밋은 Claude가 한다.

### 검증에서 잡아낸 결함 4건

1. `b0c460f` 불완전 커밋 — 12문항 개편 후 재생성한 `api/_check-levels.mjs` 스테이징 누락(Claude 실수). `b9f0237`로 보완.
2. 계획서 테스트가 `getByRole` 단일 조회 — `ServiceActions`가 상단·하단 2회 렌더되어 실패. 코덱스가 `getAllByRole`(length 2)로 교정.
3. 계획서 `.navbar__cta` 선택자 명시도가 `nav#global-nav a`보다 낮아 글자색이 덮여 대비 1.13:1. 코덱스가 `nav#global-nav .navbar__cta`로 구체화, Claude가 실측 5.67:1 확인.
4. `ServiceFlowSteps`가 `attribution ?? {}`를 넘겨 `readAttribution()` 세션 폴백 유실(Claude가 계획서에 쓴 코드의 결함). `95f9e15`로 보완.

### 테스트 수치 주의

`npm run test:run`은 gitignored `.claude/worktrees/admin-inquiry-system-e8017d/`의 낡은 사본 15파일을 중복 수집한다. 실측:
- 실제 저장소: **29파일 213테스트** (`npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"`)
- 중복 포함: 44파일 309테스트
과거 문서의 "42파일 289테스트" 등도 같은 중복을 포함한 값이었다. `vite.config.ts`에 `test.exclude` 설정이 필요하다.

### 커밋

`e24a564` permit 신설 → `b0c460f` 12문항 구체화 → `b9f0237` 검증정의 보완 → `ac10644` Task2·3 → `110e8f5` Task4 → `74630da` Task5·6 → `95f9e15` 결함 보완.
**push 미실행 — 주인님 승인 대기.** master push는 Vercel Production 자동 배포다.

## 2026-08-09 업무분야 동선 재정렬 Phase 2 (디자인·가독성)

Phase 1(구조)에 이은 두 번째 단계. 분야 상세 페이지를 "읽을 수 있는 문서"로 만드는 작업.

### 타이포 토큰

`tokens.css`에 5단계 스케일을 신설했다: `--fs-xs/sm/base/lg/xl` = 13/15/17/19/24px, `--lh-tight/snug/body` = 1.3/1.5/1.75. `app.css`에 산재하던 폰트 크기 **31곳**을 치환했다(계획서에는 30곳으로 적었으나 실제는 31곳, 치환표에는 모두 포함되어 누락 없음). 본문 기본값을 브라우저 기본 16px/1.65에서 **17px/1.75**로 올렸다 — 통지서를 들고 급하게 보는 이용층 고려.

**재발 방지 장치**: `designTokens.test.ts`가 `app.css`에 원시 `rem` 폰트 크기가 남아 있으면 실패한다. `clamp()`(뷰포트 연동 제목 4곳)만 예외. 앞으로 하드코딩을 추가하면 테스트가 잡는다.

### 본문 읽기 폭

분야 상세 본문이 `page-shell`(1120px) 안에서 1072px로 깔리던 것을 780px로 제한했다. **컨테이너가 아니라 텍스트 요소에만 걸었다** — 그래야 카드 그리드(`quick-check-grid`)와 `process-list`(auto-fit 그리드)가 1072px 전체 폭을 유지한다.

**수치 정정**: 설계 문서에 "780px = 한글 45~50자"라고 적었던 것은 글자 폭을 17px로 잡은 잘못된 추정이다. Range API로 실제 줄바꿈을 세어 보니 **53~56자**(제한 전 약 80자). 실제 글자당 약 13.7px — 공백·숫자·괄호가 섞이기 때문이다. 45~50자를 맞추려면 680px까지 줄여야 하는데 오른쪽에 440px 빈 공간이 생겨 780px를 유지하기로 했다.

### 섹션 3단 위계

10개 동급 섹션을 나눴다.
- **1단 결정적**: 법정 기한 — 상단으로 이동, 붉은 강조 카드(첫 h2)
- **2단 실행**: 조회·대상·절차·서류·준비 구분 (24.8px)
- **3단 참고**: 공식 출처 — 기본 접힘, 제목은 `<summary>` 안에 둬 접혀도 보인다 (19px)

**`<summary>` 안에 `h2`를 두는 것이 핵심이다.** `<summary>` 내용은 접혀도 항상 보이므로 `infoPages.test.tsx`의 `getByRole('heading', ...)` 조회가 통과한다.

**FAQ는 접지 않는다** — 계획서대로 바깥 `<details>`로 감쌌더니 접힌 상태에서 질문 3개가 전부 숨겨지고 답을 보기까지 클릭이 두 번 필요했다. 질문을 훑어 자기 상황을 찾는 것이 FAQ의 핵심 가치다. 바깥 접힘을 없애고 제목 무게만 19px(`.reference-heading`)로 낮췄다. 회귀 방지 테스트 `FAQ는 질문 목록이 보이도록 바깥으로 감싸지 않는다`를 뒀다.

### 모바일 문맥 CTA 바

설계 문서의 "모바일 하단 고정 CTA"를 **분야별 문맥 CTA**로 바꿨다(주인님 승인). Phase 1에서 sticky 상단 바에 상시 `상담 문의` 버튼이 생겨 범용 상담 CTA를 하단에 또 두면 중복이기 때문. 하단 바는 지금 보는 분야의 3단계 목적지를 보여준다 — 인허가는 `내 상황 진단 시작`→`/check/permit`, 비자는 `다국어 진단센터 열기`→외부, 문서는 `확인 목록 보기`→`#preparation-review`.

3단계 계산은 `lib/serviceNextStep.ts`의 `nextStepFor()`로 추출해 4단계 표시와 하단 바가 공유한다. 이 전환에서 Phase 1에 남아 있던 죽은 데이터(`ServiceFlowSteps`가 1단계에 쓰지도 않는 `#target`을 계산)를 제거하고, `href` 유무로 현재 단계를 판단하게 바꿔 `index === 0` 하드코딩도 없앴다.

**safe-area 주의**: 하단 바 높이는 `64px + env(safe-area-inset-bottom)`이다. 페이지 하단 여백을 고정값으로 두면 홈 인디케이터가 있는 기기에서 그 차이만큼 마지막 내용이 가려진다. `calc(88px + env(safe-area-inset-bottom))`을 써야 한다.

### 실측값 (2026-08-09)

| 항목 | Phase 2 전 | 후 |
|---|---|---|
| 본문 크기 / 줄간격 | 16px / 1.65 | 17px / 1.75 |
| 본문 문단 폭 / 줄당 글자 | 1072px / 약 80자 | 780px / 53~56자 |
| 하드코딩 폰트 크기 | 31곳 | 0곳 |
| grid-3 열 수 | 3 → 1 (768px) | 3 → 2 (1024px) → 1 (768px) |
| 분야 상세 같은 버튼 수 | 4개 | 3개 |
| 테스트 | 29파일 213 | **30파일 224** |

### 커밋

`495e760` 계획서 → `04ee720` Task1·2 → `cb9bc6f` Task3·4 → `b493175` Task5·6.
**push 미실행 — 주인님 승인 대기.**

## 2026-08-09 신규 로고 적용

주인님이 주신 신규 로고로 교체했다. 원본은 `D:\홈페이지\엠블럼, 로고\`에 있다 — `신규로고(가로형).png`(1108x383), `신규로고(세로형).png`(604x605), `신규로고.png`(심볼 단독 457x432). 셋 다 투명 배경이라 밝은 헤더와 어두운 배경 모두에 쓸 수 있다.

**웹용 자산은 원본에서 트림·리사이즈해 만들었다** (Python313 + PIL 사용. 프로젝트 Python에는 PIL이 없다):
- `logo-mark-128.png`(20KB) — 내비게이션 40px 표시용
- `logo-mark-64.png`(5KB) — 파비콘
- `og-image.png`(122KB) — 가로형 로고를 크림 배경 1200x630에 배치

**어느 로고를 어디에 쓰는지**: 내비게이션과 파비콘은 **심볼 단독**을 쓴다. 내비게이션에는 이미 사무소명이 텍스트로 있어 가로형을 쓰면 이름이 중복되고, 가로형을 40px 높이로 줄이면 영문 서브라인이 4px가 되어 읽히지 않는다. 가로형은 OG·썸네일처럼 로고만 단독으로 보이는 자리에 쓴다.

**정리한 것**: 옛 `logo.png`(293KB)·`logo_final.png`(305KB) 삭제. 파비콘이 293KB 원본 이미지였다. 전송량 598KB → 25KB.

**추가한 것**: `og:image`가 아예 없어 공유 시 미리보기가 비어 있었다. 신설하고 `twitter:card`를 `summary` → `summary_large_image`로 올렸다.

비자 사이트도 같은 자산으로 통일했다(같은 날짜 `jm-visa-check` 저장소 기록 참조).

커밋 `474e3d9` — push 미실행, 승인 대기.
