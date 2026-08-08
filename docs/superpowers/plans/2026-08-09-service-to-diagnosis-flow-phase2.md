# 업무분야 동선 재정렬 Phase 2 (디자인·가독성) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 분야 상세 페이지를 "읽을 수 있는" 문서로 만든다 — 본문 줄 길이를 절반으로 줄이고, 10개 동급 섹션에 3단 위계를 세우고, 산재한 폰트 크기 20종을 5단계 토큰으로 정리한다.

**Architecture:** `tokens.css`에 타이포 스케일을 신설하고 `app.css`의 하드코딩 폰트 크기 30곳을 토큰으로 치환한다. 본문 읽기 폭은 컨테이너가 아니라 텍스트를 담는 자식 요소에만 걸어, 카드 그리드와 4단계 표시는 전체 폭을 유지한다. 분야 상세의 3단계 목적지 계산은 `ServiceFlowSteps`에서 공용 함수로 추출해 새 모바일 하단 바와 공유한다.

**Tech Stack:** React 19 · react-router-dom 7 · TypeScript · Vite 8 · Vitest 4 · CSS custom properties

**설계 문서:** `docs/superpowers/specs/2026-08-07-service-to-diagnosis-flow-design.md`
**선행 작업:** Phase 1 완료·배포 (`e4383ab..a64d2d1`, 9커밋)

**베이스라인 (2026-08-09 실측):** 29파일 213테스트 통과, 작업 트리 깨끗함(`a64d2d1`)

---

## 사전 확인 사항

- `master` push는 Vercel Production 자동 배포다. **커밋은 로컬까지만, push는 Task 7 이후 승인을 받는다.**
- 테스트는 반드시 다음 형태로 실행한다. `.claude/worktrees/`에 낡은 사본이 있어 exclude 없이 돌리면 수치가 부풀려진다.
  ```
  npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"
  ```
- 배포 확인은 `curl`이 아니라 브라우저로 한다. Vercel 봇 차단(`X-Vercel-Mitigated: challenge`)이 `curl`을 403으로 막는다.
- 설계 문서 Phase 2 항목 7번(모바일 하단 고정 CTA)은 **분야별 문맥 CTA로 변경**한다(주인님 승인). Phase 1에서 sticky 상단 바에 상시 `상담 문의` 버튼이 생겨 범용 상담 CTA를 하단에 또 두면 중복이기 때문이다. 설계 문서가 적은 목적("긴 상세 페이지를 읽는 중에도 **다음 단계**가 항상 보이도록")은 문맥 CTA가 더 정확히 충족한다.

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/styles/tokens.css` | 타이포 스케일 토큰 신설 (수정) |
| `src/styles/app.css` | 토큰 치환·읽기 폭·위계·브레이크포인트·하단 바 (수정) |
| `src/lib/serviceNextStep.ts` | 분야별 다음 단계 계산 — 스텝 표시와 하단 바가 공유 (신설) |
| `src/components/ServiceFlowSteps.tsx` | 공용 함수 사용으로 전환 (수정) |
| `src/components/ServiceNextStepBar.tsx` | 모바일 하단 문맥 CTA 바 (신설) |
| `src/pages/ServicePage.tsx` | 섹션 위계 3단·CTA 정리·하단 바 배치 (수정) |
| `src/test/designTokens.test.ts` | 원시 폰트 크기 금지 검사 추가 (수정) |
| `src/test/serviceNextStep.test.ts` | 다음 단계 계산 검증 (신설) |

---

## Task 1: 타이포 토큰 신설과 치환

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/app.css` (font-size 31곳, body 1곳)
- Modify: `src/test/designTokens.test.ts`

- [ ] **Step 1: 실패하는 테스트를 추가한다**

`src/test/designTokens.test.ts`의 `describe` 블록 안, 기존 `it` 뒤에 다음을 추가한다.

