// 상담 준비 메모 — 행정사가 전화·회신 전에 한 화면에서 보는 내부용 정리(고객에게 보내지 않는다).
// 접수 답(진단·기한·비자 질문)과 업무 상세 페이지 내용(서류·절차·법정 기한·공식 확인처)을 한데 모은다.
// 홈페이지 /admin과 로컬 대기함(연동기 GET consultBrief)이 같은 메모를 쓴다.
// 원칙: 새 판단을 만들지 않는다. 고객이 진단 결과 화면에서 본 안내와 사이트에 게시한 내용만 옮긴다.
// 기한 날짜를 계산하지 않는다. 화면 번들에도 들어가므로 서버 전용 모듈을 가져오지 않는다.

import LABELS from './_reply-labels.mjs';
import { TOPIC_ROUTES, planReply } from './_reply-draft.mjs';
import { urgentReasons } from './_urgency.mjs';
import { matchesAnswers } from './_diagnosis-routing.mjs';

const LEVEL_ORDER = ['urgent', 'documents', 'official', 'ready'];
export const LEVEL_LABEL = LABELS.brief.levels;
const CASE_TYPE_LABEL = { driver_license: '운전면허 행정심판', business_suspension: '영업정지 행정심판' };

/** 저장 당시의 문항·선택지 이름을 쓴다. 이전 선택지에 현재 문항의 판단이나 등급을 붙이지 않는다. */
export function describeDiagnosis(diagnosis) {
  const domain = diagnosis?.domain;
  return Object.entries(diagnosis?.answers ?? {}).map(([key, value]) => {
    const current = LABELS.diagnosis[domain]?.[key];
    const previous = LABELS.previousDiagnosis[domain]?.[key];
    const legacy = Boolean(previous && Object.hasOwn(previous.options, value));
    const question = legacy ? previous : current;
    return {
      key, legacy, question: question?.text ?? '이전 점검 문항',
      answer: question && Object.hasOwn(question.options, value) ? question.options[value] : '선택 내용 확인 필요',
    };
  });
}

/**
 * 진단 답을 고객이 결과 화면에서 본 순서·문구로 되살린다(src/domain/diagnosis.ts classifyAnswers와 같은 규칙,
 * src/test/consultBrief.test.ts가 모든 진단에서 같은지 확인한다).
 */
export function classifyDiagnosis(diagnosis) {
  const def = LABELS.brief.checks[diagnosis?.domain];
  const labels = LABELS.diagnosis[diagnosis?.domain];
  if (!def || !labels) return [];
  const input = diagnosis.answers && typeof diagnosis.answers === 'object' ? diagnosis.answers : {};
  const answers = {};
  for (const question of def.questions) {
    if (matchesAnswers(question.showWhen, answers) && Object.hasOwn(question.options, input[question.id])) {
      answers[question.id] = input[question.id];
    }
  }
  const items = [];
  for (const question of def.questions) {
    const optionId = answers[question.id];
    const option = typeof optionId === 'string' ? question.options[optionId] : undefined;
    if (!option) continue;
    const override = def.overrides.find(
      (o) => o.questionId === question.id
        && Object.entries(o.when).every(([id, optionIds]) => optionIds.includes(answers[id])),
    );
    items.push({
      questionId: question.id,
      questionText: labels[question.id]?.text ?? question.id,
      answerLabel: labels[question.id]?.options[optionId] ?? optionId,
      level: option.level,
      note: override ? override.note : option.note,
      lawRef: override ? override.lawRef : option.lawRef,
    });
  }
  items.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
  return items;
}

function routeLine(topic) {
  const route = TOPIC_ROUTES[topic];
  if (!route) return '처리 경로: 연동 계약에 없는 분야 — 내용을 보고 직접 분류';
  if (route.route === 'case') {
    return `처리 경로: 회신 뒤 행정심판 사건으로 전환할 수 있는 분야(로컬 사건 유형: ${CASE_TYPE_LABEL[route.caseType] ?? route.caseType})`;
  }
  return '처리 경로: 회신으로 처리하는 분야(필요하면 위임 계약으로 진행)';
}

/**
 * @param {object} record 접수 레코드(홈페이지 접수) 또는 { topic } (전화·카카오톡·이메일 문의)
 * @returns {{ title: string, lines: string[] }[] | null} 파기된 접수·빈 값이면 null
 */
