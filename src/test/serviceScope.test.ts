import { services } from '../data/services';
import { why } from '../data/why';

// 행정심판 청구 대리는 행정사 업무(행정사법 제2조①)에 없다. 대리인은 행정심판법 제18조①이 정한 사람뿐이다.
// 문구가 '대리'로 읽히지 않고, 행정심판을 다루는 분야에는 대리 범위 안내가 있는지 고정한다(보고서 2-1 1번).
describe('행정심판 업무 범위 표기', () => {
  const appealServices = services.filter((service) => ['dui', 'suspension'].includes(service.slug));

  it('행정심판을 다루는 분야가 모두 검사 대상에 있다', () => {
    expect(appealServices.map((service) => service.slug).sort()).toEqual(['dui', 'suspension']);
  });

  it.each(['dui', 'suspension'])('%s 분야 FAQ가 심리 출석·진술 대리는 제18조 대리인만 할 수 있다고 안내한다', (slug) => {
    const service = services.find((item) => item.slug === slug)!;
    const answer = service.faqs.map((faq) => faq.a).join('\n');
    expect(answer).toContain('행정심판법 제18조');
    expect(answer).toMatch(/심리 출석·진술/);
  });

  it('진행 절차의 마지막 단계는 서류 작성·제출과 결과 확인으로 적는다', () => {
    for (const service of appealServices) {
      expect(service.process.at(-1)).toBe('보충서면 등 제출 서류 작성·제출 대행과 재결 결과 확인');
    }
  });

  it('행정사 비교 설명은 불복 절차 자체가 아니라 그 서류 작성과 제출을 행정사 영역으로 적는다', () => {
    expect(why.comparison.note).toContain('신청·불복 절차의 서류 작성과 제출');
  });
});