```ts
  it('타이포 토큰이 정의되어 있다', () => {
    const tokens = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');
    for (const name of ['--fs-xs', '--fs-sm', '--fs-base', '--fs-lg', '--fs-xl', '--lh-tight', '--lh-snug', '--lh-body']) {
      expect(tokens, `${name} 없음`).toContain(`${name}:`);
    }
  });

  it('app.css에 하드코딩된 폰트 크기가 없다', () => {
    const css = readFileSync(join(__dirname, '../styles/app.css'), 'utf8');
    // clamp()는 뷰포트 연동 제목용이라 토큰화 대상이 아니다.
    const raw = css
      .split('\n')
      .map((line, i) => ({ line: line.trim(), no: i + 1 }))
      .filter(({ line }) => /font-size:\s*[0-9.]+rem/.test(line) && !line.includes('clamp('));
    expect(raw.map((r) => `${r.no}: ${r.line}`)).toEqual([]);
  });

  it('본문 기본 크기와 줄간격이 토큰을 쓴다', () => {
    const css = readFileSync(join(__dirname, '../styles/app.css'), 'utf8');
    expect(css).toMatch(/body\s*\{[^}]*font-size:\s*var\(--fs-base\)/);
    expect(css).toMatch(/body\s*\{[^}]*line-height:\s*var\(--lh-body\)/);
  });
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/designTokens.test.ts`
Expected: FAIL — `--fs-xs 없음`

- [ ] **Step 3: 토큰을 정의한다**

`src/styles/tokens.css`의 `--radius-sm: 8px;` 바로 위에 다음을 삽입한다.

```css
  /* 타이포 스케일 — 본문 17px 기준. 통지서를 들고 급하게 읽는 이용층을 고려해
     브라우저 기본 16px보다 한 단계 키우고 줄간격을 넓혔다. */
  --fs-xs: 0.8125rem;    /* 13px — 배지, 확인일, 번호, eyebrow */
  --fs-sm: 0.9375rem;    /* 15px — 보조 설명, note, 각주 */
  --fs-base: 1.0625rem;  /* 17px — 본문, 버튼 */
  --fs-lg: 1.1875rem;    /* 19px — 리드문, 소제목, legend */
  --fs-xl: 1.5rem;       /* 24px — 통계 수치, 강조 제목 */
  --lh-tight: 1.3;       /* 제목 */
  --lh-snug: 1.5;        /* 카드 제목, 촘촘한 목록 */
  --lh-body: 1.75;       /* 본문 */
```

- [ ] **Step 4: body 기본값을 바꾼다**

`src/styles/app.css:4`의 `body { ... }` 줄에서 `line-height: 1.65;`를 다음으로 교체하고 `font-size`를 추가한다. 수정 후 그 줄은 다음과 같다.

```css
body { font-family: 'Noto Sans KR', system-ui, sans-serif; background: var(--bg); color: var(--text); font-size: var(--fs-base); line-height: var(--lh-body); overflow-x: hidden; }
```

- [ ] **Step 5: 폰트 크기 31곳을 토큰으로 치환한다**

아래 표대로 `src/styles/app.css`의 모든 `font-size: <숫자>rem`을 치환한다. `clamp()`는 건드리지 않는다.

| 현재 값 | 해당 선택자 | 치환 |
|---|---|---|
| `0.75rem` | `.navbar__logo small` | `var(--fs-xs)` |
| `0.78rem` | `.service-card__number`, `.quick-check-card__label`, `.flow-steps__number` | `var(--fs-xs)` |
| `0.8rem` | `.eyebrow` | `var(--fs-xs)` |
| `0.84rem` | `.admin-funnel-step p`, `.official-source-list span` | `var(--fs-xs)` |
| `0.85rem` | `.badge-preopen`, `.footer__note`, `.law-ref` | `var(--fs-xs)` |
| `0.9rem` | `.preopen-banner`, `.guide-list span`, `.note`, `.flow-steps__intro`, `.navbar__cta`(모바일) | `var(--fs-sm)` |
| `0.95rem` | `.flow-steps__label`, `.navbar__cta` | `var(--fs-sm)` |
| `1rem` | `.button`, `.faq-list summary`, `.hero__intro`(모바일) | `var(--fs-base)` |
| `1.05rem` | `.navbar__logo`, `.quick-check-card h3` | `var(--fs-base)` |
| `1.06rem` | `.page-lead` | `var(--fs-lg)` |
| `1.08rem` | `.hero__intro`, `.consult-cta p` | `var(--fs-lg)` |
| `1.1rem` | `.footer__brand` | `var(--fs-lg)` |
| `1.13rem` | `h3` | `var(--fs-lg)` |
| `1.15rem` | `.question-card legend` | `var(--fs-lg)` |
| `1.4rem` | `.hero__guide h2` | `var(--fs-xl)` |
| `1.6rem` | `.admin-stat`, `.admin-funnel-step strong` | `var(--fs-xl)` |

