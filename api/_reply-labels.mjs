// scripts/gen-reply-labels.ts가 생성한 파일 — 직접 편집하지 마세요.
export default {
  "office": {
    "name": "정명 행정사사무소",
    "representative": "정재훈",
    "phone": "02-897-6251",
    "email": "sngbusa10@naver.com"
  },
  "diagnosis": {
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
          "mid": "0.08% 이상 ~ 0.1% 미만",
          "high": "0.1% 이상",
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
          "objection": "이의신청 진행 중",
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
          "none": "없음 (이번이 처음)",
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
    },
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
  }
};