export function buildConsultBrief(record) {
  if (!record || typeof record !== 'object' || record.purged) return null;
  const topic = typeof record.topic === 'string' ? record.topic : '';
  const plan = planReply(record);
  const generalAppeal = plan?.template.domain === 'appeal';
  const info = plan?.template.serviceSlug ? LABELS.brief.specificServices[plan.template.serviceSlug]
    : generalAppeal ? undefined : LABELS.brief.topics[topic];
  const sections = [];

  // 1. 한눈에
  const serviceName = info && info.service !== topic ? ` (업무 안내: ${info.service})` : '';
  const summary = [`분야: ${generalAppeal ? '일반 행정심판' : topic || '미지정'}${serviceName}`,
    generalAppeal ? '처리 경로: 받은 통지와 신청 내용을 보고 사건 유형 확인' : routeLine(topic)];
  const reasons = urgentReasons(record);
  if (reasons.length > 0) {
    summary.push(`⏰ 기한 우선 — 근거: ${reasons.map((r) => LABELS.brief.urgentReasons[r] ?? r).join(' · ')}`);
  }
  if (record.deadlineReport && LABELS.brief.deadlineReport[record.deadlineReport]) {
    summary.push(`처분서·통지서 기한(고객 답, 증빙 전): ${LABELS.brief.deadlineReport[record.deadlineReport]}`);
  }
  const savedAnswers = describeDiagnosis(record.diagnosis);
  const previousForm = savedAnswers.some((entry) => entry.legacy);
  const diagnosisItems = record.diagnosis && !previousForm ? classifyDiagnosis(record.diagnosis) : [];
  if (diagnosisItems.length > 0) {
    const counts = LEVEL_ORDER.map((level) => [level, diagnosisItems.filter((i) => i.level === level).length])
      .filter(([, n]) => n > 0)
      .map(([level, n]) => `${LEVEL_LABEL[level]} ${n}`);
    summary.push(`셀프 진단(${LABELS.brief.checks[record.diagnosis.domain].title}): ${counts.join(' · ')}`);
  }
  if (record.visaDiagnosis && typeof record.visaDiagnosis === 'object') {
    const v = record.visaDiagnosis;
    summary.push(
      `비자 사전진단 첨부: ${String(v.visaSlug ?? '').toUpperCase()} · 답 ${v.questionCount ?? '?'}개`
      + `${v.level === 'urgent' ? ' · 긴급 확인 항목 있음' : ''} — 답은 접수 상세에서 확인`,
    );
  }
  sections.push({ title: '한눈에', lines: summary });

  // 2. 고객이 진단 결과 화면에서 본 안내(급한 것부터)
  if (diagnosisItems.length > 0) {
    sections.push({
      title: '고객이 셀프 진단에서 본 안내(급한 것부터)',
      lines: diagnosisItems.map(
        (i) => `[${LEVEL_LABEL[i.level]}] ${i.questionText} → ${i.answerLabel}: ${i.note}${i.lawRef ? ` (${i.lawRef})` : ''}`,
      ),
    });
  } else if (previousForm) {
    sections.push({ title: '이전 셀프 진단에 남긴 답변', lines: savedAnswers.map((e) => `${e.question} → ${e.answer}`) });
  } else if (plan && plan.recap.length > 0) {
    sections.push({ title: '고객이 이미 알려 준 것(증빙 전)', lines: plan.recap });
  }

  // 3. 통화·회신 때 물어볼 것 — 회신 초안의 질문과 같다(이미 받은 답은 빠짐)
  if (plan && plan.asks.length > 0) {
    sections.push({
      title: '통화·회신 때 물어볼 것',
      lines: plan.asks.map((a, i) => `${i + 1}) ${a.text}${a.deadline ? ' — 기한' : ''}`),
    });
  }

  // 4~7. 업무 상세 페이지에 게시한 내용
  if (info) {
    if (info.deadlines.length > 0) sections.push({ title: '법정 기한(사이트 게시 내용, 날짜는 서류로 확인)', lines: info.deadlines });
    if (info.documents.length > 0) sections.push({ title: '받아 둘 서류', lines: info.documents });
    if (info.review.length > 0) sections.push({ title: '행정사가 따져 볼 것', lines: info.review });
    if (info.process.length > 0) {
      sections.push({ title: '진행 순서', lines: info.process.map((step, i) => `${i + 1}. ${step}`) });
    }
    if (info.sources.length > 0) {
      sections.push({ title: '공식 확인처', lines: info.sources.map((s) => `${s.label} — ${s.url}`) });
    }
  }

  // 8. 내부 메모(연락 언어 등)
  if (plan && plan.notes.length > 0) sections.push({ title: '내부 메모', lines: plan.notes });
  return sections;
}

/** 복사·로컬 메모용 글자 형태. */
export function consultBriefText(sections) {
  if (!Array.isArray(sections)) return '';
  return sections
    .map((s) => [`■ ${s.title}`, ...s.lines.map((line) => `- ${line}`)].join('\n'))
    .join('\n\n');
}