`app.css:8`의 `h1, h2, h3 { line-height: 1.3; ... }`에서 `1.3`을 `var(--lh-tight)`로 바꾼다.
`app.css:503`의 `.quick-check-card h3 { ... line-height: 1.45; }`에서 `1.45`를 `var(--lh-snug)`로 바꾼다.

- [ ] **Step 6: 통과를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/designTokens.test.ts`
Expected: PASS — 4개 테스트 통과. 실패하면 출력에 남은 하드코딩 줄번호가 찍히므로 그 줄을 치환한다.

- [ ] **Step 7: 전체 테스트와 타입 검사**

Run: `npm run typecheck && npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"`
Expected: 타입 오류 0건, 29파일 216테스트 통과 (213 + 신규 3)

- [ ] **Step 8: 커밋하지 말고 보고한다**

커밋은 사람이 검증 후에 한다. 변경 파일 목록과 실제 테스트 출력을 보고한다.

---

## Task 2: 본문 읽기 폭 780px

**Files:**
- Modify: `src/styles/app.css` (파일 끝에 추가)

- [ ] **Step 1: 읽기 폭 규칙을 추가한다**

`src/styles/app.css` 파일 끝에 다음을 덧붙인다. 컨테이너가 아니라 텍스트를 담는 요소에만 걸어야 카드 그리드·4단계 표시·절차 그리드가 전체 폭을 유지한다.

```css
/* --- 본문 읽기 폭 ---
   .service-landing은 page-shell(1120px)을 쓰므로 문단이 1072px로 깔린다.
   텍스트 요소만 780px로 제한한다 — Range API 실측으로 줄당 53~56자
   (제한 전에는 약 80자였다).
   카드 그리드(quick-check-grid, preparation-grid, related-link-grid)와
   process-list(auto-fit 그리드), flow-steps는 제외해 전체 폭을 유지한다. */
.service-landing > section > p,
.service-landing > .card > p,
.service-landing > aside > p,
.service-landing .section-heading p,
.service-landing .page-lead,
.service-landing .check-list,
.service-landing .bullet-list,
.service-landing .faq-list details p { max-width: 780px; }
```

- [ ] **Step 2: 실제 렌더 폭을 확인한다**

Run: `npm run dev`

브라우저에서 `http://localhost:5173/services/dui`를 열고 개발자 콘솔에서 실행한다.

```js
JSON.stringify({
  본문문단: Math.round(document.querySelector('.service-landing > section > p')?.getBoundingClientRect().width ?? 0),
  체크리스트: Math.round(document.querySelector('.service-landing .check-list')?.getBoundingClientRect().width ?? 0),
  카드그리드: Math.round(document.querySelector('.quick-check-grid')?.getBoundingClientRect().width ?? 0),
  절차그리드: Math.round(document.querySelector('.process-list')?.getBoundingClientRect().width ?? 0),
})
```

Expected: 본문문단·체크리스트는 780 이하, 카드그리드·절차그리드는 1000 이상(전체 폭 유지)

- [ ] **Step 3: 보고한다**

측정값을 그대로 보고한다. 카드 그리드가 780으로 줄었다면 선택자가 과하게 걸린 것이므로 원인을 찾아 고친다.

---

## Task 3: 분야 상세 섹션 위계 3단

**Files:**
- Modify: `src/pages/ServicePage.tsx`
- Modify: `src/styles/app.css` (파일 끝에 추가)

목표: 10개 동급 섹션을 3단으로 나눈다.
1단(결정적) = 법정 기한 — 상단으로 이동, 가장 강한 시각 무게
2단(실행) = 먼저 확인할 항목 · 이런 분께 필요합니다 · 진행 절차 · 필요 서류 · 준비 구분
3단(참고) = 공식 기준·조회 경로 · 자주 묻는 질문 — 기본 접힘

- [ ] **Step 1: 실패하는 테스트를 추가한다**

`src/test/serviceFlowSteps.test.tsx`의 `describe('분야 상세의 단계 안내', ...)` 블록 안에 다음을 추가한다.

