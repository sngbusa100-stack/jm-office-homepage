# 상담 접수 → 텔레그램 알림 설계

- 작성일: 2026-07-11
- 승인: 사용자가 대화에서 추천안 승인 ("추천한대로 진행")

## 구조

```
방문자 폼 제출 (개업 후 활성화)
  → Vercel 서버리스 함수 POST /api/consult
  → 검증(허니팟·필수값) 후 텔레그램 sendMessage
  → 주인님 텔레그램으로 즉시 알림 (챗 ID는 Vercel 환경변수 TELEGRAM_CHAT_ID에만 저장)
  → 주인님이 D:\gogo 지포 봇으로 초안 보좌 받아 직접 회신
```

## 결정 사항

1. **봇이 방문자에게 직접 응답하지 않는다.** AI는 주인님 보좌 전용, 고객 회신은 항상 사람이 한다 (법적·품질 리스크 차단).
2. **플랫폼: Vercel** — GitHub 계정 연동 가능, 정적 사이트와 API를 한 프로젝트로 배포 가능, vercel.json 기존재.
3. **봇 토큰은 지포 봇 재사용** — 서버리스에서 sendMessage(발신)만 하므로 로컬 봇의 long-polling과 충돌 없음. 토큰·챗 ID는 Vercel 환경변수에만 저장, 코드·커밋에 미포함.
4. **스팸 방어**: 허니팟 필드(company) — 채워져 있으면 조용히 성공으로 응답하고 폐기. CORS는 github.io·localhost·vercel.app 출처만 허용.
5. **개업 전 상태 유지**: office.json isOpen=false 동안 폼은 계속 비활성. formEndpoint만 미리 기입해 개업 시 isOpen 전환만으로 작동.
6. **개인정보처리방침**: 폼 활성화 시점의 수집 항목·전송 경로(HTTPS→사무소 텔레그램 알림)·위탁(Vercel·Telegram, 국외)·파기(회신 후) 명시를 지금 미리 반영.

## 파일

- `api/consult.js` — Vercel 함수 (POST, OPTIONS)
- `api/_validate.mjs` — 순수 검증·메시지 포맷 (테스트 대상)
- `api/_validate.test.mjs` — 단위 테스트
- `src/lib/consultSubmit.ts` — 프런트 제출 헬퍼 (fetch, sent/error)
- `src/pages/ConsultPage.tsx` — 실제 제출 로직·전송 상태 표시·허니팟
- `src/test/consultSubmitFlow.test.tsx` — 개업 상태 모킹 후 제출 흐름 검증
- `src/pages/PrivacyPage.tsx` — 수집·위탁 고지 구체화
- `vercel.json` — /api 제외 SPA 재작성

## 범위 제외

- 접수 DB 저장(텔레그램 수신함이 기록 역할), 이메일 병행 발송, 자동 응답 챗봇, 요금·결제
