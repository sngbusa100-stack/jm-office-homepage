# 정명 행정사사무소 홈페이지 (jungmyungoffice.com)

사무소 안내, 3분 셀프 진단, 온라인 상담 접수, 접수 관리 화면(`/admin`)이 들어 있다.

- 기술: Vite + React + TypeScript(화면), Vercel 서버 함수(`api/`), Upstash(접수 저장), 텔레그램(알림)
- 배포: GitHub `jm-office-homepage`의 master에 푸시하면 Vercel이 운영에 바로 올린다. **커밋·푸시·배포는 주인님 승인 뒤에만 한다.**
- 지금 상태와 주의할 점: `memory.md` / 할 일: `checklist.md` / 개업 절차: `docs/go-live-runbook.md`

## 실행

```powershell
npm ci
npm run dev      # 개발 화면
npm run check    # 형식 검사 + 시험 + 빌드 + 배포본 검사. 고친 뒤에는 항상 이것을 돌린다
```

## 폴더

| 위치 | 무엇 |
|---|---|
| `src/data/` | **내용의 원본.** 사무소 정보·개업 스위치(`office.json`), 업무(`services.ts`), 업무분야 5개(`serviceAreas.ts`), 진단(`checks/`), 대표 소개(`profile.ts`), 처리방침(`privacyPolicy.ts`) |
| `src/pages/`, `src/components/` | 화면 |
| `src/lib/` | 주소별 제목·설명·sitemap(`pageMeta.ts`), 상담 전송, 통계 |
| `src/app/AppRouter.tsx` | 주소와 화면을 잇는 표 |
| `src/prerender/`, `scripts/prerender.mjs` | 빌드 때 검색용 HTML을 미리 만든다 |
| `src/test/`, `api/*.test.mjs` | 시험 |
| `api/` | 서버 함수. 밑줄 없는 파일이 주소(`consult`, `admin`, `connector`, `visa-handoff`, `funnel`, `cron-purge`), 밑줄로 시작하는 파일은 그 부품 |
| `scripts/` | 빌드 전후 검사, 개업 점검(`go-live-check`), 만들어지는 파일 생성기(`gen-*.ts`), 다른 저장소로 계약 복사(`sync-*`), 시험용 서버 |
| `public/` | 그대로 복사되는 파일 |
| `docs/` | 설계·계획·점검 문서(날짜가 이름 앞에 붙는다). `docs/history/`는 접어 둔 옛 기록 |
| `legacy/` | 2026-01 옛 사이트. 운영 빌드에 들어가지 않는다. 고치지 않는다 |

## 기능을 붙이거나 뺄 때 손댈 곳

빠뜨리면 `npm run check`가 알려 주도록 시험이 걸려 있다. 아래 순서대로 고치고 검사를 돌린다.

| 하려는 일 | 고칠 곳 |
|---|---|
| 문구 고치기 | 해당 `src/data/*.ts` 또는 화면 파일 → `pageMeta.ts`의 `PAGE_UPDATED_AT`에서 그 주소 날짜 |
| 고정 페이지 추가·삭제 | `src/pages/`에 화면 → `AppRouter.tsx` → `pageMeta.ts`(`STATIC_META`, `PAGE_UPDATED_AT`) → `vercel.json` rewrites 한 줄 |
| 업무 상세 페이지 추가·삭제 | `src/data/services.ts` → `serviceAreas.ts`의 `serviceSlugs` → `PAGE_UPDATED_AT` → `vercel.json` rewrites 한 줄 |
| 셀프 진단 추가·삭제 | `src/data/checks/<이름>.ts`와 `checks/index.ts` → `src/types/content.ts`의 `CheckDomain` → `npx vite-node scripts/gen-check-levels.ts`, `gen-reply-labels.ts` → `PAGE_UPDATED_AT` → `vercel.json` rewrites 한 줄 |
| 상담 접수 항목 추가·삭제 | 화면(`src/pages/ConsultPage.tsx`) → 검사(`api/_validate.mjs`) → 저장(`api/_store.mjs`) → `npm run contract:inquiry` → `npm run sync:inquiry-contract`(로컬 행정심판 시스템 사본) → 처리방침의 수집 항목 |
| 사무소 정보·개업 상태 | `src/data/office.json` 하나. `npm run go-live:check`로 확인 |
| 외부 자원(스크립트·글꼴·지도) 넣기 | `vercel.json`의 `Content-Security-Policy` 값도 함께 |
| 쓰면 안 되는 표현 목록 | `scripts/forbidden-phrases.mjs` |

직접 고치지 않는 파일: `api/_check-levels.mjs`, `api/_reply-labels.mjs`, `api/_inquiry-contract.json`(위 명령으로 다시 만든다).

## 다른 저장소와 이어진 곳

- 비자 진단센터(`D:\홈페이지\행정사 비자진단 홈페이지`): `api/_visa-handoff-contract.json`이 원본이고 `npm run sync:visa-contract`로 그쪽에 복사한다. `scripts/pre-open-phrases.mjs`는 두 저장소에 같은 내용으로 있어야 한다.
- 로컬 행정심판 시스템(`D:\행정사\1-행정심판`): `api/connector.js`로 접수를 가져간다. 접수 항목 계약은 `npm run sync:inquiry-contract`로 복사한다.