```tsx
  it('법정 기한이 있는 분야는 기한 섹션이 조회 카드보다 먼저 나온다', () => {
    renderPage('dui');
    const headings = [...document.querySelectorAll('h2')].map((h) => h.textContent ?? '');
    const deadline = headings.findIndex((t) => t.includes('법정 기한'));
    const quick = headings.findIndex((t) => t.includes('먼저 확인할 항목'));
    expect(deadline).toBeGreaterThanOrEqual(0);
    expect(deadline).toBeLessThan(quick);
  });

  it('공식 출처와 FAQ는 기본으로 접혀 있다', () => {
    renderPage('dui');
    const sources = document.querySelector('details.reference-section');
    expect(sources).not.toBeNull();
    expect((sources as HTMLDetailsElement).open).toBe(false);
    // 제목은 summary 안에 있어 접혀도 보인다.
    expect(screen.getByRole('heading', { name: /공식 기준·조회 경로/ })).toBeInTheDocument();
  });
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/serviceFlowSteps.test.tsx`
Expected: FAIL — `expected -1 to be greater than or equal to 0` 또는 `expected null not to be null`

- [ ] **Step 3: 법정 기한 섹션을 상단으로 옮긴다**

`src/pages/ServicePage.tsx`에서 `{service.deadlines && ( ... )}` 블록 전체를 잘라내어, `<header className="page-header">...</header>` 바로 뒤(= `<section aria-labelledby="quick-checks">` 앞)에 붙인다. 옮긴 블록은 다음과 같이 클래스를 바꾼다.

```tsx
      {service.deadlines && (
        <section className="card level-urgent deadline-callout" aria-labelledby="deadlines">
          <h2 id="deadlines">법정 기한 — 늦기 전에 확인하세요</h2>
          <p className="note">아래는 일반적인 기한입니다. 처분 종류·통지 방식·개별 사정에 따라 달라질 수 있으므로 처분서의 안내를 함께 확인하세요.</p>
          <ul className="bullet-list">{service.deadlines.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      )}
```

- [ ] **Step 4: 공식 출처를 접기로 바꾼다**

같은 파일의 공식 출처 섹션 전체를 다음으로 교체한다. 제목을 `<summary>` 안에 두어 접혀도 보이게 한다(기존 `infoPages.test.tsx`가 이 제목을 조회한다).

```tsx
      <details className="card official-source-card reference-section">
        <summary>
          <h2 id="official-sources">공식 기준·조회 경로</h2>
          <span className="reference-section__hint">{service.officialSources.length}건 · 펼쳐 보기</span>
        </summary>
        <p className="note">기준은 바뀔 수 있으므로 실제 신청 전 최신 공지와 받은 문서를 다시 확인해야 합니다.</p>
        <ul className="official-source-list">
          {service.officialSources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
              <span>확인일 {source.checkedAt}</span>
            </li>
          ))}
        </ul>
      </details>
```

- [ ] **Step 5: FAQ를 접기로 감싼다**

같은 파일의 FAQ 섹션을 다음으로 교체한다. 안쪽 개별 `<details>`는 그대로 둔다.

```tsx
      <details className="reference-section faq-section-wrap">
        <summary>
          <h2 id="faq">자주 묻는 질문</h2>
          <span className="reference-section__hint">{service.faqs.length}건 · 펼쳐 보기</span>
        </summary>
        <div className="faq-list">
          {service.faqs.map((faq) => (
            <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>
          ))}
        </div>
      </details>
```

- [ ] **Step 6: 위계 스타일을 추가한다**

`src/styles/app.css` 파일 끝에 다음을 덧붙인다.

```css
/* --- 분야 상세 3단 위계 ---
   1단 결정적(법정 기한): 상단 배치 + 가장 강한 무게
   2단 실행(절차·서류): 기본 섹션
   3단 참고(공식 출처·FAQ): 기본 접힘 */
.deadline-callout {
  border-left-width: 6px;
  background: #fdf6f4;
  margin-bottom: 8px;
}
.deadline-callout h2 { color: var(--danger); }

.reference-section {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 0;
}
.reference-section > summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  cursor: pointer;
  padding: 20px 26px;
  list-style: none;
}
.reference-section > summary::-webkit-details-marker { display: none; }
.reference-section > summary h2 { margin: 0; font-size: var(--fs-lg); }
.reference-section__hint { color: var(--text-muted); font-size: var(--fs-sm); font-weight: 700; }
.reference-section[open] > summary { border-bottom: 1px solid var(--border); }
.reference-section > :not(summary) { padding-left: 26px; padding-right: 26px; }
.reference-section > :not(summary):first-of-type { padding-top: 18px; }
.reference-section > :not(summary):last-child { padding-bottom: 22px; }
.reference-section.official-source-card { border-left: 4px solid var(--accent); }
.faq-section-wrap .faq-list { padding-bottom: 8px; }
```

