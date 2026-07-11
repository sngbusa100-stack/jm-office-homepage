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
