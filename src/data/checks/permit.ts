import type { CheckDefinition } from '../../types/content';

export const permit: CheckDefinition = {
  domain: 'permit',
  title: '인허가 신청 사전 점검',
  intro: '어떤 인허가가 필요한지, 요건과 관할은 확인되었는지, 보완·반려에 대응할 준비가 되었는지 정리합니다. 결과는 일반 정보이며 허가 여부에 대한 판단이 아닙니다.',
  questions: [
    {
      id: 'permit-type',
      text: '어떤 인허가를 준비하고 계신가요?',
      options: [
        { id: 'corporation', label: '법인 · 사단법인 설립', level: 'ready', note: '설립 허가는 목적사업에 따라 주무관청이 나뉩니다. 정관과 사업계획서의 목적사업부터 정리하세요.' },
        { id: 'factory', label: '공장 등록 · 설립 승인', level: 'official', note: '공장은 입지(용도지역)와 업종 제한을 함께 봅니다. 소재지 관할 시·군·구의 기준을 확인하세요.' },
        { id: 'business', label: '영업 허가 · 등록 · 신고', level: 'ready', note: '업종마다 근거 법령과 요건이 다릅니다. 하려는 영업의 정확한 명칭부터 확인하세요.' },
        { id: 'other', label: '기타 또는 아직 모름', level: 'official', note: '인허가 명칭이 특정되지 않으면 요건 확인이 시작되지 않습니다. 하려는 사업과 시설 위치를 한 문장으로 정리하세요.' },
      ],
    },
    {
      id: 'permit-stage',
      text: '지금 어느 단계인가요?',
      options: [
        { id: 'reviewing', label: '알아보는 중', level: 'ready', note: '가장 여유 있는 단계입니다. 요건을 먼저 확인하면 보완 요구를 줄일 수 있습니다.' },
        { id: 'preparing', label: '서류 준비 중', level: 'documents', note: '구비서류 목록을 관할 기관 기준으로 확정한 뒤 수집하는 것이 순서입니다.' },
        { id: 'submitted', label: '신청서를 제출함', level: 'official', note: '처리기간과 보완 요구 여부를 확인할 시점입니다. 접수증과 담당 부서를 확인해 두세요.' },
        { id: 'supplement', label: '보완 요구를 받음', level: 'urgent', note: '보완 요구에는 정해진 기한이 있습니다. 요구서에 적힌 기한과 보완 항목을 지금 확인하세요.', lawRef: '민원 처리에 관한 법률 제22조' },
        { id: 'rejected', label: '반려됨', level: 'official', note: '반려 사유를 해소하지 않고 다시 신청하면 같은 사유로 반려될 수 있습니다. 반려 통지서 원문을 확보하세요.' },
      ],
    },
    {
      id: 'permit-authority',
      text: '관할 기관을 확인하셨나요?',
      options: [
        { id: 'confirmed', label: '담당 부서까지 확인함', level: 'ready', note: '관할이 확정되면 구비서류와 처리기간도 그 기관 기준으로 확인할 수 있습니다.' },
        { id: 'guessing', label: '대략만 알고 있음', level: 'official', note: '같은 인허가도 사업장 소재지와 규모에 따라 관할이 갈립니다. 담당 부서까지 특정하세요.' },
        { id: 'unknown', label: '모름', level: 'official', note: '관할 기관을 모르면 요건 확인이 시작되지 않습니다. 정부24 또는 사업장 소재지 시·군·구에서 확인하세요.' },
      ],
    },
    {
      id: 'permit-location',
      text: '사업장 위치와 용도지역을 확인하셨나요?',
      help: '같은 업종도 용도지역과 건축물 용도에 따라 가능 여부가 달라집니다.',
      options: [
        { id: 'checked', label: '확인함', level: 'ready', note: '입지 요건을 넘었다면 시설·인력 요건 확인으로 넘어갈 수 있습니다.' },
        { id: 'contracted', label: '계약은 했지만 확인은 안 함', level: 'official', note: '입지 제한에 걸리면 계약을 되돌리기 어렵습니다. 건축물대장과 용도지역을 지금 조회하세요.' },
        { id: 'notyet', label: '아직 정하지 않음', level: 'ready', note: '위치를 정하기 전에 용도지역 기준을 확인하면 선택 폭이 넓어집니다.' },
      ],
    },
    {
      id: 'permit-facility',
      text: '시설 · 장비 기준을 확인하셨나요?',
      options: [
        { id: 'meets', label: '확인했고 충족함', level: 'ready', note: '기준 충족을 보여줄 도면·사진·계약서를 신청 서류와 함께 정리해 두세요.' },
        { id: 'partial', label: '일부만 갖춤', level: 'documents', note: '부족한 항목 목록을 만들어 신청 전에 갖출 수 있는 것부터 처리하세요.' },
        { id: 'unknown', label: '기준을 모름', level: 'official', note: '시설 기준은 근거 법령의 별표에 있는 경우가 많습니다. 관할 기관에 기준표를 요청하세요.' },
      ],
    },
    {
      id: 'permit-staff',
      text: '자격증 · 경력을 갖춘 인력이 필요한 인허가인가요?',
      options: [
        { id: 'secured', label: '필요하고 확보함', level: 'ready', note: '자격증 사본과 재직·고용 관계 증빙을 함께 준비하세요.' },
        { id: 'needed', label: '필요하지만 아직 없음', level: 'documents', note: '인력 요건은 채용에 시간이 걸립니다. 신청 일정과 함께 계획하세요.' },
        { id: 'none', label: '필요 없음', level: 'ready', note: '인력 요건이 없다면 시설·입지 요건에 집중할 수 있습니다.' },
        { id: 'unknown', label: '모름', level: 'official', note: '업종에 따라 필수 인력 기준이 있습니다. 근거 법령의 요건을 확인하세요.' },
      ],
    },
    {
      id: 'permit-disqualification',
      text: '대표자 · 법인의 결격사유를 확인하셨나요?',
      help: '많은 인허가는 일정한 전과나 행정처분 이력을 결격사유로 정하고 있습니다.',
      options: [
        { id: 'checked', label: '확인했고 해당 없음', level: 'ready', note: '결격사유가 없다면 신청 요건의 큰 장애물은 넘은 것입니다.' },
        { id: 'possible', label: '해당될 수 있음', level: 'official', note: '결격사유는 기간 제한이 붙는 경우가 많습니다. 해당 조항과 기산일을 확인해야 합니다.' },
        { id: 'unknown', label: '확인하지 않음', level: 'official', note: '결격사유는 신청 후 발견되면 반려로 이어집니다. 근거 법령의 결격사유 조항을 먼저 확인하세요.' },
      ],
    },
    {
      id: 'permit-supplement-deadline',
      text: '보완 요구를 받았다면 기한은 어떻게 되나요?',
      help: '행정기관은 보완이 필요하면 상당한 기간을 정해 보완을 요구합니다.',
      options: [
        { id: 'remaining', label: '아직 기한이 남음', level: 'documents', note: '보완 항목별로 필요한 서류를 정리해 기한 안에 제출할 준비를 하세요.' },
        { id: 'soon', label: '3일 이내로 임박', level: 'urgent', note: '보완 기한이 임박했습니다. 지금 바로 보완 항목과 제출 방법을 확인해야 합니다.', lawRef: '민원 처리에 관한 법률 제22조' },
        { id: 'passed', label: '이미 지남', level: 'urgent', note: '보완 기한이 지나면 신청이 종결 처리될 수 있습니다. 관할 기관에 처리 상태를 즉시 확인하세요.', lawRef: '민원 처리에 관한 법률 제22조' },
        { id: 'na', label: '해당 없음', level: 'ready', note: '보완 요구가 오면 기한부터 확인할 수 있도록 접수증과 담당자 연락처를 보관해 두세요.' },
      ],
    },
    {
      id: 'permit-rejection',
      text: '이전에 반려 · 불허를 받은 적이 있나요?',
      options: [
        { id: 'none', label: '없음', level: 'ready', note: '첫 신청이라면 사전 검토로 반려 사유를 줄이는 것이 가장 효과적입니다.' },
        { id: 'hasdoc', label: '있고 통지서를 갖고 있음', level: 'documents', note: '반려 사유 원문이 다음 신청의 출발점입니다. 사유별로 해소 방법을 정리하세요.' },
        { id: 'nodoc', label: '있지만 통지서가 없음', level: 'official', note: '반려 사유를 모르면 같은 결과가 반복될 수 있습니다. 관할 기관에 처분 문서를 다시 요청하세요.' },
      ],
    },
    {
      id: 'permit-opening',
      text: '사업 개시 예정일까지 얼마나 남았나요?',
      help: '행정청은 처분의 처리기간을 종류별로 미리 정해 공표합니다.',
      options: [
        { id: 'over3m', label: '3개월 이상', level: 'ready', note: '요건 검토와 서류 준비에 여유가 있습니다. 사전 검토를 먼저 하세요.' },
        { id: 'm1to3', label: '1 ~ 3개월', level: 'official', note: '보완 요구가 있으면 기간이 늘어납니다. 공표된 처리기간을 확인해 일정을 잡으세요.' },
        { id: 'within1m', label: '1개월 이내', level: 'urgent', note: '공표된 처리기간보다 개시 예정일이 빠를 수 있습니다. 관할 기관의 처리기간을 지금 확인하세요.', lawRef: '행정절차법 제19조' },
        { id: 'undecided', label: '아직 정하지 않음', level: 'ready', note: '처리기간을 먼저 확인한 뒤 개시일을 정하면 무리한 일정을 피할 수 있습니다.' },
      ],
    },
  ],
};