- [ ] **Step 7: 통과를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/serviceFlowSteps.test.tsx src/test/infoPages.test.tsx src/test/accessibility.test.tsx`
Expected: PASS — 세 파일 모두 통과. `infoPages.test.tsx`가 `공식 기준·조회 경로` 제목을 찾는데 `summary` 안이라 접혀도 보인다.

- [ ] **Step 8: 전체 테스트**

Run: `npm run typecheck && npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"`
Expected: 타입 오류 0건, 29파일 218테스트 통과 (216 + 신규 2)

---

## Task 4: 태블릿 브레이크포인트

**Files:**
- Modify: `src/styles/app.css:47`

- [ ] **Step 1: 1024px 단계를 추가한다**

`src/styles/app.css:47`의 다음 줄을

```css
@media (max-width: 768px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }
```

다음 두 줄로 교체한다.

```css
/* 768px에서 곧바로 1열이 되면 태블릿에서 3열이 눌려 카드 글자가 좁아진다. */
@media (max-width: 1024px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: 세 폭에서 열 수를 확인한다**

`npm run dev` 상태에서 `http://localhost:5173/services`를 열고, 뷰포트를 1280 / 900 / 500으로 바꿔 가며 콘솔에서 실행한다.

```js
getComputedStyle(document.querySelector('.grid-3')).gridTemplateColumns.split(' ').length
```

Expected: 1280 → 3, 900 → 2, 500 → 1

- [ ] **Step 3: 측정값을 보고한다**

---

## Task 5: 상단 CTA 정리

**Files:**
- Modify: `src/pages/ServicePage.tsx`

- [ ] **Step 1: 실패하는 테스트를 추가한다**

`src/test/serviceFlowSteps.test.tsx`의 `describe('분야 상세의 단계 안내', ...)` 안에 추가한다.

```tsx
  it('상단에는 주 행동 하나만, 하단에는 둘을 둔다', () => {
    renderPage('dui');
    const top = document.querySelector('.service-actions--top')!;
    const bottom = document.querySelector('.service-actions--bottom')!;
    expect(top.querySelectorAll('a').length).toBe(1);
    expect(bottom.querySelectorAll('a').length).toBe(2);
  });
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/serviceFlowSteps.test.tsx`
Expected: FAIL — `expected 2 to be 1`

- [ ] **Step 3: 보조 버튼을 하단에만 둔다**

`src/pages/ServicePage.tsx`의 `ServiceActions` 안, 마지막 `<Link className="button button--ghost" ...>` 블록 전체를 다음으로 감싼다. 같은 버튼이 한 페이지에 4개 뜨던 것을 3개로 줄인다.

```tsx
      {location === 'bottom' && (
        <Link
          className="button button--ghost"
          to={`/consult?topic=${service.consultTopic}&priority=urgent`}
          onClick={track}
        >
          {service.deadlines ? '기한이 급하면 상담부터' : '내 상황을 상담으로 정리하기'}
        </Link>
      )}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/serviceFlowSteps.test.tsx src/test/infoPages.test.tsx`
Expected: PASS. `infoPages.test.tsx:54`는 `getAllByRole(...)[0]`을 쓰므로 1개만 남아도 통과한다.

---

## Task 6: 모바일 하단 문맥 CTA 바

**Files:**
- Create: `src/lib/serviceNextStep.ts`
- Create: `src/test/serviceNextStep.test.ts`
- Create: `src/components/ServiceNextStepBar.tsx`
- Modify: `src/components/ServiceFlowSteps.tsx`
- Modify: `src/pages/ServicePage.tsx`
- Modify: `src/styles/app.css` (파일 끝에 추가)

- [ ] **Step 1: 실패하는 테스트를 만든다**

`src/test/serviceNextStep.test.ts`를 새로 만든다.

