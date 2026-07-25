import { describeVisaDiagnosisAnswer } from '../data/visaDiagnosisLabels';

describe('관리자용 비자 진단 문항 표시', () => {
  it('개발자 ID를 사람이 읽을 한국어 문항·답변으로 바꾼다', () => {
    expect(describeVisaDiagnosisAnswer('e7Contract', 'partial')).toEqual({
      question: 'E-7 고용계약·업무 설명',
      answer: '일부 준비·확인',
    });
  });

  it('새 규격 값은 원 ID를 잃지 않고 대체 표시한다', () => {
    expect(describeVisaDiagnosisAnswer('futureQuestion', 'futureAnswer')).toEqual({
      question: 'futureQuestion',
      answer: 'futureAnswer',
    });
  });
});
