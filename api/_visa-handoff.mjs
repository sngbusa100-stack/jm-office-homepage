import contract from './_visa-handoff-contract.json' with { type: 'json' };

const SCHEMA_VERSION = 1;
const HANDOFF_PREFIX = 'visa-handoff:';
const HANDOFF_TTL_SECONDS = 30 * 60;

export const VISA_QUESTION_OPTIONS = contract.questions;

const LEGACY_HISTORY = ['none', 'past', 'current', 'unsure'];

const NEEDS_DOCUMENTS = new Set([
  'pending',
  'partial',
  'missing',
  'not-checked',
  'preparing',
  'needs-calculation',
  'not-started',
]);
const OFFICIAL_CHECK = new Set([
  'unsure',
  'unknown',
  'below',
  'issue',
  'past',
  'current',
  'near-expiry',
  'amount-known',
  'program-known',
  'dates-known',
  'advised-outside',
]);
const LEVEL_PRIORITY = {
  checked: 0,
  'needs-documents': 1,
  'official-check': 2,
  urgent: 3,
};
const LANGUAGES = ['ko', 'en', 'zh', 'vi', 'ja'];

function classify(answers) {
  let level = 'checked';
  for (const [questionId, answer] of Object.entries(answers)) {
    const candidate = questionId === 'stayStatus' && answer === 'expired'
      ? 'urgent'
      : NEEDS_DOCUMENTS.has(answer)
        ? 'needs-documents'
        : OFFICIAL_CHECK.has(answer)
          ? 'official-check'
          : 'checked';
    if (LEVEL_PRIORITY[candidate] > LEVEL_PRIORITY[level]) level = candidate;
  }
  return level;
}

/** 비자 사이트가 보낸 답변을 비자별 문항·선택지와 완전 대조한다. */
export function sanitizeVisaHandoff(input) {
  if (typeof input !== 'object' || input === null || input.consent !== true) return null;
  if (input.schemaVersion !== SCHEMA_VERSION) return null;
  const visaSlug = typeof input.visaSlug === 'string' ? input.visaSlug : '';
  const definitions = VISA_QUESTION_OPTIONS[visaSlug];
  if (!definitions || typeof input.answers !== 'object' || input.answers === null) return null;
  // 이미 열린 화면·발급된 토큰의 옛 문항도 처리하되 그 답의 의미를 바꾸지 않는다.
  const options = Object.hasOwn(input.answers, 'violationStatus') && !Object.hasOwn(input.answers, 'stayHistory')
    ? Object.fromEntries(Object.entries(definitions).map(([key, values]) =>
      key === 'stayHistory' ? ['violationStatus', LEGACY_HISTORY] : [key, values]))
    : definitions;
  const expectedQuestionIds = Object.keys(options);
  const providedQuestionIds = Object.keys(input.answers);
  if (
    providedQuestionIds.length !== expectedQuestionIds.length
    || !expectedQuestionIds.every((questionId) => providedQuestionIds.includes(questionId))
  ) return null;

  const answers = {};
  for (const questionId of expectedQuestionIds) {
    const answer = input.answers[questionId];
    if (typeof answer !== 'string' || !options[questionId].includes(answer)) return null;
    answers[questionId] = answer;
  }

  const language = LANGUAGES.includes(input.language) ? input.language : 'ko';
  return {
    schemaVersion: SCHEMA_VERSION,
    visaSlug,
    language,
    answers,
    level: classify(answers),
    questionCount: expectedQuestionIds.length,
    consent: true,
  };
}

async function command(cfg, cmd, fetchImpl) {
  const response = await fetchImpl(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  });
  if (!response.ok) throw new Error(`redis_http_${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(`redis_${data.error}`);
  return data.result;
}

export function createVisaHandoffStore(cfg, fetchImpl = fetch) {
  const key = (token) => `${HANDOFF_PREFIX}${token}`;
  return {
    async save(token, value) {
      const result = await command(
        cfg,
        ['SET', key(token), JSON.stringify(value), 'NX', 'EX', String(HANDOFF_TTL_SECONDS)],
        fetchImpl,
      );
      if (result !== 'OK') throw new Error('handoff_collision');
    },
    async consume(token) {
      const raw = await command(cfg, ['GETDEL', key(token)], fetchImpl);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
  };
}