```ts
import { nextStepFor } from '../lib/serviceNextStep';
import { findService } from '../data/services';

describe('분야별 다음 단계', () => {
  it('내부 진단이 있으면 진단 경로를 가리킨다', () => {
    const step = nextStepFor(findService('dui')!, {});
    expect(step.href).toBe('/check/dui');
    expect(step.external).toBe(false);
    expect(step.barLabel).toBe('내 상황 진단 시작');
  });

  it('인허가도 진단 경로를 가리킨다', () => {
    expect(nextStepFor(findService('license')!, {}).href).toBe('/check/permit');
  });

  it('비자는 외부 진단센터를 가리킨다', () => {
    const step = nextStepFor(findService('immigration')!, {});
    expect(step.external).toBe(true);
    expect(step.href).toContain('jm-visa-precheck');
    expect(step.barLabel).toBe('다국어 진단센터 열기');
  });

  it('진단이 없는 분야는 페이지 안 확인 목록을 가리킨다', () => {
    const step = nextStepFor(findService('documents')!, {});
    expect(step.href).toBe('#preparation-review');
    expect(step.stepLabel).toBe('상담 전 확인 목록');
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**" src/test/serviceNextStep.test.ts`
Expected: FAIL — `Failed to resolve import "../lib/serviceNextStep"`

- [ ] **Step 3: 공용 함수를 만든다**

`src/lib/serviceNextStep.ts`를 새로 만든다. `ServiceFlowSteps`에 있던 `diagnosisTarget`을 여기로 옮기고 하단 바용 짧은 라벨을 더한다.

```ts
import type { Service } from '../data/services';
import { attributedExternalUrl, type Attribution } from './funnel';
import { SERVICE_FLOW_STEPS } from '../data/serviceFlow';

export interface NextStep {
  /** 4단계 표시의 3단계 라벨 */
  stepLabel: string;
  /** 모바일 하단 바 버튼 라벨 — 좁은 화면을 위해 짧게 */
  barLabel: string;
  href: string;
  external: boolean;
}

/**
 * 분야의 3단계(진단) 목적지를 계산한다.
 * 내부 진단 → /check/:domain, 비자 → 외부 진단센터, 진단이 없는 분야 → 페이지 안 확인 목록
 */
export function nextStepFor(service: Service, attribution?: Attribution): NextStep {
  if (service.checkDomain) {
    return {
      stepLabel: SERVICE_FLOW_STEPS[2],
      barLabel: '내 상황 진단 시작',
      href: `/check/${service.checkDomain}`,
      external: false,
    };
  }
  if (service.externalLink) {
    return {
      stepLabel: SERVICE_FLOW_STEPS[2],
      barLabel: '다국어 진단센터 열기',
      // attribution을 그대로 넘긴다. 빈 객체를 넘기면 readAttribution() 폴백이 건너뛰어진다.
      href: attributedExternalUrl(service.externalLink.url, 'jm_main', attribution),
      external: true,
    };
  }
  return {
    stepLabel: '상담 전 확인 목록',
    barLabel: '확인 목록 보기',
    href: '#preparation-review',
    external: false,
  };
}
```

- [ ] **Step 4: ServiceFlowSteps를 공용 함수로 전환한다**

`src/components/ServiceFlowSteps.tsx`에서 `StepTarget` 인터페이스와 `diagnosisTarget` 함수를 삭제하고, 파일을 다음으로 교체한다.

