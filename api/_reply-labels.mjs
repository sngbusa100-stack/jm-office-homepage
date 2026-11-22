// scripts/gen-reply-labels.ts가 생성한 파일 — 직접 편집하지 마세요.
export default {
  "office": {
    "name": "정명 행정사사무소",
    "representative": "정재훈",
    "phone": "02-899-1849",
    "email": "jungmyungoffice@naver.com"
  },
  "diagnosis": {
    "permit": {
      "permit-type": {
        "text": "어떤 인허가를 받으려고 하시나요?",
        "options": {
          "corporation": "비영리법인 · 사단법인 설립 허가",
          "factory": "공장 설립승인 · 공장등록",
          "warehouse": "창고 · 물류시설 등 시설 인허가",
          "business": "음식점 · 학원 등 영업 허가 · 등록 · 신고",
          "unknown": "어떤 인허가가 필요한지 모르겠다"
        }
      },
      "permit-kind": {
        "text": "받으려는 것이 허가 · 등록 · 신고 · 승인 중 무엇인지 확인하셨나요?",
        "options": {
          "withlaw": "종류와 근거 조항까지 확인했다",
          "nameonly": "이름만 알고 근거 조항은 모른다",
          "never": "구분해 본 적 없다"
        }
      },
      "permit-authority": {
        "text": "신청서를 낼 기관과 담당 부서를 확인하셨나요?",
        "options": {
          "contacted": "기관 · 부서 · 담당자 연락처까지 확인했다",
          "agencyonly": "기관은 알지만 담당 부서는 모른다",
          "none": "어디로 가야 할지 모른다"
        }
      },
      "permit-address": {
        "text": "사업장 주소가 정해졌나요?",
        "options": {
          "candidate": "후보지만 정했고 계약 전이다",
          "contracted": "이미 임대차 · 매매 계약을 했다",
          "owned": "자가 부동산이라 장소는 확정이다",
          "notyet": "아직 정하지 않았다",
          "na": "해당 없음 (장소 요건이 없는 인허가)"
        }
      },
      "permit-zoning": {
        "text": "그 주소의 용도지역과 건축물 용도를 확인하셨나요?",
        "options": {
          "ok": "둘 다 확인했고 하려는 업종이 가능하다",
          "unsure": "확인은 했지만 가능한지 판단이 안 선다",
          "notchecked": "확인하지 않았다",
          "na": "해당 없음 (장소 요건이 없는 인허가)"
        }
      },
      "permit-building": {
        "text": "건축물대장에 위반건축물 표시가 있는지 확인하셨나요?",
        "options": {
          "clean": "확인했고 표시가 없다",
          "flagged": "위반건축물로 표시되어 있다",
          "notchecked": "확인하지 않았다",
          "na": "해당 없음 (건물을 쓰지 않는 인허가)"
        }
      },
      "permit-facility": {
        "text": "시설 기준표를 받아 내 시설과 항목별로 대조해 보셨나요?",
        "options": {
          "matched": "항목별로 대조했고 모두 충족한다",
          "gap": "대조했더니 부족한 항목이 있다",
          "seenonly": "기준은 봤지만 내 시설과 대조는 안 했다",
          "nowhere": "기준표가 어디 있는지 모른다",
          "na": "해당 없음 (시설 기준이 없는 인허가)"
        }
      },
      "permit-staff": {
        "text": "사람에 대한 요건(자격증 · 교육 이수 · 필수 인력)을 확인하셨나요?",
        "options": {
          "ready": "요건을 확인했고 모두 갖췄다",
          "pending": "요건은 알지만 아직 갖추지 못했다",
          "noneneeded": "사람에 대한 요건이 없다",
          "unknown": "있는지 없는지 모른다"
        }
      },
      "permit-disqualification": {
        "text": "대표자 · 법인에게 결격사유가 있는지 확인하셨나요?",
        "options": {
          "clear": "결격사유 조항을 보고 해당 없음을 확인했다",
          "maybe": "해당될 수 있는 이력이 있다",
          "notchecked": "확인하지 않았다"
        }
      },
      "permit-stage": {
        "text": "지금 어느 단계인가요?",
        "options": {
          "reviewing": "알아보는 중이다",
          "preparing": "서류를 준비하고 있다",
          "submitted": "신청서를 내고 결과를 기다린다",
          "supplement": "보완 요구를 받았다",
          "rejectedwithdoc": "반려됐고 통지서를 갖고 있다",
          "rejectednodoc": "반려됐는데 통지서가 없다"
        }
      },
      "permit-supplement-deadline": {
        "text": "보완 요구를 받으셨다면 기한이 얼마나 남았나요?",
        "options": {
          "remaining": "아직 여유가 있다",
          "soon": "3일 이내로 임박했다",
          "passed": "기한이 이미 지났다",
          "na": "보완 요구를 받은 적 없다"
        }
      },
      "permit-opening": {
        "text": "사업 개시(개업 · 가동) 예정일까지 얼마나 남았나요?",
        "options": {
          "over3m": "3개월 이상 남았다",
          "m1to3": "1 ~ 3개월 남았다",
          "within1m": "1개월 이내다",
          "undecided": "아직 정하지 않았다"
        }
      }
    },
    "suspension": {
      "susp-business": {
        "text": "어떤 업종을 운영하고 계신가요?",
        "options": {
          "restaurant": "음식점 · 주점",
          "karaoke": "노래방 · 게임장",
          "academy": "학원 · 교습소",
          "other": "기타"
        }
      },
      "susp-stage": {
        "text": "처분이 어느 단계에 있나요?",
        "options": {
          "prenotice": "사전통지(의견제출 기간 중)",
          "confirmed": "처분 확정 통지를 받음",
          "investigating": "아직 조사 중"
        }
      },
      "susp-opinion-deadline": {
        "text": "의견제출 기한은 어떻게 되나요?",
        "options": {
          "remaining": "아직 기한이 남음",
          "soon": "3일 이내로 임박",
          "passed": "이미 지남",
          "na": "해당 없음"
        }
      },
      "susp-elapsed": {
        "text": "확정 처분 통지를 받은 지 얼마나 되었나요?",
        "options": {
          "within30": "30일 이내",
          "d30to60": "30일 ~ 60일",
          "d60to90": "60일 ~ 90일",
          "over90": "90일이 지남",
          "na": "해당 없음"
        }
      },
      "susp-reason": {
        "text": "처분 사유는 무엇인가요?",
        "options": {
          "youth": "청소년 주류 · 유해물 제공",
          "hygiene": "위생 · 시설 기준 위반",
          "unlicensed": "무허가 · 변경 미신고",
          "other": "기타"
        }
      },
      "susp-count": {
        "text": "같은 위반으로 처분받은 것은 몇 번째인가요?",
        "options": {
          "first": "최초(1차)",
          "second": "2차",
          "third": "3차 이상"
        }
      },
      "susp-livelihood": {
        "text": "이 영업이 생계에 어느 정도 비중을 차지하나요?",
        "options": {
          "only": "유일한 생계수단",
          "main": "주요 수입원",
          "side": "부수입"
        }
      },
      "susp-execution": {
        "text": "영업정지 집행 일정은 어떻게 되나요?",
        "options": {
          "imminent": "시작일이 지정됨 · 임박",
          "notyet": "아직 시작 전",
          "ongoing": "이미 정지 중"
        }
      },
      "susp-evidence": {
        "text": "소명에 쓸 증빙(CCTV · 신분증 확인 기록 등)은 준비되어 있나요?",
        "options": {
          "ready": "있음",
          "partial": "일부만 있음",
          "none": "없음"
        }
      },
      "susp-fine": {
        "text": "영업정지를 과징금으로 전환하는 제도를 알고 계신가요?",
        "options": {
          "known": "알고 있고 검토를 원함",
          "unknown": "모름"
        }
      }
    },
    "dui": {
      "dui-disposition": {
        "text": "어떤 처분을 받으셨나요?",
        "options": {
          "suspend": "면허 정지",
          "revoke": "면허 취소",
          "pending": "아직 통지 전 · 조사 중",
          "unknown": "모름"
        }
      },
      "dui-bac": {
        "text": "적발 당시 혈중알코올농도 구간은 어디였나요?",
        "options": {
          "low": "0.03% 이상 ~ 0.08% 미만",
          "mid": "0.08% 이상 ~ 0.1% 이하",
          "over01": "0.1% 초과",
          "unknown": "모름"
        }
      },
      "dui-elapsed": {
        "text": "처분(결정) 통지서를 받은 지 얼마나 되었나요?",
        "options": {
          "none": "아직 통지서를 받지 않음",
          "within30": "30일 이내",
          "d30to60": "30일 ~ 60일",
          "d60to90": "60일 ~ 90일",
          "over90": "90일이 지남",
          "unknown": "모름"
        }
      },
      "dui-procedure": {
        "text": "이의신청 또는 행정심판을 이미 진행 중인가요?",
        "options": {
          "no": "아니오",
          "objection": "이의신청을 하고 결과를 기다리는 중",
          "objection-result": "이의신청 결과를 통보받음",
          "appeal": "행정심판 진행 중"
        }
      },
      "dui-livelihood": {
        "text": "운전이 생계에 어느 정도 필요한가요?",
        "options": {
          "job": "운전이 직업(화물·버스·택시 등)",
          "work": "업무상 반드시 필요",
          "commute": "통근·일상용",
          "no": "꼭 필요하진 않음"
        }
      },
      "dui-history": {
        "text": "최근 5년 내 음주운전 이력이 있나요?",
        "options": {
          "none": "최근 5년 안에는 없음 (그 전 전력은 있을 수 있음)",
          "once": "1회 있음",
          "multi": "2회 이상"
        }
      },
      "dui-accident": {
        "text": "적발 당시 사고가 있었나요?",
        "options": {
          "none": "사고 없음",
          "property": "물적 피해 사고",
          "injury": "인적 피해 사고"
        }
      },
      "dui-refusal": {
        "text": "음주 측정을 거부했나요?",
        "options": {
          "no": "아니오",
          "yes": "예"
        }
      },
      "dui-evidence": {
        "text": "감경 주장에 쓸 증빙 서류는 준비되어 있나요?",
        "options": {
          "ready": "대부분 준비됨",
          "partial": "일부만 있음",
          "none": "없음"
        }
      },
      "dui-criminal": {
        "text": "형사 절차(벌금·재판)는 어떻게 진행 중인가요?",
        "options": {
          "none": "아직 진행 없음",
          "investigating": "경찰·검찰 조사 중",
          "trial": "약식명령 · 재판 중",
          "done": "종결(벌금 납부 등)"
        }
      }
    },
    "veterans": {
      "vet-applicant": {
        "text": "누구를 위한 신청인가요?",
        "options": {
          "self": "본인",
          "family": "가족 · 유족"
        }
      },
      "vet-type": {
        "text": "어떤 유형으로 신청하려 하시나요?",
        "options": {
          "combat": "전상 · 공상 군경",
          "died": "순직 관련",
          "compensation": "보훈보상대상자",
          "unknown": "모름"
        }
      },
      "vet-stage": {
        "text": "현재 진행 단계는 어디인가요?",
        "options": {
          "before": "아직 신청 전",
          "reviewing": "신청 후 심사 중",
          "rejected": "비해당 결정을 받음",
          "appealing": "재심의 · 행정심판 검토 중"
        }
      },
      "vet-elapsed": {
        "text": "비해당 결정 통지를 받은 지 얼마나 되었나요?",
        "options": {
          "na": "해당 없음",
          "within30": "30일 이내",
          "d30to90": "30일 ~ 90일",
          "over90": "90일이 지남"
        }
      },
      "vet-connection": {
        "text": "공무 관련성을 입증할 자료(병상일지 · 사고경위서 등)가 있나요?",
        "options": {
          "yes": "있음",
          "partial": "일부만 있음",
          "none": "없음",
          "unsure": "무엇이 필요한지 모름"
        }
      },
      "vet-records": {
        "text": "의무기록(군 병원 · 민간 진료 기록)은 확보하셨나요?",
        "options": {
          "yes": "확보함",
          "partial": "일부만 있음",
          "none": "없음"
        }
      },
      "vet-current": {
        "text": "현재 상이 · 치료 상태를 보여줄 기록이 있나요?",
        "options": {
          "yes": "있음",
          "none": "없음"
        }
      },
      "vet-history": {
        "text": "과거에 등록 신청을 한 적이 있나요?",
        "options": {
          "first": "이번이 처음",
          "once": "기각 1회",
          "multi": "기각 2회 이상"
        }
      },
      "vet-consult": {
        "text": "보훈(지)청에 상담한 적이 있나요?",
        "options": {
          "yes": "있음",
          "none": "없음"
        }
      }
    }
  },
  "visa": {
    "requester": {
      "question": "누구의 일",
      "options": {
        "self": "제 비자 문제입니다",
        "family-sponsor": "한국에 사는 가족(배우자 등)을 초청하거나 함께 살려고 합니다",
        "company": "회사에서 외국인 직원을 채용하거나 관리합니다",
        "other": "그 밖의 사람(지인 등)입니다"
      }
    },
    "staffCount": {
      "question": "처리할 직원 수",
      "options": {
        "1": "1명",
        "2-5": "2~5명",
        "6plus": "6명 이상"
      }
    },
    "stayStatus": {
      "question": "체류 상태",
      "options": {
        "overseas": "현재 해외에 있음",
        "valid": "한국에 있음 · 체류기간이 유효함",
        "near-expiry": "한국에 있음 · 만료가 임박함(약 2개월 이내, 사무소 안내 기준)",
        "expired": "한국에 있음 · 이미 만료됨",
        "unsure": "잘 모르겠음"
      }
    },
    "expiryDate": {
      "question": "체류기간 만료일"
    },
    "currentStatus": {
      "question": "현재 체류자격",
      "options": {
        "visa-free-short": "비자 없이 입국(무비자) 또는 짧은 방문(C-3·C-4)",
        "study": "유학·어학연수(D-2·D-4)",
        "job-seeking": "구직(D-10)",
        "work": "취업(E-7·E-9·H-2 등)",
        "family-residence": "결혼·거주·동포·영주(F-2·F-4·F-5·F-6)",
        "other": "그 밖의 자격(코드 직접 입력)",
        "unsure": "잘 모르겠음",
        "declined": "답하지 않음"
      }
    },
    "currentStatusCode": {
      "question": "현재 체류자격 코드"
    },
    "goal": {
      "question": "하려는 일",
      "options": {
        "first-entry": "처음 한국에 오기(비자 받기·초청)",
        "extend": "지금 체류기간 늘리기(연장)",
        "change": "다른 체류자격으로 바꾸기(변경)",
        "permanent": "영주(F-5) 또는 귀화",
        "family": "가족을 초청하거나 함께 지내기",
        "unsure": "잘 모르겠음"
      }
    },
    "desiredStatusCode": {
      "question": "원하는 체류자격"
    },
    "targetMonth": {
      "question": "목표 시점"
    },
    "stage": {
      "question": "진행 단계",
      "options": {
        "not-applied": "아직 신청 전",
        "waiting": "신청하고 결과를 기다리는 중",
        "supplement": "서류를 더 내라는 요청(보완)이나 출석 요청을 받음",
        "denied": "허가되지 않았다(불허)는 결과를 받음",
        "departure-notice": "출국하라는 안내(출국기한·출국명령)를 받음",
        "appeal-ongoing": "행정심판이나 소송을 이미 하고 있음",
        "unsure": "잘 모르겠음"
      }
    },
    "receivedDate": {
      "question": "받은 날짜"
    },
    "deadlineDate": {
      "question": "문서에 적힌 마감일"
    },
    "violation": {
      "question": "출입국 관련 기록",
      "options": {
        "none": "없음",
        "past": "예전에 있었고 끝남",
        "current": "지금 해결되지 않은 문제가 있음",
        "unsure": "잘 모르겠음"
      }
    },
    "language": {
      "question": "연락 언어",
      "options": {
        "ko": "한국어",
        "en": "English",
        "zh": "中文",
        "vi": "Tiếng Việt",
        "ja": "日本語",
        "other": "그 밖의 언어"
      }
    },
    "languageOther": {
      "question": "그 밖의 언어"
    },
    "nationality": {
      "question": "국적"
    }
  },
  "brief": {
    "topics": {
      "인허가": {
        "service": "인허가 대리",
        "deadlines": [],
        "documents": [
          "사업계획서",
          "정관·임원 명부(법인)",
          "시설·입지 관련 증빙",
          "자격·경력 증빙"
        ],
        "process": [
          "요건·입지·결격 사유 사전 검토",
          "필요 서류 목록 확정과 수집",
          "신청서 작성·제출 대리",
          "보완 요구 대응",
          "허가증 수령 확인"
        ],
        "review": [
          "인허가 명칭과 근거 법령·관할 기관 특정",
          "입지·결격·시설 기준의 선행 검토",
          "사업계획서와 증빙의 정합성 및 보완 대응"
        ],
        "sources": [
          {
            "label": "정부24 — 민원 서비스·구비서류 조회",
            "url": "https://www.gov.kr/portal/main"
          },
          {
            "label": "국가법령정보센터 — 현행 법령 조회",
            "url": "https://www.law.go.kr"
          }
        ]
      },
      "출입국 · 비자": {
        "service": "출입국 · 비자",
        "deadlines": [],
        "documents": [
          "여권·외국인등록증",
          "체류 자격별 요건 서류"
        ],
        "process": [
          "체류 목적과 현재 자격 확인",
          "자격별 요건·서류 확인",
          "신청·변경 절차 준비"
        ],
        "review": [
          "현재 자격에서 변경 가능한 체류자격 판단",
          "직종·소득·학력·고용주 요건의 최신 기준 대조",
          "보완 가능성과 신청 시점·관할 출입국기관 검토"
        ],
        "sources": [
          {
            "label": "하이코리아 — 체류민원·최신 공지",
            "url": "https://www.hikorea.go.kr"
          },
          {
            "label": "대한민국 비자포털 — 사증 안내",
            "url": "https://www.visa.go.kr"
          },
          {
            "label": "법무부 출입국·외국인정책본부 — 외국인종합안내센터(1345) 안내",
            "url": "https://www.immigration.go.kr/immigration/1530/subview.do"
          },
          {
            "label": "법무부 출입국·외국인정책본부 — 소속기관(관할 출입국·외국인관서) 목록",
            "url": "https://www.immigration.go.kr/immigration/2057/subview.do"
          }
        ]
      },
      "토지보상 · 내용증명 · 계약서": {
        "service": "토지보상 · 내용증명 · 계약서",
        "deadlines": [],
        "documents": [
          "등기부등본·토지대장(보상)",
          "기존 계약서·거래 증빙",
          "상대방과 주고받은 자료"
        ],
        "process": [
          "사실관계·서류 검토",
          "문서 초안 작성",
          "검토·수정 협의",
          "발송·제출 및 후속 안내"
        ],
        "review": [
          "보상 단계와 이의신청 기한(재결서 받은 날부터 30일) 구분, 고객 명의 의견서·이의신청서 작성·제출 대행",
          "내용증명의 사실·요구·기한 표현과 증거 연결",
          "계약 조항의 책임·해지·대금·분쟁 위험 검토"
        ],
        "sources": [
          {
            "label": "토지보상법 — 협의·수용·손실보상 기준(전체 조문)",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B3%B5%EC%9D%B5%EC%82%AC%EC%97%85%EC%9D%84%EC%9C%84%ED%95%9C%ED%86%A0%EC%A7%80%EB%93%B1%EC%9D%98%EC%B7%A8%EB%93%9D%EB%B0%8F%EB%B3%B4%EC%83%81%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0"
          },
          {
            "label": "토지보상법 제83조 — 수용재결에 대한 이의신청(30일)",
            "url": "https://www.law.go.kr/LSW/LsiJoLinkP.do?docType=JO&joNo=008300000&languageType=KO&lsNm=%EA%B3%B5%EC%9D%B5%EC%82%AC%EC%97%85%EC%9D%84+%EC%9C%84%ED%95%9C+%ED%86%A0%EC%A7%80+%EB%93%B1%EC%9D%98+%EC%B7%A8%EB%93%9D+%EB%B0%8F+%EB%B3%B4%EC%83%81%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B2%95%EB%A5%A0&paras=1"
          },
          {
            "label": "인터넷우체국 — 내용증명 서비스",
            "url": "https://www.epost.go.kr"
          }
        ]
      },
      "영업정지 · 행정심판": {
        "service": "영업정지 · 행정심판",
        "deadlines": [
          "의견제출: 사전통지서에 기재된 기한 이내 (행정절차법 제27조)",
          "행정심판: 처분이 있음을 안 날부터 90일 이내 (행정심판법 제27조)"
        ],
        "documents": [
          "처분 사전통지서 또는 처분서",
          "영업신고증·사업자등록증",
          "CCTV 영상, 신분증 확인 기록 등 소명 자료",
          "매출·생계 의존도 증빙"
        ],
        "process": [
          "처분 사유·근거 법령 확인",
          "의견제출서 또는 행정심판 청구 준비",
          "소명 증거(CCTV·확인 기록 등) 정리",
          "집행정지 신청 검토",
          "보충서면 등 제출 서류 작성·제출 대행과 재결 결과 확인"
        ],
        "review": [
          "업종별 개별 법령과 처분기준 확인",
          "고의·과실과 정상참작 사유의 구조화",
          "과징금 전환·집행정지·행정심판의 병행 순서 검토"
        ],
        "sources": [
          {
            "label": "행정절차법 제27조 — 의견제출",
            "url": "https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1016108513"
          },
          {
            "label": "행정심판법 제27조 — 심판청구 기간",
            "url": "https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1018377597"
          }
        ]
      },
      "음주운전 면허 구제": {
        "service": "음주운전 면허 구제",
        "deadlines": [
          "이의신청: 처분 통지 후 60일 이내 (도로교통법 제94조)",
          "행정심판: 처분이 있음을 안 날부터 90일 이내 (행정심판법 제27조)"
        ],
        "documents": [
          "운전면허 취소·정지 결정통지서",
          "재직증명서·소득 증빙",
          "부양가족 증빙(가족관계증명서 등)",
          "표창·봉사활동 등 정상 참작 자료"
        ],
        "process": [
          "처분 통지서·적발 경위 확인",
          "감경 요건·배제 사유 검토",
          "생계·정상 참작 증빙 수집",
          "이의신청 또는 행정심판 청구서 작성·제출",
          "보충서면 등 제출 서류 작성·제출 대행과 재결 결과 확인"
        ],
        "review": [
          "감경 배제 사유와 적용 기준 대조",
          "이의신청·행정심판 중 적합한 절차 판단",
          "주장과 증거의 연결 및 집행정지 필요성 검토"
        ],
        "sources": [
          {
            "label": "도로교통법 제94조 — 운전면허 처분 이의신청",
            "url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000561335"
          },
          {
            "label": "행정심판법 제27조 — 심판청구 기간",
            "url": "https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1018377597"
          }
        ]
      },
      "국가보훈": {
        "service": "국가보훈 등록",
        "deadlines": [
          "비해당 결정 불복 행정심판: 결정을 안 날부터 90일 이내 (행정심판법 제27조)"
        ],
        "documents": [
          "병적증명서·전역증",
          "병상일지, 군 병원 진료기록",
          "민간 병원 진료기록·장애 진단서",
          "사고 경위 확인 자료(동료 진술 등)"
        ],
        "process": [
          "신청 유형(국가유공자/보훈보상대상자) 판단",
          "병상일지·의무기록 등 입증 자료 확보",
          "공무 관련성 입증 논리 구성",
          "등록 신청 또는 불복 절차 진행",
          "심의 결과 확인·후속 대응"
        ],
        "review": [
          "국가유공자·보훈보상대상자 해당 가능성 구분",
          "공무 관련성을 뒷받침하는 기록 공백 분석",
          "비해당 사유에 맞춘 보완·재신청·불복 경로 검토"
        ],
        "sources": [
          {
            "label": "국가보훈부 — 국가유공자 및 가족 등록신청",
            "url": "https://mpva.go.kr/mpva/contents.do?key=106"
          },
          {
            "label": "국가유공자법 제6조 — 등록 및 결정",
            "url": "https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1027778575"
          }
        ]
      }
    },
    "checks": {
      "permit": {
        "title": "인허가 신청 사전 점검",
        "questions": [
          {
            "id": "permit-type",
            "options": {
              "corporation": {
                "level": "ready",
                "note": "학술·종교·자선 등 영리 아닌 사업을 목적으로 주무관청의 허가를 받습니다. 목적사업이 두 개 이상 부처에 걸치면 각 주무관청의 허가를 모두 받아야 하므로, 정관 초안의 목적사업 조항부터 정리하세요.",
                "lawRef": "민법 제32조"
              },
              "factory": {
                "level": "official",
                "note": "제조시설 면적이 500제곱미터 이상이면 공장설립 승인 대상이고, 완공 신고를 하면 공장등록대장에 등록됩니다. 제조 품목과 부지 지번을 특정해 두세요.",
                "lawRef": "산업집적활성화 및 공장설립에 관한 법률 제13조 · 제16조"
              },
              "warehouse": {
                "level": "official",
                "note": "바닥면적 합계 1천제곱미터 이상 보관시설로 물류창고업을 하려면 등록 대상입니다. 위험물·식품 등 보관 품목에 따라 다른 법령이 더 붙으므로 무엇을 얼마나 보관할지부터 정리하세요.",
                "lawRef": "물류시설의 개발 및 운영에 관한 법률 제21조의2"
              },
              "business": {
                "level": "ready",
                "note": "음식점은 업종에 따라 신고 또는 허가이고, 학원은 교육감 등록입니다. 일반음식점인지 휴게음식점인지처럼 세부 구분까지 확인하세요.",
                "lawRef": "식품위생법 제37조 · 학원법 제6조"
              },
              "unknown": {
                "level": "official",
                "note": "하려는 일과 장소를 한 문장으로 적어 두면 인허가 이름을 특정하는 출발점이 됩니다. 이 단계부터 상담으로 정리할 수 있습니다."
              }
            }
          },
          {
            "id": "permit-kind",
            "options": {
              "withlaw": {
                "level": "ready",
                "note": "근거 조항을 알면 구비서류와 처리기간을 그 조문 기준으로 맞출 수 있습니다."
              },
              "nameonly": {
                "level": "official",
                "note": "근거 조항이 곧 요건 목록입니다. 정부24 민원안내 또는 국가법령정보센터에서 해당 조문을 확인하세요."
              },
              "never": {
                "level": "official",
                "note": "허가와 신고는 준비 부담이 크게 다릅니다. 어느 쪽인지 먼저 확인하면 일정 계획이 달라집니다."
              }
            }
          },
          {
            "id": "permit-authority",
            "options": {
              "contacted": {
                "level": "ready",
                "note": "담당 부서가 특정되면 구비서류 목록과 처리기간을 직접 확인받을 수 있습니다."
              },
              "agencyonly": {
                "level": "official",
                "note": "같은 기관 안에서도 부서에 따라 요구 서류가 다릅니다. 대표번호로 담당 부서를 먼저 확인하세요."
              },
              "none": {
                "level": "official",
                "note": "관할을 모르면 요건 확인이 시작되지 않습니다. 정부24 또는 사업장 소재지 시·군·구청에서 확인하세요."
              }
            }
          },
          {
            "id": "permit-address",
            "options": {
              "candidate": {
                "level": "ready",
                "note": "가장 유리한 단계입니다. 계약 전에 용도지역과 건축물 용도를 확인하면 잘못된 선택을 되돌릴 수 있습니다."
              },
              "contracted": {
                "level": "documents",
                "note": "계약을 마쳤다면 장소 적합성 확인이 가장 급합니다. 계약서와 건축물대장을 함께 놓고 확인하세요."
              },
              "owned": {
                "level": "ready",
                "note": "소유 관계가 분명하면 임대인 동의 서류가 필요 없습니다. 건축물 용도 확인으로 넘어가세요."
              },
              "notyet": {
                "level": "ready",
                "note": "업종별 입지 제한을 먼저 확인한 뒤 장소를 고르면 선택 폭이 넓어집니다."
              },
              "na": {
                "level": "ready",
                "note": "법인 설립처럼 시설 요건이 없다면 정관·임원 요건 확인에 집중하세요."
              }
            }
          },
          {
            "id": "permit-zoning",
            "options": {
              "ok": {
                "level": "ready",
                "note": "입지 요건을 넘었습니다. 다음은 건물 자체의 문제(위반건축물 여부)를 확인할 차례입니다."
              },
              "unsure": {
                "level": "official",
                "note": "용도지역 안에서도 업종별 허용 범위가 갈립니다. 관할 부서에 업종명을 대고 가능 여부를 확인하세요."
              },
              "notchecked": {
                "level": "official",
                "note": "입지 제한에 걸리면 시설을 아무리 갖춰도 인허가가 나오지 않습니다. 다른 준비보다 이것을 먼저 하세요."
              },
              "na": {
                "level": "ready",
                "note": "장소 요건이 없다면 이 항목은 넘어가도 됩니다."
              }
            }
          },
          {
            "id": "permit-building",
            "options": {
              "clean": {
                "level": "ready",
                "note": "건물 쪽 장애물은 없습니다. 시설 기준 대조로 넘어가세요."
              },
              "flagged": {
                "level": "documents",
                "note": "위반 사항을 해소하거나 다른 장소를 검토해야 합니다. 임대인과 원상복구 책임을 먼저 확인하세요."
              },
              "notchecked": {
                "level": "official",
                "note": "건축물대장은 정부24에서 즉시 열람할 수 있습니다. 계약 전이라면 반드시 계약 전에 확인하세요."
              },
              "na": {
                "level": "ready",
                "note": "건물 요건이 없다면 이 항목은 넘어가도 됩니다."
              }
            }
          },
          {
            "id": "permit-facility",
            "options": {
              "matched": {
                "level": "ready",
                "note": "충족을 보여줄 평면도·사진·설비 계약서를 신청 서류와 함께 묶어 두세요."
              },
              "gap": {
                "level": "documents",
                "note": "부족 항목과 예상 공사 기간을 목록으로 만들면 신청 시점을 정할 수 있습니다."
              },
              "seenonly": {
                "level": "documents",
                "note": "기준을 읽는 것과 내 도면에 대입하는 것은 다릅니다. 평면도에 항목을 하나씩 표시해 보세요."
              },
              "nowhere": {
                "level": "official",
                "note": "시행규칙 별표에 있는 업종도 있고 시·도 조례로 정하는 업종도 있습니다. 관할 부서에 업종을 말하고 기준표를 요청하는 것이 가장 빠릅니다."
              },
              "na": {
                "level": "ready",
                "note": "시설 기준이 없다면 인력·자격 요건 확인으로 넘어가세요."
              }
            }
          },
          {
            "id": "permit-staff",
            "options": {
              "ready": {
                "level": "ready",
                "note": "수료증·자격증 사본과 고용 관계 증빙을 미리 모아 두세요."
              },
              "pending": {
                "level": "documents",
                "note": "교육 이수와 채용은 시간이 걸립니다. 신청 예정일을 여기에 맞춰 잡으세요."
              },
              "noneneeded": {
                "level": "ready",
                "note": "인력 요건이 없다면 시설·장소 요건에 집중할 수 있습니다."
              },
              "unknown": {
                "level": "official",
                "note": "업종별 필수 교육과 자격은 근거 법령에 정해져 있습니다. 관할 부서에 확인하세요."
              }
            }
          },
          {
            "id": "permit-disqualification",
            "options": {
              "clear": {
                "level": "ready",
                "note": "신청 요건의 큰 장애물은 넘었습니다. 서류 준비로 넘어가세요."
              },
              "maybe": {
                "level": "official",
                "note": "결격사유는 대부분 기간 제한이 붙습니다. 해당 조항과 기산일을 확인하면 신청 가능 시점을 알 수 있습니다."
              },
              "notchecked": {
                "level": "official",
                "note": "신청 후에 드러나면 반려로 이어집니다. 근거 법령의 결격사유 조항을 먼저 확인하세요."
              }
            }
          },
          {
            "id": "permit-stage",
            "options": {
              "reviewing": {
                "level": "ready",
                "note": "가장 여유 있는 단계입니다. 요건을 먼저 확인하면 보완 요구를 줄일 수 있습니다."
              },
              "preparing": {
                "level": "documents",
                "note": "구비서류 목록을 관할 기관 기준으로 확정한 뒤 모으는 것이 순서입니다."
              },
              "submitted": {
                "level": "official",
                "note": "접수증에 적힌 처리기간을 확인하고, 보완 요구가 오면 바로 알 수 있게 연락처를 확인해 두세요."
              },
              "supplement": {
                "level": "urgent",
                "note": "보완 요구에는 정해진 기한이 있습니다. 요구서에 적힌 기한과 보완 항목부터 확인하세요.",
                "lawRef": "민원 처리에 관한 법률 제22조"
              },
              "rejectedwithdoc": {
                "level": "documents",
                "note": "반려 사유 원문이 다음 신청의 출발점입니다. 사유별로 해소 방법을 정리하세요."
              },
              "rejectednodoc": {
                "level": "official",
                "note": "사유를 모르면 같은 결과가 반복될 수 있습니다. 관할 기관에 처분 문서를 다시 요청하세요."
              }
            }
          },
          {
            "id": "permit-supplement-deadline",
            "options": {
              "remaining": {
                "level": "documents",
                "note": "보완 항목별로 필요한 서류를 정리해 기한 안에 제출할 준비를 하세요."
              },
              "soon": {
                "level": "urgent",
                "note": "보완 기한이 임박했습니다. 지금 바로 보완 항목과 제출 방법을 확인해야 합니다.",
                "lawRef": "민원 처리에 관한 법률 제22조"
              },
              "passed": {
                "level": "urgent",
                "note": "보완 기한이 지나면 신청이 종결 처리될 수 있습니다. 관할 기관에 처리 상태를 즉시 확인하세요.",
                "lawRef": "민원 처리에 관한 법률 제22조"
              },
              "na": {
                "level": "ready",
                "note": "보완 요구가 오면 기한부터 확인할 수 있도록 접수증과 담당자 연락처를 보관해 두세요."
              }
            }
          },
          {
            "id": "permit-opening",
            "options": {
              "over3m": {
                "level": "ready",
                "note": "요건 검토와 시설 공사에 여유가 있습니다. 사전 검토를 먼저 하세요."
              },
              "m1to3": {
                "level": "official",
                "note": "공표된 처리기간을 확인해 신청 시점을 역산하세요. 보완 여지를 감안해야 합니다."
              },
              "within1m": {
                "level": "urgent",
                "note": "공표된 처리기간보다 개시 예정일이 빠를 수 있습니다. 관할 기관의 처리기간을 지금 확인하세요.",
                "lawRef": "행정절차법 제19조"
              },
              "undecided": {
                "level": "ready",
                "note": "처리기간을 먼저 확인한 뒤 개시일을 정하면 무리한 일정을 피할 수 있습니다. 임대료가 나가는 시점도 함께 계산하세요."
              }
            }
          }
        ],
        "overrides": []
      },
      "suspension": {
        "title": "영업정지 처분 대응 사전 점검",
        "questions": [
          {
            "id": "susp-business",
            "options": {
              "restaurant": {
                "level": "ready",
                "note": "식품위생법상 처분 기준(별표)에 따라 위반 유형별 정지 일수가 정해집니다. 처분 근거 조항을 확인하세요."
              },
              "karaoke": {
                "level": "ready",
                "note": "음악산업진흥법·게임산업진흥법상 처분 기준이 적용됩니다. 어떤 조항으로 처분되었는지 확인하세요."
              },
              "academy": {
                "level": "ready",
                "note": "학원의 설립·운영 및 과외교습에 관한 법률상 처분 기준을 확인해야 합니다."
              },
              "other": {
                "level": "official",
                "note": "업종별 근거 법령이 다릅니다. 처분서에 기재된 근거 조항부터 확인하세요."
              }
            }
          },
          {
            "id": "susp-stage",
            "options": {
              "prenotice": {
                "level": "urgent",
                "note": "처분 확정 전 소명 기회입니다. 정해진 기한 안에 의견제출을 하는 것이 무엇보다 중요합니다.",
                "lawRef": "행정절차법 제21조"
              },
              "confirmed": {
                "level": "official",
                "note": "처분이 확정된 단계입니다. 이의신청·행정심판 등 불복 절차와 각각의 기한을 검토해야 합니다."
              },
              "investigating": {
                "level": "ready",
                "note": "조사 단계입니다. 사실관계를 정리하고 소명 자료를 미리 준비해 두면 이후 대응에 도움이 됩니다."
              }
            }
          },
          {
            "id": "susp-opinion-deadline",
            "options": {
              "remaining": {
                "level": "documents",
                "note": "의견서와 이를 뒷받침할 증빙을 정리해 기한 안에 제출할 준비를 하세요."
              },
              "soon": {
                "level": "urgent",
                "note": "의견제출 기한이 임박했습니다. 지금 바로 의견서와 핵심 증빙을 준비해야 합니다.",
                "lawRef": "행정절차법 제27조"
              },
              "passed": {
                "level": "official",
                "note": "의견제출 기한이 지났다면 처분 확정 이후의 불복 절차와 그 기한을 확인해야 합니다."
              },
              "na": {
                "level": "ready",
                "note": "아직 사전통지 단계가 아니라면 통지가 오는 즉시 기한을 확인할 수 있도록 준비해 두세요."
              }
            }
          },
          {
            "id": "susp-elapsed",
            "options": {
              "within30": {
                "level": "ready",
                "note": "행정심판 청구 기한(90일)이 남아 있습니다. 지금이 절차를 준비하기 좋은 시점입니다.",
                "lawRef": "행정심판법 제27조"
              },
              "d30to60": {
                "level": "official",
                "note": "남은 기한이 줄어들고 있습니다. 절차별 기한을 정리해 일정을 관리하세요."
              },
              "d60to90": {
                "level": "urgent",
                "note": "행정심판 청구 기한(90일)이 임박했습니다. 지금 바로 기한을 확인해야 합니다.",
                "lawRef": "행정심판법 제27조"
              },
              "over90": {
                "level": "urgent",
                "note": "원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에서 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "na": {
                "level": "ready",
                "note": "아직 확정 통지를 받지 않았다면 통지 수령일을 기록해 기한 계산의 기준으로 삼으세요."
              }
            }
          },
          {
            "id": "susp-reason",
            "options": {
              "youth": {
                "level": "official",
                "note": "신분증 확인 여부와 확인 정황이 핵심 소명 포인트입니다. 관련 기록을 정리하세요."
              },
              "hygiene": {
                "level": "documents",
                "note": "지적 사항에 대한 시정 조치와 개선 내역을 증빙으로 정리해 두세요."
              },
              "unlicensed": {
                "level": "official",
                "note": "누락된 허가·신고 요건을 확인하고 보완 가능 여부를 검토해야 합니다."
              },
              "other": {
                "level": "official",
                "note": "처분서에 기재된 구체적 사유와 근거 조항을 먼저 확인하세요."
              }
            }
          },
          {
            "id": "susp-count",
            "options": {
              "first": {
                "level": "ready",
                "note": "1차 위반 처분 기준이 적용됩니다. 처분 일수가 기준에 맞는지 확인하세요."
              },
              "second": {
                "level": "official",
                "note": "반복 위반은 가중 처분 대상이 될 수 있습니다. 이전 처분 이력과 함께 확인하세요."
              },
              "third": {
                "level": "official",
                "note": "가중 처분이나 허가 취소로 이어질 위험이 있습니다. 사안 전반을 검토해야 합니다."
              }
            }
          },
          {
            "id": "susp-livelihood",
            "options": {
              "only": {
                "level": "documents",
                "note": "매출 자료와 부양 가족 증빙 등 생계 영향에 관한 자료를 준비하세요."
              },
              "main": {
                "level": "documents",
                "note": "영업 의존도를 보여줄 수 있는 소득·거래 자료를 정리해 두세요."
              },
              "side": {
                "level": "ready",
                "note": "생계 영향 주장은 제한적이지만 처분의 적법성과 감경 요소는 별도로 검토할 수 있습니다."
              }
            }
          },
          {
            "id": "susp-execution",
            "options": {
              "imminent": {
                "level": "urgent",
                "note": "집행이 임박했다면 행정심판과 함께 집행정지 신청을 검토해야 합니다. 즉시 확인이 필요합니다.",
                "lawRef": "행정심판법 제30조"
              },
              "notyet": {
                "level": "ready",
                "note": "집행 전 단계입니다. 불복 절차와 집행정지 신청 가능성을 함께 준비할 수 있습니다."
              },
              "ongoing": {
                "level": "official",
                "note": "남은 정지 기간과 그에 따른 손실을 정리하고 대응 방향을 검토하세요."
              }
            }
          },
          {
            "id": "susp-evidence",
            "options": {
              "ready": {
                "level": "ready",
                "note": "CCTV 등은 보존 기간이 짧을 수 있으니 원본 보존과 백업을 서둘러 확보하세요."
              },
              "partial": {
                "level": "documents",
                "note": "부족한 자료 목록을 만들어 확보 가능한 것부터 정리하세요."
              },
              "none": {
                "level": "documents",
                "note": "소명을 뒷받침할 자료가 없으면 불리합니다. 지금부터 확보를 시작하세요."
              }
            }
          },
          {
            "id": "susp-fine",
            "options": {
              "known": {
                "level": "official",
                "note": "과징금 전환은 업종·위반 유형별로 요건이 다릅니다. 해당 여부를 확인해야 합니다."
              },
              "unknown": {
                "level": "official",
                "note": "업종에 따라 과징금 전환이 가능한 경우가 있습니다. 해당 여부를 확인해 볼 수 있습니다."
              }
            }
          }
        ],
        "overrides": []
      },
      "dui": {
        "title": "음주운전 면허 구제 사전 점검",
        "questions": [
          {
            "id": "dui-disposition",
            "options": {
              "suspend": {
                "level": "ready",
                "note": "정지 처분은 이의신청·행정심판으로 감경을 다툴 수 있는 대상입니다."
              },
              "revoke": {
                "level": "official",
                "note": "취소 처분도 이의신청·행정심판으로 감경을 다툴 수 있는 대상입니다. 결과는 사안별로 다르므로 관할 기관 절차를 확인하세요."
              },
              "pending": {
                "level": "official",
                "note": "처분 확정 전입니다. 통지를 받으면 기한이 바로 시작되므로 통지서를 반드시 보관하세요."
              },
              "unknown": {
                "level": "official",
                "note": "처분 내용은 경찰서 또는 도로교통공단(1577-1120)에서 확인할 수 있습니다."
              }
            }
          },
          {
            "id": "dui-bac",
            "options": {
              "low": {
                "level": "ready",
                "note": "정지 구간입니다. 생계형 등 감경 사유가 있으면 다툴 여지를 검토할 수 있습니다."
              },
              "mid": {
                "level": "official",
                "note": "취소 기준 구간입니다. 이의신청 감경은 생계 등 감경 사유가 있고, 감경 제외 사유(최근 5년 안 음주운전 전력, 인적 피해 사고, 측정 불응 등)가 없을 때 검토됩니다.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "over01": {
                "level": "official",
                "note": "혈중알코올농도 0.1% 초과는 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 처분이 지나치게 무거운지 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "unknown": {
                "level": "documents",
                "note": "적발 당시 수치는 처분 통지서·수사 기록으로 확인할 수 있습니다."
              }
            }
          },
          {
            "id": "dui-elapsed",
            "options": {
              "none": {
                "level": "ready",
                "note": "기한은 통지를 받은 날부터 계산됩니다. 통지서 수령일을 꼭 기록해 두세요."
              },
              "within30": {
                "level": "ready",
                "note": "이의신청(60일)·행정심판(90일) 기한이 남아 있습니다. 준비를 시작하기 좋은 시점입니다.",
                "lawRef": "행정심판법 제27조"
              },
              "d30to60": {
                "level": "official",
                "note": "이의신청 기한(60일)이 임박했습니다. 남은 절차별 기한을 바로 확인하세요.",
                "lawRef": "도로교통법 제94조"
              },
              "d60to90": {
                "level": "urgent",
                "note": "행정심판 청구 기한(90일)이 임박했습니다. 지금 바로 기한을 확인해야 합니다.",
                "lawRef": "행정심판법 제27조"
              },
              "over90": {
                "level": "urgent",
                "note": "원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에서 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "unknown": {
                "level": "urgent",
                "note": "기한 계산의 기준일을 모르는 상태가 가장 위험합니다. 통지서 수령일부터 확인하세요.",
                "lawRef": "행정심판법 제27조"
              }
            }
          },
          {
            "id": "dui-procedure",
            "options": {
              "no": {
                "level": "ready",
                "note": "아직 절차를 시작하지 않았습니다. 기한 안에 어떤 절차를 선택할지 정해야 합니다."
              },
              "objection": {
                "level": "official",
                "note": "이의신청 결과를 통보받으면 그 날부터 90일 안에 행정심판을 청구할 수 있습니다. 결과 통지서를 받은 날을 꼭 기록하세요. 결과를 기다리지 않고 행정심판을 먼저 청구할 수도 있는데, 그러면 이 90일 특례는 적용되지 않습니다.",
                "lawRef": "도로교통법 제94조"
              },
              "objection-result": {
                "level": "official",
                "note": "이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 처분 통지일이 아니라 결과 통보일부터 셉니다. 다만 결과를 받기 전에 이미 행정심판을 청구했다면 이 특례가 아니고, 이미 낸 사건에서 보충서면으로 다툽니다.",
                "lawRef": "도로교통법 제94조"
              },
              "appeal": {
                "level": "official",
                "note": "보충 서면·증거 제출 기한을 관리해야 하는 단계입니다."
              }
            }
          },
          {
            "id": "dui-livelihood",
            "options": {
              "job": {
                "level": "documents",
                "note": "생계형 감경 주장의 핵심입니다. 재직·소득 증빙을 준비하세요."
              },
              "work": {
                "level": "documents",
                "note": "업무상 운전 필요성을 객관적으로 증빙할 자료를 준비하세요."
              },
              "commute": {
                "level": "ready",
                "note": "생계형 주장은 어렵지만 다른 정상 참작 사유를 검토할 수 있습니다."
              },
              "no": {
                "level": "ready",
                "note": "감경 요소는 제한적이지만 처분 자체의 적법성 검토는 가능합니다."
              }
            }
          },
          {
            "id": "dui-history",
            "options": {
              "none": {
                "level": "ready",
                "note": "최근 5년 안 음주운전 전력은 이의신청 감경 제외 사유인데, 여기에는 해당하지 않습니다. 다만 5년보다 전의 음주운전 전력도 처분 단계에서 면허 취소 사유로 쓰일 수 있으니 전체 이력을 확인하세요.",
                "lawRef": "도로교통법 제93조"
              },
              "once": {
                "level": "official",
                "note": "최근 5년 안 음주운전 전력은 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "multi": {
                "level": "official",
                "note": "최근 5년 안 음주운전 전력은 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              }
            }
          },
          {
            "id": "dui-accident",
            "options": {
              "none": {
                "level": "ready",
                "note": "단순 적발은 사고 동반 사안보다 감경 검토 폭이 넓습니다."
              },
              "property": {
                "level": "official",
                "note": "피해 회복(합의·변제) 여부가 중요합니다. 관련 서류를 정리하세요."
              },
              "injury": {
                "level": "official",
                "note": "음주운전 중 인적 피해 교통사고는 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              }
            }
          },
          {
            "id": "dui-refusal",
            "options": {
              "no": {
                "level": "ready",
                "note": "측정에 응한 경우 수치 기준으로 처분이 정해집니다."
              },
              "yes": {
                "level": "official",
                "note": "측정 거부는 별도의 취소 사유이고(도로교통법 제93조), 이의신청 감경 제외 사유이기도 합니다(시행규칙 별표 28). 처분 근거를 정확히 확인하세요."
              }
            }
          },
          {
            "id": "dui-evidence",
            "options": {
              "ready": {
                "level": "ready",
                "note": "준비된 증빙의 유효기간과 발급일을 확인하세요."
              },
              "partial": {
                "level": "documents",
                "note": "부족한 증빙 목록을 만들어 발급 기관별로 준비하세요."
              },
              "none": {
                "level": "documents",
                "note": "주장을 뒷받침할 증빙이 없으면 절차에서 불리합니다. 지금부터 수집을 시작하세요."
              }
            }
          },
          {
            "id": "dui-criminal",
            "options": {
              "none": {
                "level": "ready",
                "note": "형사 절차 통지가 오면 행정 절차와 별도로 대응해야 합니다."
              },
              "investigating": {
                "level": "official",
                "note": "형사 결과가 행정심판 자료로 쓰일 수 있어 진행 상황 관리가 필요합니다."
              },
              "trial": {
                "level": "official",
                "note": "형사 절차 서류는 행정 절차에서도 중요합니다. 사본을 보관하세요."
              },
              "done": {
                "level": "ready",
                "note": "형사 결과 서류는 행정심판에서 참고 자료가 됩니다."
              }
            }
          }
        ],
        "overrides": [
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-elapsed": [
                "d30to60",
                "d60to90",
                "over90"
              ],
              "dui-procedure": [
                "objection"
              ]
            },
            "note": "이의신청을 이미 하셨다면, 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 처분 통지일 기준 기한이 지나도 이 기한은 따로 남습니다(결과 전에 행정심판을 먼저 청구하면 이 특례는 적용되지 않습니다). 결과 통지서를 받은 날을 꼭 기록하세요.",
            "lawRef": "도로교통법 제94조"
          },
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-elapsed": [
                "none"
              ],
              "dui-procedure": [
                "objection-result"
              ]
            },
            "note": "처분 통지서는 받지 않았는데 이의신청 결과는 받으셨다면, 받은 문서가 처분 통지서인지 결과 통지서인지 먼저 확인하세요. 행정심판 기한은 이의신청 결과를 통보받은 날부터 90일입니다(결과 전에 이미 행정심판을 청구한 경우는 제외).",
            "lawRef": "도로교통법 제94조"
          },
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-elapsed": [
                "within30",
                "d30to60",
                "d60to90",
                "over90",
                "unknown"
              ],
              "dui-procedure": [
                "objection-result"
              ]
            },
            "note": "이의신청 결과를 통보받으셨다면, 행정심판 기한은 처분 통지일이 아니라 결과를 통보받은 날부터 90일입니다(결과 전에 이미 행정심판을 청구한 경우는 제외). 결과 통지서를 받은 날부터 며칠이 지났는지 먼저 확인하세요.",
            "lawRef": "도로교통법 제94조"
          },
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-elapsed": [
                "d30to60",
                "d60to90",
                "over90"
              ],
              "dui-procedure": [
                "appeal"
              ]
            },
            "note": "이미 행정심판을 청구하셨다면, 기한 안에 냈는지는 청구한 날을 기준으로 봅니다. 지금은 위원회가 정하는 보정·보충 서면 기한을 확인하세요.",
            "lawRef": "행정심판법 제27조"
          }
        ]
      },
      "veterans": {
        "title": "국가유공자 등록 사전 점검",
        "questions": [
          {
            "id": "vet-applicant",
            "options": {
              "self": {
                "level": "ready",
                "note": "본인 신청입니다. 상이 경위와 현재 상태를 정리하는 것부터 시작하면 좋습니다."
              },
              "family": {
                "level": "ready",
                "note": "유족 신청은 신청 자격(유족 요건)과 선순위 여부 확인이 먼저 필요합니다."
              }
            }
          },
          {
            "id": "vet-type",
            "options": {
              "combat": {
                "level": "ready",
                "note": "국가유공자법상 전상·공상 요건(직무 수행·교육훈련 중 상이 등)에 해당하는지 확인해야 합니다."
              },
              "died": {
                "level": "ready",
                "note": "순직 유형은 사망 경위 확인과 유족 등록 절차를 함께 검토해야 합니다."
              },
              "compensation": {
                "level": "ready",
                "note": "보훈보상대상자는 국가유공자와 요건·예우가 다릅니다. 어느 쪽에 해당하는지 확인이 필요합니다."
              },
              "unknown": {
                "level": "official",
                "note": "국가유공자법과 보훈보상자법은 요건이 달라 어떤 유형에 해당하는지 판단하는 것이 출발점입니다."
              }
            }
          },
          {
            "id": "vet-stage",
            "options": {
              "before": {
                "level": "ready",
                "note": "신청 전 단계입니다. 필요한 기록과 서류를 미리 정리해 두면 심사 준비에 도움이 됩니다."
              },
              "reviewing": {
                "level": "official",
                "note": "심사 중 보완 요구가 올 수 있습니다. 요구 사항에 신속히 대응할 수 있도록 준비하세요."
              },
              "rejected": {
                "level": "official",
                "note": "비해당 결정에 대해서는 재심의·행정심판 등 불복 절차와 각각의 기한을 검토해야 합니다."
              },
              "appealing": {
                "level": "official",
                "note": "불복 절차는 기한이 정해져 있습니다. 남은 기한과 필요한 입증 자료를 확인하세요."
              }
            }
          },
          {
            "id": "vet-elapsed",
            "options": {
              "na": {
                "level": "ready",
                "note": "아직 비해당 결정을 받지 않았다면 통지 수령일을 기록해 기한 계산의 기준으로 삼으세요."
              },
              "within30": {
                "level": "ready",
                "note": "행정심판 청구 기한(90일)이 남아 있습니다. 지금이 자료를 정리하기 좋은 시점입니다.",
                "lawRef": "행정심판법 제27조"
              },
              "d30to90": {
                "level": "urgent",
                "note": "행정심판 청구 기한(90일)이 임박했습니다. 지금 바로 기한을 확인해야 합니다.",
                "lawRef": "행정심판법 제27조"
              },
              "over90": {
                "level": "urgent",
                "note": "원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에서 확인하세요.",
                "lawRef": "행정심판법 제27조"
              }
            }
          },
          {
            "id": "vet-connection",
            "options": {
              "yes": {
                "level": "ready",
                "note": "확보한 자료가 상이 경위와 공무 관련성을 어떻게 뒷받침하는지 정리해 두세요."
              },
              "partial": {
                "level": "documents",
                "note": "부족한 자료 목록을 만들어 발급 기관별로 확보 계획을 세우세요."
              },
              "none": {
                "level": "documents",
                "note": "공무 관련성 입증 자료가 핵심입니다. 소속 기관·의무기록 등 발급 신청부터 시작하세요."
              },
              "unsure": {
                "level": "official",
                "note": "유형별로 필요한 입증 자료가 다릅니다. 어떤 자료가 필요한지 확인하는 것이 우선입니다."
              }
            }
          },
          {
            "id": "vet-records",
            "options": {
              "yes": {
                "level": "ready",
                "note": "확보한 의무기록이 상이 시점·경위와 어떻게 연결되는지 정리해 두세요."
              },
              "partial": {
                "level": "documents",
                "note": "빠진 기간의 기록을 확인하고 추가 발급을 신청하세요."
              },
              "none": {
                "level": "documents",
                "note": "의무기록은 국가기록원·병무청·해당 의료기관 등에서 발급받을 수 있습니다. 발급 경로부터 확인하세요."
              }
            }
          },
          {
            "id": "vet-current",
            "options": {
              "yes": {
                "level": "ready",
                "note": "현재 상태 기록이 신체검사·상이등급 판정 자료로 어떻게 쓰일지 확인해 두세요."
              },
              "none": {
                "level": "documents",
                "note": "현재 상태를 보여줄 진단서·검사 기록을 확보하는 것이 필요합니다."
              }
            }
          },
          {
            "id": "vet-history",
            "options": {
              "first": {
                "level": "ready",
                "note": "첫 신청입니다. 요건과 필요한 서류를 처음부터 꼼꼼히 정리하는 것이 좋습니다."
              },
              "once": {
                "level": "official",
                "note": "이전 기각 사유를 분석하는 것이 재신청 준비의 출발점입니다. 결정 통지서를 확인하세요."
              },
              "multi": {
                "level": "official",
                "note": "반복 기각의 경우 이전과 다른 새로운 입증 자료가 필요합니다. 무엇이 부족했는지 정리하세요."
              }
            }
          },
          {
            "id": "vet-consult",
            "options": {
              "yes": {
                "level": "ready",
                "note": "상담에서 안내받은 필요 서류와 요건을 정리해 준비 상황과 대조해 보세요."
              },
              "none": {
                "level": "official",
                "note": "관할 보훈(지)청 사전 상담을 통해 필요한 서류와 신청 유형을 먼저 확정하는 것이 좋습니다."
              }
            }
          }
        ],
        "overrides": []
      }
    },
    "deadlineReport": {
      "soon": "2주 안이거나 이미 지났습니다",
      "later": "있지만 2주 넘게 남았습니다",
      "unknown": "기한이 있는지, 언제인지 모릅니다",
      "none": "받은 통지서가 없습니다"
    },
    "urgentReasons": {
      "diagnosis": "셀프 진단",
      "visaIntake": "비자 접수 답변",
      "visaDiagnosis": "비자 사전진단",
      "selfReported": "고객 직접 선택"
    }
  }
};
