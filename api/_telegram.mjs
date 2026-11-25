// 사무소 Telegram 대화방으로 글을 보낸다 — 접수 알림(consult.js)과 아침 요약(cron-purge.js)이 함께 쓴다.

const TELEGRAM_TIMEOUT_MS = 10_000;

/** 실패 사유를 돌려준다(성공이면 null). 예외는 던지지 않는다. */
export async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return 'telegram_not_configured';
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      // 응답이 없으면 함수가 최대 실행시간까지 걸려 응답·로그가 남지 않는다.
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    return response.ok ? null : `telegram_http_${response.status}`;
  } catch {
    return 'telegram_network';
  }
}