```tsx
import { Link } from 'react-router-dom';
import type { Service } from '../data/services';
import type { Attribution } from '../lib/funnel';
import { nextStepFor } from '../lib/serviceNextStep';
import { FLOW_STEP_INTRO, SERVICE_FLOW_STEPS, VISA_EXTERNAL_NOTE } from '../data/serviceFlow';

// href가 없는 단계가 곧 현재 단계다. Phase 1에서는 1단계에 쓰이지 않는
// '#target'을 계산해 두고 버렸는데, 그 죽은 데이터를 없앤다.
interface StepTarget {
  label: string;
  href?: string;
  external?: boolean;
}

export function ServiceFlowSteps({
  service,
  attribution,
}: {
  service: Service;
  attribution?: Attribution;
}) {
  const diagnosis = nextStepFor(service, attribution);
  const steps: StepTarget[] = [
    { label: SERVICE_FLOW_STEPS[0] },
    { label: SERVICE_FLOW_STEPS[1], href: '#quick-checks' },
    { label: diagnosis.stepLabel, href: diagnosis.href, external: diagnosis.external },
    { label: SERVICE_FLOW_STEPS[3], href: `/consult?topic=${service.consultTopic}` },
  ];

  return (
    <nav className="flow-steps" aria-label="진행 단계">
      <p className="flow-steps__intro">{FLOW_STEP_INTRO}</p>
      <ol className="flow-steps__list">
        {steps.map((step, index) => (
          <li key={step.label} aria-current={step.href ? undefined : 'step'}>
            <span className="flow-steps__number" aria-hidden="true">{index + 1}</span>
            {!step.href ? (
              <span className="flow-steps__label">{step.label}</span>
            ) : step.external || step.href.startsWith('#') ? (
              <a className="flow-steps__label" href={step.href}>{step.label}</a>
            ) : (
              <Link className="flow-steps__label" to={step.href}>{step.label}</Link>
            )}
          </li>
        ))}
      </ol>
      {diagnosis.external && <p className="note flow-steps__note">{VISA_EXTERNAL_NOTE}</p>}
    </nav>
  );
}
```

- [ ] **Step 5: 하단 바 컴포넌트를 만든다**

`src/components/ServiceNextStepBar.tsx`를 새로 만든다.

```tsx
import { Link } from 'react-router-dom';
import type { Service } from '../data/services';
import type { Attribution } from '../lib/funnel';
import { nextStepFor } from '../lib/serviceNextStep';

/**
 * 모바일에서만 보이는 하단 고정 바.
 * 상단 sticky 바의 `상담 문의`와 겹치지 않도록 범용 상담이 아니라
 * 지금 보고 있는 분야의 다음 단계를 보여준다.
 */
export function ServiceNextStepBar({
  service,
  attribution,
}: {
  service: Service;
  attribution?: Attribution;
}) {
  const next = nextStepFor(service, attribution);
  const label = <span className="next-step-bar__field">{service.name}</span>;

  return (
    <div className="next-step-bar" role="complementary" aria-label="다음 단계 바로가기">
      {label}
      {next.external || next.href.startsWith('#') ? (
        <a className="button button--accent" href={next.href}>{next.barLabel}</a>
      ) : (
        <Link className="button button--accent" to={next.href}>{next.barLabel}</Link>
      )}
    </div>
  );
}
```

- [ ] **Step 6: 분야 상세에 배치한다**

`src/pages/ServicePage.tsx` 상단 import에 다음을 추가한다.

```tsx
import { ServiceNextStepBar } from '../components/ServiceNextStepBar';
```

같은 파일에서 최상위 `<div className="page-shell section service-landing">`의 닫는 `</div>` 바로 앞(= `<aside className="card service-next-step">...</aside>` 뒤)에 다음을 넣는다.

```tsx
      <ServiceNextStepBar service={service} attribution={attribution} />
```

- [ ] **Step 7: 하단 바 스타일을 추가한다**

`src/styles/app.css` 파일 끝에 다음을 덧붙인다.

```css
/* --- 모바일 하단 문맥 CTA 바 ---
   데스크톱은 4단계 표시가 화면에 함께 보이므로 필요 없다. 모바일에서만 띄운다. */
.next-step-bar { display: none; }
@media (max-width: 768px) {
  .next-step-bar {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    background: var(--surface);
    border-top: 1px solid var(--border);
    box-shadow: 0 -8px 24px -18px rgb(15 26 42 / 55%);
  }
  .next-step-bar__field {
    font-size: var(--fs-sm);
    font-weight: 700;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .next-step-bar .button { min-height: 44px; padding: 10px 16px; font-size: var(--fs-sm); flex: none; }
  /* 고정 바가 마지막 내용을 가리지 않도록 여백을 준다. */
  .service-landing { padding-bottom: 88px; }
}
```

- [ ] **Step 8: 통과를 확인한다**

Run: `npm run typecheck && npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"`
Expected: 타입 오류 0건, 30파일 223테스트 통과 (Task 5까지 219 + serviceNextStep 신규 4)

---

## Task 7: 전체 검증과 문서 갱신

**Files:**
- Modify: `checklist.md`
- Modify: `memory.md`

- [ ] **Step 1: 전체 검사**

Run: `npm run check`
Expected: typecheck 0건 → 테스트 → 빌드 → `verify:dist` 통과

