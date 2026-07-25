const SCHEMA_VERSION = 1;
const HANDOFF_PREFIX = 'visa-handoff:';
const HANDOFF_TTL_SECONDS = 30 * 60;

const COMMON = {
  stayStatus: ['overseas', 'valid', 'near-expiry', 'expired', 'unsure'],
  violationStatus: ['none', 'past', 'current', 'unsure'],
};

const TAX = {
  taxStatus: ['clear', 'issue', 'unsure'],
};

export const VISA_QUESTION_OPTIONS = {
  d2: {
    ...COMMON,
    d2Admission: ['confirmed', 'pending', 'missing', 'unsure'],
    d2Program: ['confirmed', 'unsure'],
    d2Finance: ['ready', 'partial', 'missing', 'unsure'],
  },
  d10: {
    ...COMMON,
    d10Path: ['job-search', 'startup', 'unsure'],
    d10Qualification: ['confirmed', 'partial', 'missing', 'unsure'],
    d10Plan: ['ready', 'partial', 'missing'],
  },
  e7: {
    ...COMMON,
    e7Occupation: ['confirmed', 'unsure', 'unknown'],
    e7Contract: ['ready', 'partial', 'missing'],
    e7Wage: ['meets', 'below', 'unsure'],
  },
  f27: {
    ...COMMON,
    ...TAX,
    f27CurrentStatus: ['confirmed', 'unsure', 'unknown'],
    f27Points: ['confirmed', 'partial', 'not-checked', 'unsure'],
    f27Income: ['confirmed', 'partial', 'missing', 'unsure'],
  },
  f5: {
    ...COMMON,
    ...TAX,
    f5Track: ['confirmed', 'unsure', 'unknown'],
    f5Stay: ['confirmed', 'not-checked', 'unsure'],
    f5Livelihood: ['ready', 'partial', 'missing', 'unsure'],
    f5Integration: ['confirmed', 'partial', 'not-checked', 'unsure'],
  },
  f6: {
    ...COMMON,
    ...TAX,
    f6Marriage: ['registered', 'preparing', 'unsure'],
    f6Household: ['2', '3', '4', '5', '6', '7', '8plus', 'unsure'],
    f6Income: ['meets', 'needs-calculation', 'below', 'unsure'],
    f6Communication: ['ready', 'partial', 'missing', 'unsure'],
    f6Housing: ['ready', 'partial', 'missing', 'unsure'],
  },
};

const NEEDS_DOCUMENTS = new Set([
  'pending',
  'partial',
  'missing',
  'not-checked',
  'preparing',
  'needs-calculation',
]);
const OFFICIAL_CHECK = new Set([
  'unsure',
  'unknown',
  'below',
  'issue',
  'past',
  'current',
  'near-expiry',
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
  const expectedQuestionIds = Object.keys(definitions);
  const providedQuestionIds = Object.keys(input.answers);
  if (
    providedQuestionIds.length !== expectedQuestionIds.length
    || !expectedQuestionIds.every((questionId) => providedQuestionIds.includes(questionId))
  ) return null;

  const answers = {};
  for (const questionId of expectedQuestionIds) {
    const answer = input.answers[questionId];
    if (typeof answer !== 'string' || !definitions[questionId].includes(answer)) return null;
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
