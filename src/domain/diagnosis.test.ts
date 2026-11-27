import { checkPath, classifyAnswers, summarize, LEVEL_ORDER } from './diagnosis';
import { checks } from '../data/checks';

describe('진단 분류', () => {
  it('답변한 선택지의 분류·안내·법령을 결과 항목으로 만든다', () => {
    const answers = { 'dui-disposition': 'revoke', 'dui-elapsed': 'd61to90' };
    const result = classifyAnswers(checks.dui, answers);
    const urgent = result.items.filter((i) => i.level === 'urgent');
    expect(urgent).toHaveLength(1);
    expect(urgent[0].lawRef).toBe('행정심판법 제27조');
    expect(urgent[0].questionText).toContain('통지서');
  });

  it('결과는 urgent → documents → official → ready 순으로 정렬된다', () => {
    const answers = {
      'dui-disposition': 'suspend',   // ready
      'dui-elapsed': 'over90',        // urgent
      'dui-livelihood': 'commute',
      'dui-evidence': 'partial',      // documents
      'dui-refusal': 'yes',           // official
    };
    const result = classifyAnswers(checks.dui, answers);
    const levels = result.items.map((i) => i.level);
    const sorted = [...levels].sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
    expect(levels).toEqual(sorted);
    expect(new Set(levels)).toEqual(new Set(LEVEL_ORDER));
  });

  it('존재하지 않는 질문·선택지 답변은 무시한다', () => {
    const result = classifyAnswers(checks.dui, { 'fake-question': 'x', 'dui-bac': 'not-an-option' });
    expect(result.items).toHaveLength(0);
  });

  it('이의신청·행정심판 진행 여부에 따라 처분 통지 후 기한 안내와 등급이 바뀐다', () => {
    const elapsedOf = (procedure: string, elapsed = 'over90') =>
      classifyAnswers(checks.dui, { 'dui-disposition': 'revoke', 'dui-elapsed': elapsed, 'dui-procedure': procedure }).items.find((i) => i.questionId === 'dui-elapsed')!;

    expect(elapsedOf('no').note).toContain('원칙적으로 행정심판 청구 기한이 지났습니다');
    for (const procedure of ['objection', 'objection-result']) {
      const item = elapsedOf(procedure);
      expect(item.note).toContain('결과를 통보받은 날부터 90일');
      expect(item.note).not.toContain('기한이 지났습니다');
      expect(item.lawRef).toBe('도로교통법 제94조');
    }
    // 결과를 기다리는 중이면 처분 통지일로 센 날짜는 급하지 않고, 결과를 받았으면 결과 수령일부터 확인해야 한다.
    expect(elapsedOf('objection').level).toBe('ready');
    expect(elapsedOf('objection-result').level).toBe('urgent');
    expect(elapsedOf('no').level).toBe('urgent');
    // 이미 행정심판을 청구했으면 청구 기한은 지난 일이다 — 접수증·위원회 문서를 챙긴다.
    expect(elapsedOf('appeal').level).toBe('documents');
    expect(elapsedOf('appeal-done').level).toBe('documents');
    expect(elapsedOf('appeal').note).toContain('청구한 날을 기준');
    expect(elapsedOf('objection', 'd31to60').note).not.toContain('이의신청 기한(60일)이 임박');
    // 이의신청 결과를 받은 사람은 처분 통지일을 몰라도·받지 않았다고 해도 결과 통보일 기준으로 안내한다.
    for (const elapsed of ['within30', 'd31to60', 'd61to90', 'over90', 'unknown']) {
      const note = elapsedOf('objection-result', elapsed).note;
      expect(note, elapsed).toContain('결과를 통보받은 날부터 90일');
      expect(note, elapsed).toContain('결과 전에 이미 행정심판을 청구한 경우는 제외');
      expect(note, elapsed).not.toContain('통지서 수령일부터 확인');
    }
    expect(elapsedOf('objection-result', 'none').note).toContain('받은 문서가 처분 통지서인지 결과 통지서인지');
    expect(elapsedOf('objection-result', 'none').note).toContain('결과 전에 이미 행정심판을 청구한 경우는 제외');
    // 결과를 기다리는 중이면 30일 이내는 두 기한이 모두 남아 있어 원래 안내를 쓴다.
    expect(elapsedOf('objection', 'within30').note).toBe(checks.dui.questions.find((q) => q.id === 'dui-elapsed')!.options.find((o) => o.id === 'within30')!.note);
  });

  it('이의신청 안내는 결과 전에 행정심판을 먼저 청구하면 90일 특례가 아니라고 함께 알린다', () => {
    const procedure = checks.dui.questions.find((q) => q.id === 'dui-procedure')!;
    expect(procedure.options.find((o) => o.id === 'objection')!.note).toContain('특례는 적용되지 않습니다');
    expect(procedure.options.find((o) => o.id === 'objection-result')!.note).toContain('이미 행정심판을 청구했다면 이 특례가 아니고');
    const pending = classifyAnswers(checks.dui, { 'dui-disposition': 'revoke', 'dui-elapsed': 'over90', 'dui-procedure': 'objection' }).items.find((i) => i.questionId === 'dui-elapsed')!;
    expect(pending.note).toContain('이 특례는 적용되지 않습니다');
  });

  it('혈중알코올농도 선택지는 0.03% 이상을 빈틈·겹침 없이 나누고, 0.1%는 감경 제외 구간이 아니다', () => {
    const bac = checks.dui.questions.find((q) => q.id === 'dui-bac')!;
    expect(bac.options.find((o) => o.id === 'below003')?.label).toBe('0.03% 미만');
    const bands = bac.options.filter((o) => !['below003', 'unknown'].includes(o.id)).map((o) => {
      const match = o.label.match(/^([\d.]+)% (이상|초과)(?: ~ ([\d.]+)% (미만|이하))?$/);
      expect(match, `${o.label} 형식`).not.toBeNull();
      const [, low, lowKind, high, highKind] = match!;
      return {
        id: o.id,
        has: (v: number) =>
          (lowKind === '이상' ? v >= Number(low) : v > Number(low)) &&
          (high === undefined || (highKind === '미만' ? v < Number(high) : v <= Number(high))),
      };
    });
    const bandOf = (v: number) => bands.filter((b) => b.has(v)).map((b) => b.id);
    expect(bandOf(0.03)).toEqual(['low']);
    expect(bandOf(0.0799)).toEqual(['low']);
    expect(bandOf(0.08)).toEqual(['mid']);
    expect(bandOf(0.1)).toEqual(['mid']);
    expect(bandOf(0.1001)).toEqual(['over01']);
    expect(bandOf(0.2)).toEqual(['over01']);
    // 옛 'high'(0.1% 이상)는 뜻이 달라 다시 쓰지 않는다 — 옛 답이 새 구간으로 잘못 읽히지 않게.
    expect(bac.options.map((o) => o.id)).not.toContain('high');
  });

  it('최근 5년 음주 전력·인적 피해 사고는 이의신청 감경 제외로 안내하고 "처음"으로 묶지 않는다', () => {
    const options = (id: string) => checks.dui.questions.find((q) => q.id === id)!.options;
    expect(options('dui-history').find((o) => o.id === 'none')!.label).not.toContain('처음');
    for (const option of [...options('dui-history').filter((o) => ['once', 'multi'].includes(o.id)), options('dui-accident').find((o) => o.id === 'injury')!]) {
      expect(option.note).toContain('이의신청 감경 제외 사유입니다');
      expect(option.note).not.toMatch(/수 있습니다|가능성이/);
    }
  });

  it('보완 요구가 없거나 장소가 미정이면 관련 날짜·건물에 답할 필요가 없다', () => {
    const stale = { 'permit-address': 'notyet', 'permit-stage': 'reviewing', 'permit-supplement-deadline': 'soon', 'permit-building': 'flagged' };
    const path = checkPath(checks.permit, stale);
    expect(path.answers).toEqual({ 'permit-address': 'notyet', 'permit-stage': 'reviewing' });
    expect(path.questions.map((q) => q.id)).not.toContain('permit-site-advice');
    expect(classifyAnswers(checks.permit, stale).items.some((i) => i.level === 'urgent')).toBe(false);
    const active = checkPath(checks.permit, { ...stale, 'permit-stage': 'supplement' });
    expect(active.answers['permit-supplement-deadline']).toBe('soon');
  });

  it('사망 관련 보훈 신청은 현재 몸 상태를 묻지 않고, 조사 중인 영업장은 확정 처분 기한을 묻지 않는다', () => {
    const veterans = checkPath(checks.veterans, { 'vet-event': 'death', 'vet-stage': 'before' }).questions.map((q) => q.id);
    expect(veterans).toContain('vet-records');
    expect(veterans).not.toContain('vet-current');
    expect(veterans).not.toContain('vet-elapsed');
    const suspension = checkPath(checks.suspension, { 'susp-stage': 'investigating' }).questions.map((q) => q.id);
    expect(suspension).not.toContain('susp-opinion-deadline');
    expect(suspension).not.toContain('susp-elapsed');
    expect(suspension).not.toContain('susp-execution');
  });

  it('요약은 분야와 분류별 개수를 담는다', () => {
    const answers = { 'dui-disposition': 'revoke', 'dui-elapsed': 'over90', 'dui-livelihood': 'commute', 'dui-evidence': 'none' };
    const summary = summarize(checks.dui, classifyAnswers(checks.dui, answers));
    expect(summary.domain).toBe('dui');
    expect(summary.counts.urgent).toBe(1);
    expect(summary.counts.documents).toBe(1);
  });
});