- [ ] **Step 2: 브라우저 실측 — 데스크톱 1280px**

`npm run dev` 상태에서 `/services/dui`를 열고 콘솔에서 실행한다.

```js
JSON.stringify({
  본문폰트: getComputedStyle(document.body).fontSize,
  줄간격: getComputedStyle(document.body).lineHeight,
  본문폭: Math.round(document.querySelector('.service-landing > section > p').getBoundingClientRect().width),
  카드그리드폭: Math.round(document.querySelector('.quick-check-grid').getBoundingClientRect().width),
  기한섹션위치: [...document.querySelectorAll('h2')].map(h=>h.textContent.trim()).slice(0,3),
  접힘섹션: [...document.querySelectorAll('details.reference-section')].map(d=>d.open),
  상단CTA수: document.querySelector('.service-actions--top').querySelectorAll('a').length,
  하단바표시: getComputedStyle(document.querySelector('.next-step-bar')).display,
}, null, 1)
```

Expected: 본문폰트 17px, 줄간격 약 29.75px, 본문폭 ≤780, 카드그리드폭 ≥1000, 기한 섹션이 첫 h2, 접힘섹션 `[false, false]`, 상단CTA 1개, 하단바 `none`

- [ ] **Step 3: 브라우저 실측 — 모바일 375px**

뷰포트를 375px로 바꾸고 실행한다.

```js
JSON.stringify({
  하단바표시: getComputedStyle(document.querySelector('.next-step-bar')).display,
  하단바버튼: document.querySelector('.next-step-bar .button').textContent.trim(),
  하단바링크: document.querySelector('.next-step-bar .button').getAttribute('href'),
  가로오버플로: document.documentElement.scrollWidth > innerWidth,
  본문폭: Math.round(document.querySelector('.service-landing > section > p').getBoundingClientRect().width),
}, null, 1)
```

Expected: 하단바 `flex`, 버튼 `내 상황 진단 시작` → `/check/dui`, 가로 오버플로 `false`

- [ ] **Step 4: 브라우저 실측 — 태블릿 900px**

Run: 뷰포트 900px에서 `/services` 열고

```js
getComputedStyle(document.querySelector('.grid-3')).gridTemplateColumns.split(' ').length
```

Expected: `2`

- [ ] **Step 5: 네 분야에서 하단 바를 확인한다**

`/services/license`(내부 진단) · `/services/immigration`(외부) · `/services/documents`(앵커) · `/services/veterans`(내부 진단)를 375px에서 열어 하단 바 버튼 라벨과 링크가 분야마다 다른지 확인한다.

Expected: 각각 `내 상황 진단 시작 → /check/permit`, `다국어 진단센터 열기 → jm-visa-precheck…`, `확인 목록 보기 → #preparation-review`, `내 상황 진단 시작 → /check/veterans`

- [ ] **Step 6: `checklist.md`에 기록한다**

Phase 2 섹션을 추가하고 Task 1~7 상태, 실측값(폰트 크기·본문 폭·열 수·테스트 수)을 남긴다.

- [ ] **Step 7: `memory.md`에 기록한다**

다음을 포함한다.
- 타이포 토큰 5단계와 매핑 원칙(하드코딩 20종 → 5토큰), `designTokens.test.ts`가 원시 rem 폰트 크기를 금지한다는 것
- 본문 읽기 폭을 컨테이너가 아니라 텍스트 요소에만 건 이유(카드 그리드 보존)
- 3단 위계 구성과 `<summary>` 안에 `h2`를 둬야 접혀도 제목이 조회된다는 것
- 하단 바를 범용 상담이 아닌 분야별 문맥 CTA로 만든 이유(상단 sticky 바와 중복 회피)
- 최종 테스트 파일 수·테스트 수 실측값

- [ ] **Step 8: 배포 승인 요청**

`git log --oneline a64d2d1..HEAD`와 실측 결과를 보고하고 push 승인을 받는다. **승인 전에는 push하지 않는다.**

---

## 이 계획의 범위 제외

- 비자 진단 사이트 저장소의 시각 통일 (별도 작업)
- 문서 분야 진단 신설
- 콘텐츠 원문 재작성
- 개업 상태 전환(`CONSULT_OPEN`), 실제 사무소 정보 게시
- `.claude/worktrees/` 중복 테스트 수집 문제 (별도 작업으로 분리됨)
