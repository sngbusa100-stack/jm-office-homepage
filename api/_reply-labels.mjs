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
        "text": "어떤 일을 준비하고 계신가요?",
        "options": {
          "corporation": "비영리법인 설립",
          "factory": "공장 설립·등록",
          "warehouse": "창고·물류시설 운영",
          "business": "음식점·학원 등 영업",
          "other": "그 밖의 사업·단체 운영",
          "unknown": "어느 보기를 골라야 할지 모르겠어요"
        }
      },
      "permit-purpose": {
        "text": "이번에 새로 신청하시나요, 기존 내용을 바꾸시나요?",
        "options": {
          "new": "새 사업·단체를 처음 신청해요",
          "change": "기존 사업장의 주소·상호·대표자·시설 등을 바꿔요",
          "takeover": "다른 사람이 운영하던 사업을 넘겨받아요",
          "other": "그 밖의 경우이거나 잘 모르겠어요"
        }
      },
      "permit-authority": {
        "text": "신청을 받는 곳을 어디까지 확인하셨나요?",
        "options": {
          "contacted": "담당 부서와 연락처를 알아요",
          "department": "담당 부서는 알지만 연락처가 없어요",
          "agencyonly": "기관 이름만 알아요",
          "none": "어느 기관인지 아직 몰라요"
        }
      },
      "permit-address": {
        "text": "이번 신청에 쓸 장소는 정하셨나요?",
        "options": {
          "candidate": "후보지는 있고 아직 계약 전이에요",
          "contracted": "이번에 사용할 장소를 새로 계약했어요",
          "owned": "원래 소유하던 장소를 써요",
          "notyet": "아직 후보지가 없어요",
          "no-location-change": "기존 등록사항만 바꾸고 장소는 그대로예요",
          "no-site-advised": "이 신청에는 장소가 필요 없다고 안내받았어요",
          "unknown": "장소를 정해야 하는지 모르겠어요"
        }
      },
      "permit-site-advice": {
        "text": "그 장소에서 하려는 일을 해도 되는지 담당 부서에 물어보셨나요?",
        "options": {
          "allowed": "가능하다는 안내를 받았어요",
          "conditions": "조건이 있거나 어렵다는 안내를 받았어요",
          "waiting": "문의했고 답변을 기다리고 있어요",
          "none": "아직 문의하지 않았어요",
          "unknown": "안내 내용을 모르겠어요"
        }
      },
      "permit-building": {
        "text": "건축물대장에서 ‘위반건축물’ 표시를 보셨나요?",
        "options": {
          "clean": "대장을 봤고 표시가 없었어요",
          "flagged": "위반건축물 표시가 있었어요",
          "notchecked": "아직 대장을 보지 않았어요",
          "na": "건물을 사용하지 않아요",
          "unknown": "봤지만 표시를 찾기 어려워요"
        }
      },
      "permit-facility-advice": {
        "text": "시설을 설치하거나 고치라는 안내를 받으셨나요?",
        "options": {
          "pending": "받았고 아직 마치지 못했어요",
          "done": "받았고 요청받은 작업을 마쳤어요",
          "not-needed": "시설을 손볼 필요가 없다고 안내받았어요",
          "none": "시설에 관한 안내를 아직 받지 않았어요",
          "na": "이번 신청은 시설과 관계없어요",
          "unknown": "어떤 안내를 받았는지 모르겠어요"
        }
      },
      "permit-personnel-advice": {
        "text": "교육·자격증·직원에 관한 서류를 요청받으셨나요?",
        "options": {
          "collected": "요청받은 서류를 모두 모았어요",
          "pending": "요청받았고 아직 준비할 것이 있어요",
          "not-needed": "그런 서류가 필요 없다고 안내받았어요",
          "none": "아직 요청받은 적이 없어요",
          "unknown": "기억나지 않아요"
        }
      },
      "permit-stage": {
        "text": "현재 신청은 어디까지 진행됐나요?",
        "options": {
          "reviewing": "신청 전에 알아보고 있어요",
          "preparing": "신청 전이고 서류를 모으고 있어요",
          "submitted": "접수했고 결과를 기다려요",
          "supplement": "접수 후 고치거나 더 내라는 요청이 왔어요",
          "rejectedwithdoc": "반려됐고 통지서를 갖고 있어요",
          "rejectednodoc": "반려됐지만 통지서가 없어요",
          "finished": "허가·등록·신고 처리가 끝났어요",
          "unknown": "접수 또는 처리 상태를 모르겠어요"
        }
      },
      "permit-supplement-deadline": {
        "text": "추가 서류를 내라는 안내에서 마감일을 확인하셨나요?",
        "options": {
          "four-plus": "마감일까지 4일 이상 남았어요",
          "soon": "오늘이 마감이거나 1~3일 남았어요",
          "passed": "마감일이 지났어요",
          "unknown": "날짜가 없거나 확인하기 어려워요"
        }
      },
      "permit-opening": {
        "text": "사업을 시작하거나 등록 내용을 바꾸려는 시점은 언제인가요?",
        "options": {
          "already": "이미 시작하거나 변경했어요",
          "month": "오늘부터 1개월 안이에요",
          "later": "1개월보다 뒤예요",
          "undecided": "아직 정하지 않았어요"
        }
      }
    },
    "suspension": {
      "susp-business": {
        "text": "이번 안내를 받은 사업장은 어떤 업종인가요?",
        "options": {
          "restaurant": "음식점·주점이에요",
          "karaoke": "노래연습장·게임장이에요",
          "academy": "학원·교습소예요",
          "other": "그 밖의 업종이에요",
          "unknown": "정확한 업종명을 모르겠어요"
        }
      },
      "susp-stage": {
        "text": "영업정지에 관해 가장 최근 받은 안내는 무엇인가요?",
        "options": {
          "prior-notice": "사전통지서나 의견을 내라는 안내가 왔어요",
          "confirmed": "영업정지를 명하는 최종 처분서를 받았어요",
          "investigating": "점검이나 조사만 받았어요",
          "none": "아직 점검이나 통지를 받은 적이 없어요",
          "unknown": "연락은 받았지만 어떤 단계인지 모르겠어요"
        }
      },
      "susp-opinion-deadline": {
        "text": "의견을 내라는 안내에 적힌 마감일은 언제인가요?",
        "options": {
          "four-plus": "4일 이상 남았어요",
          "soon": "오늘이 마감이거나 1~3일 남았어요",
          "passed": "마감일이 지났어요",
          "unknown": "마감일을 찾지 못했어요"
        }
      },
      "susp-elapsed": {
        "text": "영업정지 처분서를 받은 지 얼마나 됐나요?",
        "options": {
          "within30": "받은 지 30일 이내예요",
          "d31to60": "받은 지 31~60일 됐어요",
          "d61to90": "받은 지 61~90일 됐어요",
          "over90": "받은 지 90일이 넘었어요",
          "unknown": "언제 받았는지 모르겠어요"
        }
      },
      "susp-reason": {
        "text": "문서나 조사에서 어떤 일을 지적받으셨나요?",
        "options": {
          "youth": "청소년에게 술이나 유해물을 제공한 일이에요",
          "hygiene": "위생이나 시설 상태를 지적받았어요",
          "unlicensed": "허가를 받지 않았거나 변경 신고를 하지 않았다는 내용이에요",
          "other": "다른 사유예요",
          "unknown": "아직 사유를 듣지 못했거나 잘 모르겠어요"
        }
      },
      "susp-count": {
        "text": "이번과 같은 일로 전에 처분받은 적이 있나요?",
        "options": {
          "first": "전에는 없었어요",
          "second": "전에 한 번 있었어요",
          "third": "전에 두 번 이상 있었어요",
          "unknown": "기억나지 않거나 같은 사유인지 모르겠어요"
        }
      },
      "susp-livelihood": {
        "text": "사업장 수입이 생활비에서 어느 정도를 차지하나요?",
        "options": {
          "only": "생활비가 모두 이 사업장에서 나와요",
          "main": "다른 수입도 있지만 이 사업장 수입이 가장 커요",
          "side": "이 사업장 수입은 부수입이에요",
          "other": "해당되지 않거나 잘 모르겠어요"
        }
      },
      "susp-execution": {
        "text": "처분서에 적힌 영업정지 기간은 언제인가요?",
        "options": {
          "scheduled": "시작일이 정해졌고 아직 시작 전이에요",
          "ongoing": "이미 시작됐고 아직 끝나지 않았어요",
          "finished": "정지 기간이 끝났어요",
          "no-date": "시작일이 정해지지 않았다고 안내받았어요",
          "unknown": "날짜를 모르겠어요"
        }
      },
      "susp-evidence": {
        "text": "당시 상황을 설명할 자료를 얼마나 모으셨나요?",
        "options": {
          "collected": "설명에 쓸 자료를 모두 모았어요",
          "partial": "일부만 모았어요",
          "none": "아직 모은 자료가 없어요",
          "unknown": "무엇을 찾아야 할지 모르겠어요"
        }
      },
      "susp-fine-advice": {
        "text": "영업정지 대신 과징금을 내는 방법을 안내받으셨나요?",
        "options": {
          "available": "검토할 수 있다고 안내받았어요",
          "unavailable": "이번 건은 대상이 아니라고 안내받았어요",
          "none": "그런 안내를 받지 않았어요",
          "unknown": "안내받았는지 기억나지 않아요"
        }
      }
    },
    "dui": {
      "dui-disposition": {
        "text": "경찰에서 면허에 관해 어떤 안내를 받으셨나요?",
        "options": {
          "suspend": "면허정지 결정 통지를 받았어요",
          "revoke": "면허취소 결정 통지를 받았어요",
          "prior-notice": "예정된 처분에 대해 의견을 내라는 안내를 받았어요",
          "investigation": "조사 중이고 면허 처분에 관한 안내는 아직 없어요",
          "unknown": "받은 안내가 어떤 내용인지 모르겠어요"
        }
      },
      "dui-elapsed": {
        "text": "면허정지·취소 결정 통지서를 받은 지 얼마나 됐나요?",
        "options": {
          "none": "결정 통지서는 아직 받지 않았어요",
          "within30": "받은 지 30일 이내예요",
          "d31to60": "받은 지 31~60일 됐어요",
          "d61to90": "받은 지 61~90일 됐어요",
          "over90": "받은 지 90일이 넘었어요",
          "unknown": "언제 받았는지 모르겠어요"
        }
      },
      "dui-procedure": {
        "text": "이 면허 처분에 대해 어떤 서류를 냈나요?",
        "options": {
          "no": "이의신청도 행정심판도 내지 않았어요",
          "objection": "경찰에 이의신청을 냈고 결과를 기다려요",
          "objection-result": "경찰에서 이의신청 결과를 받았어요",
          "appeal": "행정심판을 냈고 결과를 기다려요",
          "appeal-done": "행정심판 결과를 받았어요",
          "unknown": "어떤 서류를 냈는지 모르겠어요"
        }
      },
      "dui-refusal": {
        "text": "당시 경찰이 요구한 음주 측정에 응하셨나요?",
        "options": {
          "measured": "측정에 응했어요",
          "yes": "측정을 거부했어요",
          "not-asked": "측정을 요구받지 않았어요",
          "unknown": "기억나지 않거나 측정 여부를 다투고 있어요"
        }
      },
      "dui-bac": {
        "text": "측정 결과에 적힌 혈중알코올농도는 어느 구간인가요?",
        "options": {
          "below003": "0.03% 미만",
          "low": "0.03% 이상 ~ 0.08% 미만",
          "mid": "0.08% 이상 ~ 0.1% 이하",
          "over01": "0.1% 초과",
          "unknown": "결과를 받지 않았거나 수치를 모르겠어요"
        }
      },
      "dui-accident": {
        "text": "당시 사고로 어떤 피해가 있었나요?",
        "options": {
          "none": "사고가 없었어요",
          "property": "사람은 다치지 않고 차량·물건만 파손됐어요",
          "injury": "사람이 다치거나 사망했어요",
          "unknown": "피해가 있었는지 모르겠어요"
        }
      },
      "dui-history": {
        "text": "이번 일 전 5년 동안 음주운전으로 적발된 적이 있나요?",
        "options": {
          "none": "그 5년 동안에는 없었어요",
          "once": "한 번 있었어요",
          "multi": "두 번 이상 있었어요",
          "unknown": "기억나지 않거나 날짜를 모르겠어요"
        }
      },
      "dui-livelihood": {
        "text": "운전을 주로 어디에 쓰시나요?",
        "options": {
          "job": "화물·버스·택시 등 운전 자체가 직업이에요",
          "work": "운전이 직업은 아니지만 일할 때 꼭 필요해요",
          "commute": "주로 출퇴근이나 일상생활에 써요",
          "no": "평소 운전이 꼭 필요하지 않아요",
          "other": "그 밖의 용도이거나 고르기 어려워요"
        }
      },
      "dui-evidence": {
        "text": "운전이 필요한 사정을 보여 줄 자료는 얼마나 준비됐나요?",
        "options": {
          "ready": "필요한 자료가 대부분 있어요",
          "partial": "일부만 있고 더 모아야 해요",
          "none": "아직 준비한 자료가 없어요",
          "unknown": "어떤 자료가 필요한지 모르겠어요"
        }
      },
      "dui-criminal": {
        "text": "이번 일로 조사·벌금·재판에 관한 안내는 어디까지 받으셨나요?",
        "options": {
          "none": "조사·벌금·재판에 관한 안내는 아직 없어요",
          "investigating": "경찰·검찰에서 조사 중이에요",
          "trial": "법원에서 약식명령을 받았거나 재판 중이에요",
          "done": "벌금 납부 등으로 절차가 끝났어요",
          "unknown": "현재 상태를 모르겠어요"
        }
      }
    },
    "veterans": {
      "vet-applicant": {
        "text": "누구의 일로 등록을 알아보고 계신가요?",
        "options": {
          "self": "제 일로 알아보고 있어요",
          "family": "가족의 일로 알아보고 있어요",
          "other": "그 밖의 관계이거나 잘 모르겠어요"
        }
      },
      "vet-event": {
        "text": "등록을 알아보게 된 일은 무엇인가요?",
        "options": {
          "injury": "복무·근무·훈련 중 다치거나 병이 생겼어요",
          "death": "사망과 관련해 알아보고 있어요",
          "other": "참전·공적 등 다른 일로 알아보고 있어요",
          "unknown": "경위를 아직 잘 몰라요"
        }
      },
      "vet-stage": {
        "text": "이번 신청에서 가장 최근에 한 일은 무엇인가요?",
        "options": {
          "before": "아직 등록을 신청하지 않았어요",
          "reviewing": "등록을 신청했고 결정을 기다려요",
          "rejected": "등록 대상이 아니라는 결정서를 받았어요",
          "filed": "결정에 이의를 제기했어요",
          "accepted": "등록됐다는 안내를 받았어요",
          "other": "다른 결정을 받았거나 진행 상태를 몰라요"
        }
      },
      "vet-elapsed": {
        "text": "등록 대상이 아니라는 결정서를 받은 지 얼마나 됐나요?",
        "options": {
          "within30": "받은 지 30일 이내예요",
          "d31to90": "받은 지 31~90일 됐어요",
          "over90": "받은 지 90일이 넘었어요",
          "unknown": "언제 받았는지 모르겠어요"
        }
      },
      "vet-connection": {
        "text": "당시 무슨 일이 있었는지 보여 줄 자료를 갖고 계신가요?",
        "options": {
          "collected": "확인하려던 자료를 모두 갖고 있어요",
          "partial": "일부만 있고 더 찾을 자료가 있어요",
          "not-collected": "어떤 자료인지 알지만 가진 것이 없어요",
          "unsure": "어떤 자료를 찾아야 할지 모르겠어요"
        }
      },
      "vet-records": {
        "text": "당시 진료받은 병원 기록을 갖고 계신가요?",
        "options": {
          "collected": "찾으려던 진료기록을 모두 갖고 있어요",
          "partial": "일부만 있고 빠진 병원이나 기간이 있어요",
          "no-copies": "진료는 받았지만 가진 기록이 없어요",
          "no-treatment": "당시 진료받은 적이 없어요",
          "unknown": "진료 여부나 기록 보유 여부를 모르겠어요"
        }
      },
      "vet-current": {
        "text": "지금 몸 상태를 보여 주는 진료·검사 기록이 있나요?",
        "options": {
          "yes": "갖고 있어요",
          "none": "갖고 있지 않아요",
          "unknown": "어떤 기록이 있는지 모르겠어요"
        }
      },
      "vet-history": {
        "text": "이번 건과 같은 일로 예전에 등록을 신청했나요?",
        "options": {
          "first": "이번이 처음이에요",
          "once": "예전에 한 번 등록 대상이 아니라는 결정을 받았어요",
          "multi": "예전에 두 번 이상 등록 대상이 아니라는 결정을 받았어요",
          "other": "예전 신청은 있지만 위 경우와 달라요",
          "unknown": "신청한 적이 있는지 모르겠어요"
        }
      },
      "vet-consult": {
        "text": "이번 일로 보훈청이나 보훈지청에 문의한 적이 있나요?",
        "options": {
          "yes": "문의한 적이 있어요",
          "none": "아직 문의한 적이 없어요",
          "unknown": "문의했는지 기억나지 않아요"
        }
      }
    },
    "land": {
      "land-topic": {
        "text": "지금 가장 먼저 준비하려는 일은 무엇인가요?",
        "options": {
          "development": "땅을 사거나 용도를 바꾸거나 나누려 해요",
          "compensation": "토지나 건물 보상에 관해 안내를 받았어요",
          "notice": "상대방에게 내용증명을 보내려 해요",
          "contract": "계약서를 작성하거나 살펴보려 해요",
          "unknown": "다른 일이거나 어디에 해당하는지 모르겠어요"
        }
      },
      "land-use": {
        "text": "그 땅에서 무엇을 하려 하시나요?",
        "options": {
          "build": "주택·창고 등 건물이나 시설을 지으려 해요",
          "ground": "흙을 메우거나 주차장·야적장 등으로 쓰려 해요",
          "split": "땅을 여러 필지로 나누려 해요",
          "unknown": "다른 용도이거나 아직 정하지 않았어요"
        }
      },
      "land-location": {
        "text": "후보지를 어떤 자료에서 찾을 수 있나요?",
        "options": {
          "parcel": "지번이 적힌 자료가 있어요",
          "map": "지번은 모르지만 지도에서 찾을 수 있어요",
          "unknown": "아직 후보지가 없거나 위치를 잘 모르겠어요"
        }
      },
      "land-compensation-paper": {
        "text": "가장 최근 받은 보상 관련 문서에 어떤 말이 있나요?",
        "options": {
          "inventory": "보상계획 열람·토지조서·물건조서",
          "offer": "보상금액·협의 요청",
          "decision": "수용재결·이의재결",
          "unknown": "다른 문서이거나 말로만 안내받았어요"
        }
      },
      "land-compensation-list": {
        "text": "받은 목록과 실제 현장을 비교해 보셨나요?",
        "options": {
          "difference": "빠진 물건이나 다르게 적힌 부분이 보여요",
          "compared": "살펴봤고 눈에 띄는 차이는 없어요",
          "unknown": "아직 비교하지 않았거나 목록이 없어요"
        }
      },
      "land-notice": {
        "text": "상대방에게 같은 요청을 한 적이 있나요?",
        "options": {
          "record": "문자·이메일·우편으로 보냈어요",
          "spoken": "전화나 대면으로 이야기했어요",
          "first": "이번이 처음이에요",
          "unknown": "기억나지 않아요"
        }
      },
      "land-contract": {
        "text": "계약서는 어느 단계에 있나요?",
        "options": {
          "draft": "초안이 있고 아직 서명 전이에요",
          "signed": "이미 서명한 계약서가 있어요",
          "verbal": "아직 말로만 내용을 정했어요",
          "unknown": "계약서가 어디 있는지 모르겠어요"
        }
      },
      "land-schedule": {
        "text": "받은 안내에 제출하거나 회신할 날짜가 적혀 있나요?",
        "options": {
          "due": "오늘·내일이거나 이미 지났어요",
          "later": "모레 이후 날짜가 적혀 있어요",
          "none": "받은 기한은 없어요",
          "unknown": "날짜가 있는지 잘 모르겠어요"
        }
      }
    },
    "appeal": {
      "appeal-stage": {
        "text": "기관에 신청하거나 기관에서 연락받은 뒤, 지금 어떤 상황인가요?",
        "options": {
          "decision": "거절·취소·환수 등 결정이 적힌 통지를 받았어요",
          "before": "결정 전에 의견이나 추가 자료를 내라는 안내를 받았어요",
          "waiting": "신청했는데 아직 답을 받지 못했어요",
          "spoken": "전화나 방문으로만 설명을 들었어요",
          "unknown": "어디에 해당하는지 모르겠어요"
        }
      },
      "appeal-delivery": {
        "text": "그 통지나 안내를 언제 받았는지 확인할 수 있나요?",
        "options": {
          "record": "등기·전자통지·수령 기록에 날짜가 있어요",
          "memory": "대략 언제인지 기억해요",
          "unknown": "언제 받았는지 모르겠어요"
        }
      },
      "appeal-reasons": {
        "text": "문서에서 기관이 이유를 설명한 부분을 찾으셨나요?",
        "options": {
          "found": "찾았고 어느 부분인지 표시할 수 있어요",
          "unclear": "이유가 적혀 있지만 뜻이 어려워요",
          "unknown": "찾지 못했거나 전체 문서가 없어요"
        }
      },
      "appeal-receipt": {
        "text": "신청했다는 기록이 남아 있나요?",
        "options": {
          "receipt": "접수번호·접수증·접수 알림이 있어요",
          "sent": "우편이나 온라인으로 보낸 기록만 있어요",
          "unknown": "기록이 없거나 잘 모르겠어요"
        }
      },
      "appeal-contacts": {
        "text": "이 일로 기관에 의견을 내거나 다시 문의한 적이 있나요?",
        "options": {
          "filed": "서류나 온라인으로 제출했어요",
          "spoken": "전화하거나 방문해서 이야기했어요",
          "none": "아직 없어요",
          "unknown": "기억나지 않아요"
        }
      },
      "appeal-evidence": {
        "text": "당시 상황을 보여 줄 자료가 있나요?",
        "options": {
          "held": "신청서 사본·문자·사진·거래 기록 등이 있어요",
          "elsewhere": "다른 사람이나 기관이 가지고 있어요",
          "unknown": "없거나 무엇을 찾아야 할지 모르겠어요"
        }
      },
      "appeal-impact": {
        "text": "그 결정으로 실제 달라진 일이 있나요?",
        "options": {
          "already": "지급이 끊기거나 하던 일을 멈추는 등 변화가 생겼어요",
          "scheduled": "앞으로 달라지는 날짜가 적혀 있어요",
          "none": "당장 달라진 일은 없어요",
          "unknown": "어떤 영향이 있을지 모르겠어요"
        }
      },
      "appeal-date": {
        "text": "받은 문서에서 의견을 내거나 결정에 이의를 제기할 기한을 확인하셨나요?",
        "options": {
          "near": "마감이 오늘·내일이거나 이미 지났어요",
          "later": "모레 이후 날짜가 적혀 있어요",
          "period": "‘받은 날부터 며칠 이내’처럼 기간만 적혀 있어요",
          "unknown": "기한을 찾지 못했거나 잘 모르겠어요"
        }
      }
    },
    "procurement": {
      "procurement-topic": {
        "text": "어떤 확인이나 등록을 먼저 준비하시나요?",
        "options": {
          "production": "직접생산확인",
          "women": "여성기업확인",
          "registration": "나라장터 입찰참가자격 등록",
          "unknown": "무엇부터 해야 할지 모르겠어요"
        }
      },
      "procurement-notice": {
        "text": "참여하려는 입찰 공고가 있나요?",
        "options": {
          "saved": "공고문이나 공고번호가 있어요",
          "heard": "공고가 있다는 말만 들었어요",
          "none": "정해진 공고 없이 미리 준비하고 있어요",
          "unknown": "공고가 있는지 모르겠어요"
        }
      },
      "procurement-production": {
        "text": "신청할 제품을 누가 만드나요?",
        "options": {
          "own": "우리 사업장에서 전 과정을 맡아요",
          "partial": "일부는 우리 사업장에서 하고 일부는 맡겨요",
          "purchased": "다른 업체가 만든 완제품을 공급해요",
          "unknown": "아직 제품이나 생산 방식을 정하지 않았어요"
        }
      },
      "procurement-business": {
        "text": "어떤 형태의 사업체를 운영하시나요?",
        "options": {
          "individual": "개인사업자예요",
          "company": "주식회사 등 회사예요",
          "cooperative": "협동조합이에요",
          "unknown": "다른 형태이거나 잘 모르겠어요"
        }
      },
      "procurement-supply": {
        "text": "나라장터에서 무엇을 공급하려 하시나요?",
        "options": {
          "manufacture": "직접 만든 물품",
          "goods": "매입한 물품",
          "services": "용역이나 공사",
          "unknown": "그 밖의 업무이거나 아직 정하지 않았어요"
        }
      },
      "procurement-stage": {
        "text": "선택한 확인이나 등록을 어디까지 진행하셨나요?",
        "options": {
          "new": "처음 준비하고 있어요",
          "filed": "신청했고 답을 기다리고 있어요",
          "requested": "보완이나 현장 확인 연락을 받았어요",
          "existing": "이미 받은 확인서나 등록 내역이 있어요",
          "unknown": "진행한 적이 있는지 모르겠어요"
        }
      },
      "procurement-changes": {
        "text": "신청하거나 등록한 뒤 회사 정보가 바뀌었나요?",
        "options": {
          "changed": "대표자·상호·사업장·공장 등에 변경이 있어요",
          "same": "기억하는 변경 사항이 없어요",
          "unknown": "잘 모르겠어요"
        }
      },
      "procurement-date": {
        "text": "공고나 기관 안내에 적힌 가장 가까운 마감은 언제인가요?",
        "options": {
          "near": "오늘·내일이거나 이미 지났어요",
          "later": "모레 이후예요",
          "none": "정해진 마감이 없어요",
          "unknown": "마감이 있는지 모르겠어요"
        }
      }
    }
  },
  "previousDiagnosis": {
    "permit": {
      "permit-kind": {
        "text": "받으려는 것이 허가 · 등록 · 신고 · 승인 중 무엇인지 확인하셨나요?",
        "options": {
          "withlaw": "종류와 근거 조항까지 확인했다",
          "nameonly": "이름만 알고 근거 조항은 모른다",
          "never": "구분해 본 적 없다"
        }
      },
      "permit-address": {
        "text": "사업장 주소가 정해졌나요?",
        "options": {
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
      "permit-supplement-deadline": {
        "text": "보완 요구를 받으셨다면 기한이 얼마나 남았나요?",
        "options": {
          "remaining": "아직 여유가 있다",
          "na": "보완 요구를 받은 적 없다"
        }
      },
      "permit-opening": {
        "text": "사업 개시(개업 · 가동) 예정일까지 얼마나 남았나요?",
        "options": {
          "over3m": "3개월 이상 남았다",
          "m1to3": "1 ~ 3개월 남았다",
          "within1m": "1개월 이내다"
        }
      }
    },
    "suspension": {
      "susp-stage": {
        "text": "처분이 어느 단계에 있나요?",
        "options": {
          "prenotice": "사전통지(의견제출 기간 중)"
        }
      },
      "susp-opinion-deadline": {
        "text": "의견제출 기한은 어떻게 되나요?",
        "options": {
          "remaining": "아직 기한이 남음",
          "na": "해당 없음"
        }
      },
      "susp-elapsed": {
        "text": "확정 처분 통지를 받은 지 얼마나 되었나요?",
        "options": {
          "d30to60": "30일 ~ 60일",
          "d60to90": "60일 ~ 90일",
          "na": "해당 없음"
        }
      },
      "susp-execution": {
        "text": "영업정지 집행 일정은 어떻게 되나요?",
        "options": {
          "imminent": "시작일이 지정됨 · 임박",
          "notyet": "아직 시작 전"
        }
      },
      "susp-evidence": {
        "text": "소명에 쓸 증빙(CCTV · 신분증 확인 기록 등)은 준비되어 있나요?",
        "options": {
          "ready": "있음"
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
          "pending": "아직 통지 전 · 조사 중"
        }
      },
      "dui-elapsed": {
        "text": "처분(결정) 통지서를 받은 지 얼마나 되었나요?",
        "options": {
          "d30to60": "30일 ~ 60일",
          "d60to90": "60일 ~ 90일"
        }
      },
      "dui-refusal": {
        "text": "음주 측정을 거부했나요?",
        "options": {
          "no": "아니오"
        }
      }
    },
    "veterans": {
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
          "appealing": "재심의 · 행정심판 검토 중"
        }
      },
      "vet-elapsed": {
        "text": "비해당 결정 통지를 받은 지 얼마나 되었나요?",
        "options": {
          "na": "해당 없음",
          "d30to90": "30일 ~ 90일"
        }
      },
      "vet-connection": {
        "text": "공무 관련성을 입증할 자료(병상일지 · 사고경위서 등)가 있나요?",
        "options": {
          "yes": "있음",
          "none": "없음"
        }
      },
      "vet-records": {
        "text": "의무기록(군 병원 · 민간 진료 기록)은 확보하셨나요?",
        "options": {
          "yes": "확보함",
          "none": "없음"
        }
      }
    }
  },
  "visa": {
    "requester": {
      "question": "누구의 일",
      "options": {
        "self": "제 비자를 상담하고 싶어요",
        "family-sponsor": "배우자나 가족의 비자를 문의해요",
        "company": "회사에서 외국인 직원의 비자를 문의해요",
        "other": "지인 등 다른 분의 비자를 문의해요"
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
        "overseas": "지금 한국 밖에 있어요",
        "valid": "한국에 있고, 만료일까지 두 달 넘게 남았어요",
        "near-expiry": "한국에 있고, 오늘부터 두 달 안에 만료돼요",
        "expired": "한국에 있고, 만료일이 지났어요",
        "unsure": "잘 모르겠음"
      }
    },
    "expiryDate": {
      "question": "체류기간 만료일"
    },
    "currentStatus": {
      "question": "현재 체류자격",
      "options": {
        "visa-free-short": "비자 없이 입국했거나 짧게 방문 중이에요 (C-3·C-4 등)",
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
        "waiting": "신청했고 결과를 기다려요",
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
    "levels": {
      "urgent": "먼저 확인할 일정",
      "documents": "챙겨 둘 자료",
      "official": "담당 기관에 물어볼 내용",
      "ready": "상담 때 참고할 내용"
    },
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
    "specificServices": {
      "land-development": {
        "service": "개발행위허가 · 농지전용 · 토지분할",
        "deadlines": [],
        "documents": [
          "토지이용계획확인서·토지대장·지적도",
          "토지 등기사항증명서 또는 토지사용승낙서(남의 땅인 경우)",
          "사업계획서·시설물 배치도(농지전용)",
          "토목·건축 설계도서(땅깎기·흙쌓기나 건축이 있는 경우)",
          "받은 보완 요구서·불허가 통지서"
        ],
        "process": [
          "토지이용계획확인서로 용도지역·지목·도로 확인",
          "필요한 허가 구분(개발행위·농지전용·토지분할)과 담당 부서 확인",
          "사업계획서 등 신청 서류 작성",
          "신청서 제출 대행과 보완 요구 대응",
          "농지보전부담금 납부(허가 전), 준공검사, 지적 분할 신청 등 남은 절차 안내"
        ],
        "review": [
          "용도지역별 허가 기준과 규모 제한 대조(국토계획법 제58조)",
          "개발행위허가와 함께 처리되는 농지·산지전용 등 관련 인허가 정리",
          "사업계획서와 보완 요구 대응, 불허가 때 재신청·행정심판 경로 검토"
        ],
        "sources": [
          {
            "label": "국토계획법 제56조 — 개발행위의 허가",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%AD%ED%86%A0%EC%9D%98%EA%B3%84%ED%9A%8D%EB%B0%8F%EC%9D%B4%EC%9A%A9%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0/%EC%A0%9C56%EC%A1%B0"
          },
          {
            "label": "국토계획법 시행령 제51조 — 개발행위허가 대상(토지분할 포함)",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%AD%ED%86%A0%EC%9D%98%EA%B3%84%ED%9A%8D%EB%B0%8F%EC%9D%B4%EC%9A%A9%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0%EC%8B%9C%ED%96%89%EB%A0%B9/%EC%A0%9C51%EC%A1%B0"
          },
          {
            "label": "농지법 제34조 — 농지의 전용허가·협의",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%86%8D%EC%A7%80%EB%B2%95/%EC%A0%9C34%EC%A1%B0"
          },
          {
            "label": "공간정보관리법 제79조 — 토지 분할 신청",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B3%B5%EA%B0%84%EC%A0%95%EB%B3%B4%EC%9D%98%EA%B5%AC%EC%B6%95%EB%B0%8F%EA%B4%80%EB%A6%AC%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0/%EC%A0%9C79%EC%A1%B0"
          },
          {
            "label": "토지이음 — 토지이용계획 열람",
            "url": "https://www.eum.go.kr/web/am/amMain.jsp"
          }
        ]
      },
      "procurement": {
        "service": "직접생산확인 · 여성기업확인 · 입찰참가자격",
        "deadlines": [],
        "documents": [
          "사업자등록증·법인 등기사항증명서",
          "공장등록증명서(제조업)",
          "생산설비·장비·인력 현황 자료(직접생산확인)",
          "주주명부 등 출자 현황(여성기업확인, 법인)",
          "업종에 필요한 허가·면허·등록증(입찰참가자격 등록)"
        ],
        "process": [
          "업종·제품과 참여하려는 공고의 자격 조건 확인",
          "필요한 확인·등록 구분(직접생산·여성기업·입찰참가자격)",
          "확인기준 대조와 신청 서류 작성",
          "신청서 제출 대행과 보완·현장 확인 대응",
          "증명서 유효기간과 변경 사항 관리 안내"
        ],
        "review": [
          "제품별 직접생산 확인기준과 공장 현황 대조",
          "여성기업 기준(대표 등기·최대출자) 충족 여부와 서류 정합성",
          "입찰참가자격 등록 업종·품목 선택과 변경등록 관리"
        ],
        "sources": [
          {
            "label": "판로지원법 제9조 — 직접생산의 확인",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A4%91%EC%86%8C%EA%B8%B0%EC%97%85%EC%A0%9C%ED%92%88%EA%B5%AC%EB%A7%A4%EC%B4%89%EC%A7%84%EB%B0%8F%ED%8C%90%EB%A1%9C%EC%A7%80%EC%9B%90%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0/%EC%A0%9C9%EC%A1%B0"
          },
          {
            "label": "여성기업지원법 제20조의2 — 여성기업의 확인",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%97%AC%EC%84%B1%EA%B8%B0%EC%97%85%EC%A7%80%EC%9B%90%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0/%EC%A0%9C20%EC%A1%B0%EC%9D%982"
          },
          {
            "label": "국가계약법 시행규칙 제15조 — 입찰참가자격의 등록",
            "url": "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%AD%EA%B0%80%EB%A5%BC%EB%8B%B9%EC%82%AC%EC%9E%90%EB%A1%9C%ED%95%98%EB%8A%94%EA%B3%84%EC%95%BD%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99/%EC%A0%9C15%EC%A1%B0"
          },
          {
            "label": "공공구매종합정보망 — 직접생산확인 신청",
            "url": "https://www.smpp.go.kr"
          },
          {
            "label": "여성기업종합정보포털 — 여성기업 확인",
            "url": "https://www.wbiz.or.kr"
          },
          {
            "label": "나라장터 — 입찰참가자격 등록",
            "url": "https://www.g2b.go.kr"
          }
        ]
      }
    },
    "checks": {
      "permit": {
        "title": "인허가 신청·변경 사전 점검",
        "form": "yx5fls",
        "questions": [
          {
            "id": "permit-type",
            "options": {
              "corporation": {
                "level": "ready",
                "note": "법인이 할 일과 주로 활동할 지역을 적어 두세요.",
                "lawRef": "민법 제32조"
              },
              "factory": {
                "level": "official",
                "note": "제조할 품목과 공장 주소를 준비하면 담당 부서에 절차를 물어볼 수 있습니다.",
                "lawRef": "산업집적활성화 및 공장설립에 관한 법률 제13조·제16조"
              },
              "warehouse": {
                "level": "official",
                "note": "어떤 물품을 어디에 얼마나 보관할지 정리해 두세요.",
                "lawRef": "물류시설의 개발 및 운영에 관한 법률 제21조의2"
              },
              "business": {
                "level": "ready",
                "note": "판매할 음식이나 가르칠 과목처럼 실제로 할 일을 적어 두세요.",
                "lawRef": "식품위생법 제37조·학원의 설립·운영 및 과외교습에 관한 법률 제6조"
              },
              "other": {
                "level": "official",
                "note": "지금 하는 일과 새로 하려는 일을 한 문장씩 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "사업 이름을 몰라도 괜찮습니다. 누구에게 어떤 제품이나 서비스를 제공할지 설명해 주세요."
              }
            }
          },
          {
            "id": "permit-purpose",
            "options": {
              "new": {
                "level": "ready",
                "note": "사업 내용과 시작할 지역을 정리해 필요한 신청을 확인하세요."
              },
              "change": {
                "level": "official",
                "note": "기존 증서에서 바뀔 항목을 표시하고 변경 예정일 또는 실제 변경일을 적어 두세요."
              },
              "takeover": {
                "level": "official",
                "note": "현재 영업자 명의의 증서와 인수 예정일을 확인해 명의를 바꾸는 절차를 문의하세요."
              },
              "other": {
                "level": "official",
                "note": "현재 사업 상태와 원하는 변경 내용을 담당 부서에 설명해 주세요."
              }
            }
          },
          {
            "id": "permit-authority",
            "options": {
              "contacted": {
                "level": "ready",
                "note": "알아둔 연락처로 신청서와 제출 서류 목록을 요청하세요."
              },
              "department": {
                "level": "official",
                "note": "기관 홈페이지나 대표번호에서 해당 부서의 연락처를 확인하세요."
              },
              "agencyonly": {
                "level": "official",
                "note": "대표번호에 사업 내용과 소재지를 말하고 담당 부서 연결을 요청하세요."
              },
              "none": {
                "level": "official",
                "note": "사업할 지역과 업종을 정리해 해당 지역 시·군·구 민원실에 문의하세요."
              }
            }
          },
          {
            "id": "permit-address",
            "options": {
              "candidate": {
                "level": "ready",
                "note": "계약 전 후보지 주소와 층·호수를 담당 부서에 알려 원하는 용도로 쓸 수 있는지 물어보세요."
              },
              "contracted": {
                "level": "documents",
                "note": "계약서에서 주소와 사용할 공간을 확인하세요."
              },
              "owned": {
                "level": "ready",
                "note": "사용할 건물의 주소와 층·호수를 적어 두세요."
              },
              "notyet": {
                "level": "ready",
                "note": "장소를 고르기 전에 업종과 필요한 면적을 적어 담당 부서에 문의하세요."
              },
              "no-location-change": {
                "level": "ready",
                "note": "기존 증서에서 사업장 주소와 이번에 바꿀 항목을 확인하세요."
              },
              "no-site-advised": {
                "level": "ready",
                "note": "장소 외에 요청받은 서류를 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "이번 신청에 주소나 장소 사용 서류가 필요한지 물어보세요."
              }
            }
          },
          {
            "id": "permit-site-advice",
            "showWhen": {
              "permit-address": [
                "candidate",
                "contracted",
                "owned"
              ]
            },
            "options": {
              "allowed": {
                "level": "ready",
                "note": "안내받은 주소와 업종이 실제 계획과 같은지 확인하세요."
              },
              "conditions": {
                "level": "official",
                "note": "안내받은 조건과 바꿀 수 있는 부분을 적어 두세요."
              },
              "waiting": {
                "level": "official",
                "note": "문의한 날짜와 담당 부서 연락처를 보관하세요."
              },
              "none": {
                "level": "official",
                "note": "주소, 층·호수, 하려는 일을 알려 그 장소를 쓸 수 있는지 문의하세요."
              },
              "unknown": {
                "level": "official",
                "note": "계약이나 공사 전에 해당 주소와 업종으로 다시 확인하세요."
              }
            }
          },
          {
            "id": "permit-building",
            "showWhen": {
              "permit-address": [
                "candidate",
                "contracted",
                "owned"
              ]
            },
            "options": {
              "clean": {
                "level": "ready",
                "note": "확인한 대장을 보관하고 실제 사용할 층과 용도를 담당 부서에 알려 주세요."
              },
              "flagged": {
                "level": "official",
                "note": "대장에서 표시된 위치를 확인하고 이번 신청에 어떤 영향이 있는지 문의하세요."
              },
              "notchecked": {
                "level": "official",
                "note": "정부24나 시·군·구에서 해당 건물의 건축물대장을 확인할 수 있습니다."
              },
              "na": {
                "level": "ready",
                "note": "사용할 땅이나 야외 공간이 있다면 그 위치를 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "대장을 담당 부서에 보여 주고 표시가 있는지 확인하세요."
              }
            }
          },
          {
            "id": "permit-facility-advice",
            "options": {
              "pending": {
                "level": "documents",
                "note": "요청받은 작업과 끝낼 수 있는 날짜를 적어 두세요."
              },
              "done": {
                "level": "ready",
                "note": "작업 전후 사진이나 도면 등 완료 상태를 보여 줄 자료를 보관하세요."
              },
              "not-needed": {
                "level": "ready",
                "note": "안내받은 범위와 실제 운영 계획이 같은지 확인하세요."
              },
              "none": {
                "level": "official",
                "note": "공사나 장비 구입 전에 이번 신청의 시설 조건을 물어보세요."
              },
              "na": {
                "level": "ready",
                "note": "이번에 바뀌는 사항을 보여 주는 서류를 정리하세요."
              },
              "unknown": {
                "level": "official",
                "note": "받은 문자나 서류에서 시설 관련 요청을 확인하세요."
              }
            }
          },
          {
            "id": "permit-personnel-advice",
            "options": {
              "collected": {
                "level": "ready",
                "note": "서류의 이름과 대상자가 요청받은 목록과 일치하는지 보세요."
              },
              "pending": {
                "level": "documents",
                "note": "남은 교육 일정이나 서류 발급 날짜를 확인하세요."
              },
              "not-needed": {
                "level": "ready",
                "note": "다른 제출 서류를 준비하세요."
              },
              "none": {
                "level": "official",
                "note": "신청할 업종과 바뀌는 내용을 말하고 교육·자격 관련 서류가 필요한지 물어보세요."
              },
              "unknown": {
                "level": "official",
                "note": "최근 받은 서류 목록을 다시 보거나 담당 부서에 요청하세요."
              }
            }
          },
          {
            "id": "permit-stage",
            "options": {
              "reviewing": {
                "level": "ready",
                "note": "하려는 일과 변경할 내용을 정리하면 담당 부서에 문의하기 쉽습니다."
              },
              "preparing": {
                "level": "documents",
                "note": "받은 목록과 준비된 서류를 하나씩 대조하세요."
              },
              "submitted": {
                "level": "ready",
                "note": "접수번호와 접수일을 보관하고 처리 상황을 확인하세요."
              },
              "supplement": {
                "level": "documents",
                "note": "요청서에서 추가할 서류, 제출 방법, 마감일을 함께 확인하세요."
              },
              "rejectedwithdoc": {
                "level": "official",
                "note": "통지서의 반려 사유와 받은 날짜를 확인해 다음 절차를 문의하세요."
              },
              "rejectednodoc": {
                "level": "official",
                "note": "담당 부서에 진행 상태와 반려 사유가 적힌 문서를 요청하세요."
              },
              "finished": {
                "level": "ready",
                "note": "발급받은 서류에서 사업 내용과 조건을 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "접수번호나 신청인 이름으로 담당 부서에 처리 상태를 물어보세요."
              }
            }
          },
          {
            "id": "permit-supplement-deadline",
            "showWhen": {
              "permit-stage": [
                "supplement"
              ]
            },
            "options": {
              "four-plus": {
                "level": "documents",
                "note": "발급에 시간이 걸리는 서류부터 준비하세요."
              },
              "soon": {
                "level": "urgent",
                "note": "오늘 담당 부서에 제출 방법을 확인하세요. 준비가 어려운 항목이 있으면 기한 전에 알려 주세요.",
                "lawRef": "민원 처리에 관한 법률 제22조"
              },
              "passed": {
                "level": "urgent",
                "note": "담당 부서에 현재 처리 상태와 추가 제출이 가능한지 바로 확인하세요.",
                "lawRef": "민원 처리에 관한 법률 제22조"
              },
              "unknown": {
                "level": "urgent",
                "note": "요청을 보낸 부서에 연락해 정확한 마감일과 제출 방법을 확인하세요.",
                "lawRef": "민원 처리에 관한 법률 제22조"
              }
            }
          },
          {
            "id": "permit-opening",
            "options": {
              "already": {
                "level": "official",
                "note": "실제 시작일 또는 변경일을 적어 담당 부서에 필요한 절차와 기한을 물어보세요."
              },
              "month": {
                "level": "official",
                "note": "희망 날짜를 알려 처리에 걸리는 시간과 신청 시점을 확인하세요."
              },
              "later": {
                "level": "ready",
                "note": "공사, 교육, 서류 발급에 필요한 시간을 일정에 반영하세요."
              },
              "undecided": {
                "level": "ready",
                "note": "절차에 필요한 시간을 확인한 뒤 희망 날짜를 정하세요."
              }
            }
          }
        ],
        "overrides": []
      },
      "suspension": {
        "title": "영업정지 처분 대응 사전 점검",
        "form": "1uq53z6",
        "questions": [
          {
            "id": "susp-business",
            "options": {
              "restaurant": {
                "level": "ready",
                "note": "영업신고증이나 허가증에 적힌 업종명을 확인하세요."
              },
              "karaoke": {
                "level": "ready",
                "note": "등록증에 적힌 업종명과 실제 영업 내용을 확인하세요."
              },
              "academy": {
                "level": "ready",
                "note": "등록증이나 신고증과 교육지원청에서 받은 문서를 함께 보관하세요."
              },
              "other": {
                "level": "official",
                "note": "영업 관련 증서와 이번 통지서에 적힌 사업장 이름을 확인하세요."
              },
              "unknown": {
                "level": "ready",
                "note": "신고증·등록증·허가증의 업종란을 확인해 주세요."
              }
            }
          },
          {
            "id": "susp-stage",
            "options": {
              "prior-notice": {
                "level": "documents",
                "note": "의견을 어디로 언제까지 내야 하는지 먼저 확인하세요.",
                "lawRef": "행정절차법 제21조"
              },
              "confirmed": {
                "level": "official",
                "note": "처분 사유와 영업정지 기간, 불복 방법이 적힌 부분을 확인하세요."
              },
              "investigating": {
                "level": "ready",
                "note": "조사 날짜와 당시 설명한 내용을 메모하고 받은 서류를 모아 두세요."
              },
              "none": {
                "level": "ready",
                "note": "걱정되는 상황이 생긴 날짜와 내용을 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "연락한 부서에 문서 제목과 예정된 절차를 문의하세요."
              }
            }
          },
          {
            "id": "susp-opinion-deadline",
            "showWhen": {
              "susp-stage": [
                "prior-notice"
              ]
            },
            "options": {
              "four-plus": {
                "level": "documents",
                "note": "설명할 사실과 제출할 자료를 정리해 안내된 기한까지 내세요."
              },
              "soon": {
                "level": "urgent",
                "note": "오늘 제출 방법과 마감 시간을 확인하고 설명할 사실부터 정리하세요.",
                "lawRef": "행정절차법 제27조"
              },
              "passed": {
                "level": "urgent",
                "note": "최종 처분이 나왔는지, 지금이라도 의견을 받을 수 있는지 담당 부서에 바로 물어보세요.",
                "lawRef": "행정절차법 제27조"
              },
              "unknown": {
                "level": "urgent",
                "note": "문서에 적힌 담당 부서에 연락해 의견을 낼 날짜와 방법을 확인하세요.",
                "lawRef": "행정절차법 제27조"
              }
            }
          },
          {
            "id": "susp-elapsed",
            "showWhen": {
              "susp-stage": [
                "confirmed"
              ]
            },
            "options": {
              "within30": {
                "level": "official",
                "note": "처분을 처음 안 날과 받은 날을 적어 두세요. 취소를 구하는 행정심판은 원칙적으로 안 날부터 90일, 처분이 있은 날부터 180일 이내입니다.",
                "lawRef": "행정심판법 제27조"
              },
              "d31to60": {
                "level": "official",
                "note": "통지서와 수령 내역을 함께 보관하고, 다투려는 절차의 마감일을 확인하세요."
              },
              "d61to90": {
                "level": "urgent",
                "note": "처분을 처음 안 날과 처분일을 확인해 행정심판을 언제까지 청구할 수 있는지 바로 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "over90": {
                "level": "urgent",
                "note": "불복 방법을 어떻게 안내받았는지와 이후 밟은 절차를 알려 가능한 대응을 바로 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "unknown": {
                "level": "urgent",
                "note": "등기 수령 내역이나 전자문서 기록을 확인하고 문서를 보낸 부서에 송달일을 문의하세요.",
                "lawRef": "행정심판법 제27조"
              }
            }
          },
          {
            "id": "susp-reason",
            "options": {
              "youth": {
                "level": "official",
                "note": "당시 상황과 나이를 어떻게 확인했는지 기록이 있다면 정리하세요."
              },
              "hygiene": {
                "level": "documents",
                "note": "점검 당시 사진과 지적받은 내용, 이후 고친 내역을 구분해 보관하세요."
              },
              "unlicensed": {
                "level": "official",
                "note": "기존 증서, 실제 영업·변경 날짜, 신고 내역을 함께 확인하세요."
              },
              "other": {
                "level": "official",
                "note": "문서에서 문제가 된 행동이나 날짜가 적힌 부분을 표시하세요."
              },
              "unknown": {
                "level": "official",
                "note": "연락한 기관에 어떤 일에 대한 조사나 통지인지 물어보세요."
              }
            }
          },
          {
            "id": "susp-count",
            "options": {
              "first": {
                "level": "ready",
                "note": "이번 점검일과 처분서에 적힌 내용을 기록하세요."
              },
              "second": {
                "level": "official",
                "note": "그때 받은 처분서에서 날짜와 사유를 확인하세요."
              },
              "third": {
                "level": "official",
                "note": "이전 처분서를 날짜순으로 모아 이번에 지적된 내용과 비교하세요."
              },
              "unknown": {
                "level": "official",
                "note": "과거 문서에서 지적된 내용과 처분 날짜를 확인하세요."
              }
            }
          },
          {
            "id": "susp-livelihood",
            "options": {
              "only": {
                "level": "documents",
                "note": "매출과 매달 나가는 비용을 보여 줄 자료를 정리하세요."
              },
              "main": {
                "level": "documents",
                "note": "최근 매출과 생활비에 쓰는 금액을 설명할 자료를 모아 두세요."
              },
              "side": {
                "level": "ready",
                "note": "영업정지로 영향을 받을 계약이나 직원 근무 일정이 있으면 정리하세요."
              },
              "other": {
                "level": "ready",
                "note": "확인되는 매출, 임차료, 임금 등 사업장에 생길 영향을 적어 보세요."
              }
            }
          },
          {
            "id": "susp-execution",
            "showWhen": {
              "susp-stage": [
                "confirmed"
              ]
            },
            "options": {
              "scheduled": {
                "level": "urgent",
                "note": "행정심판을 청구해도 영업정지 효력은 자동으로 멈추지 않습니다. 시작일 전에 집행정지를 신청할 필요가 있는지 확인하세요.",
                "lawRef": "행정심판법 제30조"
              },
              "ongoing": {
                "level": "urgent",
                "note": "남은 기간과 예상 손해를 정리해 집행정지 등 가능한 절차를 바로 확인하세요.",
                "lawRef": "행정심판법 제30조"
              },
              "finished": {
                "level": "official",
                "note": "처분서와 실제 정지 기간을 보관하고 이후 영업에 미치는 영향을 확인하세요."
              },
              "no-date": {
                "level": "official",
                "note": "일정을 어떻게 통보받는지 처분서를 보낸 부서에 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "처분서에 적힌 담당 부서에 시작일과 종료일을 바로 물어보세요."
              }
            }
          },
          {
            "id": "susp-evidence",
            "options": {
              "collected": {
                "level": "ready",
                "note": "자료마다 날짜와 어떤 사실을 보여 주는지 짧게 적어 두세요."
              },
              "partial": {
                "level": "documents",
                "note": "남은 자료 중 영상처럼 보관 기간이 짧은 것부터 확인하세요."
              },
              "none": {
                "level": "documents",
                "note": "당시 근무자, 현장 기록, 제출한 서류 중 확보할 수 있는 것을 적어 보세요."
              },
              "unknown": {
                "level": "official",
                "note": "지적받은 내용을 먼저 확인하고 그날 상황을 보여 줄 자료를 찾아보세요."
              }
            }
          },
          {
            "id": "susp-fine-advice",
            "showWhen": {
              "susp-stage": [
                "prior-notice",
                "confirmed"
              ]
            },
            "options": {
              "available": {
                "level": "official",
                "note": "요청 서류와 신청 방법을 담당 부서에 확인하세요."
              },
              "unavailable": {
                "level": "official",
                "note": "안내받은 이유와 문서에 적힌 처분 내용을 함께 확인하세요."
              },
              "none": {
                "level": "ready",
                "note": "과징금이 가능한지 알고 싶다면 담당 부서에 업종과 지적 사유를 알려 문의하세요."
              },
              "unknown": {
                "level": "ready",
                "note": "처분서에 과징금 관련 안내가 있는지 살펴보세요."
              }
            }
          }
        ],
        "overrides": []
      },
      "dui": {
        "title": "음주운전 면허 처분 사전 점검",
        "form": "dg6woy",
        "questions": [
          {
            "id": "dui-disposition",
            "options": {
              "suspend": {
                "level": "ready",
                "note": "통지서에서 정지 시작일·종료일과 처분 사유를 확인하세요."
              },
              "revoke": {
                "level": "official",
                "note": "통지서에 적힌 취소일과 사유를 확인하고 받은 날짜를 적어 두세요."
              },
              "prior-notice": {
                "level": "official",
                "note": "결정 전 의견을 낼 날짜와 제출할 곳을 안내문에서 확인하세요."
              },
              "investigation": {
                "level": "ready",
                "note": "조사를 받은 날짜와 담당 경찰서를 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "문서 제목을 확인하거나 담당 경찰서에 면허 처분 여부를 물어보세요."
              }
            }
          },
          {
            "id": "dui-elapsed",
            "showWhen": {
              "dui-disposition": [
                "suspend",
                "revoke",
                "unknown"
              ]
            },
            "options": {
              "none": {
                "level": "official",
                "note": "다른 방법으로 처분을 알게 된 적이 있다면 그 날짜도 적어 담당 경찰서에 통지 내역을 확인하세요."
              },
              "within30": {
                "level": "official",
                "note": "면허 이의신청은 처분을 받은 날부터 60일 이내입니다. 행정심판은 원칙적으로 처분을 안 날부터 90일, 처분이 있은 날부터 180일 이내입니다.",
                "lawRef": "도로교통법 제94조·행정심판법 제27조"
              },
              "d31to60": {
                "level": "urgent",
                "note": "면허 이의신청은 처분을 받은 날부터 60일 이내입니다. 접수 여부와 정확한 마감일을 바로 확인하세요.",
                "lawRef": "도로교통법 제94조"
              },
              "d61to90": {
                "level": "urgent",
                "note": "처분을 안 날부터 90일이 가까울 수 있습니다. 처분일과 이의신청 여부를 알려 행정심판 기한을 바로 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "over90": {
                "level": "urgent",
                "note": "처분을 안 날부터 90일이 지났다면 원칙적으로 행정심판 청구 기한이 지났습니다. 이의신청 결과나 기한 안내가 있었다면 통지서를 함께 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "unknown": {
                "level": "urgent",
                "note": "등기 수령 내역이나 전자통지 기록이 있는지 보고 담당 경찰서에 송달 내역을 문의하세요.",
                "lawRef": "행정심판법 제27조"
              }
            }
          },
          {
            "id": "dui-procedure",
            "showWhen": {
              "dui-disposition": [
                "suspend",
                "revoke",
                "unknown"
              ]
            },
            "options": {
              "no": {
                "level": "ready",
                "note": "절차를 검토한다면 받은 통지서와 수령일을 먼저 확인하세요."
              },
              "objection": {
                "level": "official",
                "note": "이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 결과 전에 먼저 행정심판을 청구하면 이 특례는 적용되지 않습니다.",
                "lawRef": "도로교통법 제94조"
              },
              "objection-result": {
                "level": "official",
                "note": "이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 결과 전에 이미 행정심판을 청구했다면 이 특례가 아니고, 먼저 낸 사건의 진행 상태를 확인하세요.",
                "lawRef": "도로교통법 제94조"
              },
              "appeal": {
                "level": "official",
                "note": "사건번호와 위원회가 안내한 추가 자료 제출 일정을 확인하세요."
              },
              "appeal-done": {
                "level": "official",
                "note": "재결서와 실제 받은 날짜를 보관하고 다음 절차를 검토한다면 그 기한을 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "접수증이나 문자의 제목에서 이의신청인지 행정심판인지 확인하세요."
              }
            }
          },
          {
            "id": "dui-refusal",
            "options": {
              "measured": {
                "level": "ready",
                "note": "측정 시각과 안내받은 수치를 확인하세요."
              },
              "yes": {
                "level": "official",
                "note": "경찰이 기록한 측정 요구와 당시 설명을 확인하세요. 측정 거부는 면허취소 사유가 될 수 있습니다.",
                "lawRef": "도로교통법 제93조"
              },
              "not-asked": {
                "level": "official",
                "note": "당시 어떤 조사를 받았고 어떤 서류를 받았는지 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "당시 상황과 경찰이 알려 준 내용을 각각 적어 두세요."
              }
            }
          },
          {
            "id": "dui-bac",
            "showWhen": {
              "dui-refusal": [
                "measured",
                "unknown"
              ]
            },
            "options": {
              "below003": {
                "level": "ready",
                "note": "측정 결과와 통지서에 적힌 처분 사유를 함께 확인하세요."
              },
              "low": {
                "level": "ready",
                "note": "측정값과 측정 시각을 적어 두세요. 실제 면허 처분은 사고와 이전 이력도 함께 확인합니다."
              },
              "mid": {
                "level": "official",
                "note": "결정 통지서에 적힌 측정값을 확인하고 사고와 이전 이력이 있었는지 함께 정리하세요."
              },
              "over01": {
                "level": "official",
                "note": "혈중알코올농도 0.1% 초과는 이의신청 감경 제외 사유입니다. 측정 기록과 통지서의 수치가 같은지 확인하세요.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "unknown": {
                "level": "documents",
                "note": "측정 결과를 안내받은 서류나 통지서를 찾고, 없으면 담당 경찰서에 확인하세요."
              }
            }
          },
          {
            "id": "dui-accident",
            "options": {
              "none": {
                "level": "ready",
                "note": "단속된 날짜와 장소를 확인해 두세요."
              },
              "property": {
                "level": "official",
                "note": "사고 접수번호와 보험 처리 내역이 있다면 정리하세요."
              },
              "injury": {
                "level": "official",
                "note": "음주운전 중 인적 피해 교통사고는 이의신청 감경 제외 사유입니다. 사고 기록에서 피해 내용과 경위를 확인하세요.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "unknown": {
                "level": "official",
                "note": "경찰이나 보험사가 안내한 사고 접수 내용부터 확인하세요."
              }
            }
          },
          {
            "id": "dui-history",
            "options": {
              "none": {
                "level": "ready",
                "note": "5년보다 오래된 이력이 있다면 적발 시기도 함께 적어 두세요."
              },
              "once": {
                "level": "official",
                "note": "최근 5년 내 음주운전 전력은 이의신청 감경 제외 사유입니다. 이전 적발일과 처분 내용을 확인하세요.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "multi": {
                "level": "official",
                "note": "최근 5년 내 음주운전 전력은 이의신청 감경 제외 사유입니다. 각 적발일과 처분 내용을 정리하세요.",
                "lawRef": "도로교통법 시행규칙 별표 28"
              },
              "unknown": {
                "level": "official",
                "note": "이전 면허 처분서가 있는지 찾고 담당 경찰서에 기록 확인 방법을 물어보세요."
              }
            }
          },
          {
            "id": "dui-livelihood",
            "options": {
              "job": {
                "level": "documents",
                "note": "운전 업무와 근무 사실을 보여 줄 재직증명서나 운송 계약 등을 정리하세요."
              },
              "work": {
                "level": "documents",
                "note": "주로 다니는 현장과 업무 중 차량을 써야 하는 이유를 적어 두세요."
              },
              "commute": {
                "level": "ready",
                "note": "자주 다니는 경로와 다른 이동 수단을 이용할 수 있는지 정리하세요."
              },
              "no": {
                "level": "ready",
                "note": "면허 처분에서 확인하고 싶은 사실과 받은 통지서를 준비하세요."
              },
              "other": {
                "level": "ready",
                "note": "일주일 동안 운전한 날과 목적지를 떠올려 필요한 이유를 적어 보세요."
              }
            }
          },
          {
            "id": "dui-evidence",
            "showWhen": {
              "dui-livelihood": [
                "job",
                "work",
                "commute",
                "other"
              ]
            },
            "options": {
              "ready": {
                "level": "ready",
                "note": "자료마다 어떤 업무와 날짜를 보여 주는지 정리하세요."
              },
              "partial": {
                "level": "documents",
                "note": "부족한 자료 이름과 발급받을 곳을 적어 두세요."
              },
              "none": {
                "level": "documents",
                "note": "재직 확인이나 업무 일정처럼 현재 구할 수 있는 것부터 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "운전이 필요한 일과 빈도를 먼저 설명하고 알맞은 자료를 확인하세요."
              }
            }
          },
          {
            "id": "dui-criminal",
            "options": {
              "none": {
                "level": "ready",
                "note": "추후 연락이 오면 보낸 기관과 문서 제목을 적어 두세요."
              },
              "investigating": {
                "level": "official",
                "note": "조사 일정과 안내받은 사건번호를 보관하세요."
              },
              "trial": {
                "level": "official",
                "note": "법원 문서와 받은 날짜를 보관하고 문서에 적힌 기한을 따로 확인하세요."
              },
              "done": {
                "level": "ready",
                "note": "최종 결과를 확인할 문서를 보관하세요."
              },
              "unknown": {
                "level": "official",
                "note": "최근 연락한 기관과 사건번호를 확인해 진행 상태를 물어보세요."
              }
            }
          }
        ],
        "overrides": [
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-elapsed": [
                "d31to60",
                "d61to90",
                "over90",
                "unknown"
              ],
              "dui-procedure": [
                "objection"
              ]
            },
            "note": "경찰의 이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 결과 전에 먼저 행정심판을 청구하면 이 특례는 적용되지 않습니다.",
            "lawRef": "도로교통법 제94조",
            "level": "ready"
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
            "note": "받은 문서가 처분 통지서인지 결과 통지서인지 확인하세요. 이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다(결과 전에 이미 행정심판을 청구한 경우는 제외).",
            "lawRef": "도로교통법 제94조"
          },
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-elapsed": [
                "within30",
                "d31to60",
                "d61to90",
                "over90",
                "unknown"
              ],
              "dui-procedure": [
                "objection-result"
              ]
            },
            "note": "이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다(결과 전에 이미 행정심판을 청구한 경우는 제외). 결과 통지서의 수령일을 확인하세요.",
            "lawRef": "도로교통법 제94조"
          },
          {
            "questionId": "dui-elapsed",
            "when": {
              "dui-procedure": [
                "appeal",
                "appeal-done"
              ]
            },
            "note": "기한 안에 냈는지는 행정심판을 청구한 날을 기준으로 봅니다. 접수증과 위원회가 보낸 최근 문서를 확인하세요.",
            "lawRef": "행정심판법 제27조",
            "level": "documents"
          }
        ]
      },
      "veterans": {
        "title": "국가유공자 등록 사전 점검",
        "form": "ope175",
        "questions": [
          {
            "id": "vet-applicant",
            "options": {
              "self": {
                "level": "ready",
                "note": "근무했던 기관과 사건이 있었던 때를 적어 두세요."
              },
              "family": {
                "level": "ready",
                "note": "당사자와의 관계를 알려 주면 누가 신청할 수 있는지 확인하는 데 도움이 됩니다."
              },
              "other": {
                "level": "official",
                "note": "당사자와의 관계를 설명하고 신청 방법을 관할 보훈관서에 물어보세요."
              }
            }
          },
          {
            "id": "vet-event",
            "options": {
              "injury": {
                "level": "ready",
                "note": "언제 어디에서 어떤 일을 하던 중 다쳤거나 증상이 시작됐는지 적어 두세요."
              },
              "death": {
                "level": "ready",
                "note": "돌아가신 날짜와 당시 소속, 가족이 들은 경위를 정리하세요."
              },
              "other": {
                "level": "ready",
                "note": "참전 시기와 소속 등 이번 신청과 관련해 알고 있는 사실을 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "당시 소속이나 대략적인 시기처럼 확인되는 사실부터 적어 두세요."
              }
            }
          },
          {
            "id": "vet-stage",
            "options": {
              "before": {
                "level": "ready",
                "note": "신청하려는 내용과 당사자의 소속을 관할 보훈관서에 알려 준비할 자료를 확인하세요."
              },
              "reviewing": {
                "level": "ready",
                "note": "접수번호와 최근 받은 안내를 보관하세요. 보완이나 검사 일정이 있다면 날짜를 확인하세요."
              },
              "rejected": {
                "level": "official",
                "note": "결정서에 적힌 사유와 받은 날짜를 확인하세요. 어떤 절차로 언제까지 다툴 수 있는지 함께 살펴보세요."
              },
              "filed": {
                "level": "official",
                "note": "제출한 서류 이름과 날짜, 접수번호를 확인하세요."
              },
              "accepted": {
                "level": "ready",
                "note": "발급 안내와 추가로 신청할 수 있는 지원을 확인하세요."
              },
              "other": {
                "level": "official",
                "note": "최근 문서 제목이나 접수번호로 관할 보훈관서에 현재 상태를 확인하세요."
              }
            }
          },
          {
            "id": "vet-elapsed",
            "showWhen": {
              "vet-stage": [
                "rejected"
              ]
            },
            "options": {
              "within30": {
                "level": "official",
                "note": "일부 결정은 받은 날부터 30일 이내에 이의신청할 수 있습니다. 결정서에서 대상과 기한을 바로 확인하세요.",
                "lawRef": "국가유공자 등 예우 및 지원에 관한 법률 제74조의18"
              },
              "d31to90": {
                "level": "urgent",
                "note": "취소를 구하는 행정심판은 원칙적으로 처분을 안 날부터 90일, 처분이 있은 날부터 180일 이내입니다. 이의신청 여부도 알려 기한을 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "over90": {
                "level": "urgent",
                "note": "첫 결정과 이후 이의신청 결과가 있다면 두 문서를 함께 보세요. 받은 날짜와 불복 안내를 바탕으로 가능한 절차를 바로 확인하세요.",
                "lawRef": "행정심판법 제27조"
              },
              "unknown": {
                "level": "urgent",
                "note": "등기 수령 내역이나 전자통지를 확인하고 관할 보훈관서에 발송·송달 내역을 문의하세요.",
                "lawRef": "행정심판법 제27조"
              }
            }
          },
          {
            "id": "vet-connection",
            "options": {
              "collected": {
                "level": "ready",
                "note": "자료에 적힌 시기·장소·소속을 확인해 사건 순서대로 모아 두세요."
              },
              "partial": {
                "level": "documents",
                "note": "찾는 자료가 무엇인지, 누가 작성했는지 적어 두세요."
              },
              "not-collected": {
                "level": "documents",
                "note": "당시 소속 기관에 어떤 기록이 남아 있고 어떻게 요청하는지 물어보세요."
              },
              "unsure": {
                "level": "official",
                "note": "기억나는 경위를 적어 보훈관서에 문의하면 필요한 자료를 좁힐 수 있습니다."
              }
            }
          },
          {
            "id": "vet-records",
            "showWhen": {
              "vet-event": [
                "injury",
                "death"
              ]
            },
            "options": {
              "collected": {
                "level": "ready",
                "note": "처음 진료받은 날짜와 병원 이름을 표시해 두세요."
              },
              "partial": {
                "level": "documents",
                "note": "빠진 병원과 진료 시기를 적어 기록 발급 방법을 문의하세요."
              },
              "no-copies": {
                "level": "documents",
                "note": "병원 이름과 대략적인 진료 시기를 정리해 기록이 남아 있는지 문의하세요."
              },
              "no-treatment": {
                "level": "ready",
                "note": "처음 치료받은 시기나 당시 상태를 기억하는 사람이 있는지 적어 두세요."
              },
              "unknown": {
                "level": "official",
                "note": "당시 소속이나 가족에게 기억나는 병원과 시기를 확인해 보세요."
              }
            }
          },
          {
            "id": "vet-current",
            "showWhen": {
              "vet-event": [
                "injury"
              ]
            },
            "options": {
              "yes": {
                "level": "ready",
                "note": "가장 최근 진료일을 확인하고 이전 기록과 함께 정리하세요."
              },
              "none": {
                "level": "documents",
                "note": "최근 진료받은 곳이 있다면 기록을 발급받을 수 있는지 물어보세요."
              },
              "unknown": {
                "level": "official",
                "note": "최근 진료받은 병원과 시기를 먼저 적어 보세요."
              }
            }
          },
          {
            "id": "vet-history",
            "options": {
              "first": {
                "level": "ready",
                "note": "처음 신청하는 경위와 당시 소속을 적어 두세요."
              },
              "once": {
                "level": "official",
                "note": "이전 결정서의 사유를 확인하고 그때 냈던 자료를 함께 준비하세요."
              },
              "multi": {
                "level": "official",
                "note": "각 결정서를 받은 순서대로 놓고 사유와 제출 자료를 비교해 보세요."
              },
              "other": {
                "level": "official",
                "note": "이전 접수번호나 결과 문서를 찾아 어떤 절차였는지 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "당사자나 가족이 보관한 접수증·결정서부터 확인해 보세요."
              }
            }
          },
          {
            "id": "vet-consult",
            "options": {
              "yes": {
                "level": "ready",
                "note": "안내받은 서류 이름과 제출할 곳을 적어 두세요."
              },
              "none": {
                "level": "official",
                "note": "당시 소속과 신청하려는 일을 알려 관할 보훈관서와 준비할 자료를 확인하세요."
              },
              "unknown": {
                "level": "ready",
                "note": "보관한 문자나 안내문이 있다면 상담 때 함께 확인하세요."
              }
            }
          }
        ],
        "overrides": []
      },
      "land": {
        "title": "토지개발·보상·문서 사전 점검",
        "form": "1djwkg9",
        "questions": [
          {
            "id": "land-topic",
            "options": {
              "development": {
                "level": "ready",
                "note": "살펴보는 땅의 위치와 그곳에서 하려는 일을 적어 두세요."
              },
              "compensation": {
                "level": "ready",
                "note": "안내한 기관과 사업 이름을 적어 두세요."
              },
              "notice": {
                "level": "ready",
                "note": "상대방에게 요청할 일과 그 이유를 한 문장씩 적어 보세요."
              },
              "contract": {
                "level": "ready",
                "note": "계약할 때 서로 맡기로 한 일과 금액을 적어 두세요."
              },
              "unknown": {
                "level": "ready",
                "note": "최근에 있었던 일과 지금 도움받고 싶은 일을 한 줄씩 적어 두세요."
              }
            }
          },
          {
            "id": "land-use",
            "showWhen": {
              "land-topic": [
                "development"
              ]
            },
            "options": {
              "build": {
                "level": "ready",
                "note": "시설을 어디에, 얼마나 크게 지으려는지 대략 표시해 보세요."
              },
              "ground": {
                "level": "ready",
                "note": "손대려는 부분과 지금 땅의 모습을 사진이나 그림에 표시하세요."
              },
              "split": {
                "level": "ready",
                "note": "지도에 나누려는 경계를 대략 그려 두세요."
              },
              "unknown": {
                "level": "ready",
                "note": "후보 용도와 계약 전에 알고 싶은 점을 적어 두세요."
              }
            }
          },
          {
            "id": "land-location",
            "showWhen": {
              "land-topic": [
                "development"
              ]
            },
            "options": {
              "parcel": {
                "level": "ready",
                "note": "자료에서 시·군·구부터 지번까지 표시해 두세요."
              },
              "map": {
                "level": "documents",
                "note": "지도에 후보지를 표시해 두면 지번을 함께 찾을 수 있습니다."
              },
              "unknown": {
                "level": "ready",
                "note": "생각 중인 지역과 필요한 면적부터 적어 보세요."
              }
            }
          },
          {
            "id": "land-compensation-paper",
            "showWhen": {
              "land-topic": [
                "compensation"
              ]
            },
            "options": {
              "inventory": {
                "level": "documents",
                "note": "목록에서 내 토지·건물·나무 등이 적힌 부분을 찾아 표시하세요."
              },
              "offer": {
                "level": "documents",
                "note": "금액이 적힌 페이지와 협의 일정을 함께 챙기세요."
              },
              "decision": {
                "level": "official",
                "note": "재결서 전체와 받은 날을 확인할 등기 기록을 함께 두고 후속 일정을 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "안내한 곳에 문서 제목과 사본을 어디서 받을 수 있는지 물어보세요."
              }
            }
          },
          {
            "id": "land-compensation-list",
            "showWhen": {
              "land-topic": [
                "compensation"
              ],
              "land-compensation-paper": [
                "inventory",
                "offer"
              ]
            },
            "options": {
              "difference": {
                "level": "documents",
                "note": "해당 줄을 표시하고 현장 사진과 나란히 놓아 보세요."
              },
              "compared": {
                "level": "ready",
                "note": "확인한 목록 옆에 비교한 날짜를 적어 두세요."
              },
              "unknown": {
                "level": "documents",
                "note": "받은 자료 중 토지와 물건을 적은 목록이 있는지 살펴보세요."
              }
            }
          },
          {
            "id": "land-notice",
            "showWhen": {
              "land-topic": [
                "notice"
              ]
            },
            "options": {
              "record": {
                "level": "ready",
                "note": "마지막으로 보낸 내용과 날짜, 받은 답장을 함께 정리하세요."
              },
              "spoken": {
                "level": "documents",
                "note": "대화한 날과 서로 한 말을 기억나는 범위에서 적어 두세요."
              },
              "first": {
                "level": "ready",
                "note": "요청할 내용과 관련된 계약서나 거래 내역을 찾아 두세요."
              },
              "unknown": {
                "level": "documents",
                "note": "문자나 이메일에서 상대방 이름과 거래 날짜로 찾아보세요."
              }
            }
          },
          {
            "id": "land-contract",
            "showWhen": {
              "land-topic": [
                "contract"
              ]
            },
            "options": {
              "draft": {
                "level": "documents",
                "note": "최신 초안에서 금액·날짜·해지 조건 중 묻고 싶은 부분에 표시하세요."
              },
              "signed": {
                "level": "documents",
                "note": "서명본과 이후에 내용을 바꾸기로 한 문자나 메일을 함께 챙기세요."
              },
              "verbal": {
                "level": "ready",
                "note": "합의한 내용과 아직 정하지 않은 내용을 나누어 적으세요."
              },
              "unknown": {
                "level": "documents",
                "note": "계약서를 주고받은 사람에게 최신 사본을 요청하세요."
              }
            }
          },
          {
            "id": "land-schedule",
            "options": {
              "due": {
                "level": "urgent",
                "note": "날짜가 적힌 문서를 꺼내 안내한 곳에 지금 가능한 제출·회신 방법을 확인하세요."
              },
              "later": {
                "level": "ready",
                "note": "안내에 적힌 날짜와 제출·회신 방법을 같이 기록하세요."
              },
              "none": {
                "level": "ready",
                "note": "계약이나 현장 방문 등 따로 잡아 둔 일정이 있으면 상담 때 알려주세요."
              },
              "unknown": {
                "level": "official",
                "note": "최근 받은 안내에서 기한이나 회신 날짜가 적힌 부분을 찾아보세요."
              }
            }
          }
        ],
        "overrides": []
      },
      "appeal": {
        "title": "일반 행정심판 사전 점검",
        "form": "1rc6yr2",
        "questions": [
          {
            "id": "appeal-stage",
            "options": {
              "decision": {
                "level": "documents",
                "note": "통지 첫 장과 끝 장을 포함해 받은 문서 전체를 챙기세요."
              },
              "before": {
                "level": "documents",
                "note": "안내에서 요구한 내용과 답을 보낼 곳을 표시해 두세요."
              },
              "waiting": {
                "level": "ready",
                "note": "신청한 내용과 접수 날짜부터 적어 두세요."
              },
              "spoken": {
                "level": "official",
                "note": "어느 기관에서 언제 어떤 설명을 들었는지 적고, 발송된 문서가 있는지 문의하세요."
              },
              "unknown": {
                "level": "ready",
                "note": "최근에 한 신청이나 받은 연락 중 가장 기억나는 일부터 한 줄로 적으세요."
              }
            }
          },
          {
            "id": "appeal-delivery",
            "showWhen": {
              "appeal-stage": [
                "decision",
                "before"
              ]
            },
            "options": {
              "record": {
                "level": "ready",
                "note": "받은 날짜가 보이는 기록과 통지서를 함께 보관하세요."
              },
              "memory": {
                "level": "documents",
                "note": "기억나는 날짜를 적고, 우편 봉투나 수신 알림에서 기록을 찾아보세요."
              },
              "unknown": {
                "level": "official",
                "note": "보낸 기관에 발송 방법과 수령 기록을 확인할 수 있는지 물어보세요."
              }
            }
          },
          {
            "id": "appeal-reasons",
            "showWhen": {
              "appeal-stage": [
                "decision",
                "before"
              ]
            },
            "options": {
              "found": {
                "level": "ready",
                "note": "해당 문장 옆에 본인이 겪은 일과 같거나 다른 점을 적으세요."
              },
              "unclear": {
                "level": "documents",
                "note": "이해하기 어려운 문장을 표시해 상담 때 함께 살펴보세요."
              },
              "unknown": {
                "level": "official",
                "note": "별첨이나 뒷면이 있는지 확인하고, 누락된 쪽이 있으면 보낸 기관에 요청하세요."
              }
            }
          },
          {
            "id": "appeal-receipt",
            "showWhen": {
              "appeal-stage": [
                "waiting"
              ]
            },
            "options": {
              "receipt": {
                "level": "ready",
                "note": "접수번호로 처리 상황을 확인하고 마지막으로 확인한 날짜를 적으세요."
              },
              "sent": {
                "level": "official",
                "note": "보낸 기록을 찾아 기관에 실제 접수 여부와 담당 부서를 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "신청한 곳과 대략적인 시기를 떠올려 접수 내역을 문의하세요."
              }
            }
          },
          {
            "id": "appeal-contacts",
            "options": {
              "filed": {
                "level": "documents",
                "note": "보낸 내용과 접수 기록, 이후에 온 답이 있으면 함께 챙기세요."
              },
              "spoken": {
                "level": "ready",
                "note": "연락한 날짜와 담당 부서, 들은 답을 기억나는 대로 적으세요."
              },
              "none": {
                "level": "ready",
                "note": "기관에 확인하고 싶은 내용을 한 줄로 적어 두세요."
              },
              "unknown": {
                "level": "documents",
                "note": "기관 이름으로 문자나 메일을 검색해 보세요."
              }
            }
          },
          {
            "id": "appeal-evidence",
            "options": {
              "held": {
                "level": "ready",
                "note": "가장 관련 있는 자료부터 날짜순으로 모으세요."
              },
              "elsewhere": {
                "level": "documents",
                "note": "자료 이름과 보관하는 곳을 적고 사본을 받을 수 있는지 확인하세요."
              },
              "unknown": {
                "level": "documents",
                "note": "중요했던 날 한 번을 떠올려 누가 어떤 일을 했는지 적어 보세요."
              }
            }
          },
          {
            "id": "appeal-impact",
            "showWhen": {
              "appeal-stage": [
                "decision"
              ]
            },
            "options": {
              "already": {
                "level": "documents",
                "note": "변화가 시작된 날과 이를 보여 줄 지급 내역이나 연락 기록을 챙기세요."
              },
              "scheduled": {
                "level": "documents",
                "note": "어떤 일이 언제부터 달라지는지 통지서에 표시하세요."
              },
              "none": {
                "level": "ready",
                "note": "결정에서 다시 확인받고 싶은 점을 한 문장으로 정리하세요."
              },
              "unknown": {
                "level": "official",
                "note": "통지를 보낸 기관에 결정 내용이 언제, 어떻게 적용되는지 문의하세요."
              }
            }
          },
          {
            "id": "appeal-date",
            "showWhen": {
              "appeal-stage": [
                "decision",
                "before"
              ]
            },
            "options": {
              "near": {
                "level": "urgent",
                "note": "문서와 수령 기록을 챙겨 안내된 접수처에 오늘 가능한 절차를 확인하세요."
              },
              "later": {
                "level": "ready",
                "note": "어떤 절차의 날짜인지 표시하고 접수처·제출 방법을 함께 기록하세요."
              },
              "period": {
                "level": "official",
                "note": "문서에 적힌 표현과 받은 날짜를 함께 놓고 해당 절차의 마감일을 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "보낸 기관에 통지 제목과 수령일을 알려 주고 이후 절차와 기한을 확인하세요."
              }
            }
          }
        ],
        "overrides": []
      },
      "procurement": {
        "title": "공공조달·기업인증 사전 점검",
        "form": "1kkx35b",
        "questions": [
          {
            "id": "procurement-topic",
            "options": {
              "production": {
                "level": "ready",
                "note": "신청할 제품 이름과 실제로 만드는 장소를 적어 두세요."
              },
              "women": {
                "level": "ready",
                "note": "사업자등록증에서 사업자 이름과 대표자 표기를 확인하세요."
              },
              "registration": {
                "level": "ready",
                "note": "공급할 물품이나 제공할 용역·공사의 이름을 적어 두세요."
              },
              "unknown": {
                "level": "documents",
                "note": "공고나 거래처 요청에서 준비해 달라는 서류 이름을 그대로 적어 두세요."
              }
            }
          },
          {
            "id": "procurement-notice",
            "options": {
              "saved": {
                "level": "ready",
                "note": "공고번호와 참가 자격이 적힌 부분을 표시해 두세요."
              },
              "heard": {
                "level": "documents",
                "note": "알려준 곳에 공고번호나 공고 링크를 요청하세요."
              },
              "none": {
                "level": "ready",
                "note": "앞으로 납품할 제품이나 참여하고 싶은 사업부터 정리하세요."
              },
              "unknown": {
                "level": "ready",
                "note": "요청받은 서류나 거래처에서 받은 메시지가 있으면 챙겨 두세요."
              }
            }
          },
          {
            "id": "procurement-production",
            "showWhen": {
              "procurement-topic": [
                "production"
              ]
            },
            "options": {
              "own": {
                "level": "documents",
                "note": "제품 하나가 완성될 때까지 쓰는 설비와 작업 순서를 적으세요."
              },
              "partial": {
                "level": "documents",
                "note": "직접 하는 작업과 외부에 맡기는 작업을 나누어 적으세요."
              },
              "purchased": {
                "level": "official",
                "note": "공고에 적힌 물품명과 제조·공급 구분을 확인하세요."
              },
              "unknown": {
                "level": "ready",
                "note": "후보 제품이 여러 개라면 먼저 신청하려는 제품부터 정하세요."
              }
            }
          },
          {
            "id": "procurement-business",
            "showWhen": {
              "procurement-topic": [
                "women"
              ]
            },
            "options": {
              "individual": {
                "level": "ready",
                "note": "사업자등록증과 대표가 평소 맡는 일을 보여 줄 자료를 찾아 두세요."
              },
              "company": {
                "level": "documents",
                "note": "법인 등기사항증명서와 현재 출자 내역을 확인할 자료를 챙기세요."
              },
              "cooperative": {
                "level": "documents",
                "note": "최근 조합원·임원 명단과 출자 내역을 찾아 두세요."
              },
              "unknown": {
                "level": "ready",
                "note": "사업자등록증에 적힌 이름과 대표자부터 확인하세요."
              }
            }
          },
          {
            "id": "procurement-supply",
            "showWhen": {
              "procurement-topic": [
                "registration"
              ]
            },
            "options": {
              "manufacture": {
                "level": "documents",
                "note": "제조할 물품명과 사업장 주소가 적힌 자료를 챙기세요."
              },
              "goods": {
                "level": "ready",
                "note": "공급하려는 물품의 이름과 규격을 적어 두세요."
              },
              "services": {
                "level": "documents",
                "note": "하려는 일의 이름을 적고, 이미 보유한 면허·등록증이 있으면 함께 챙기세요."
              },
              "unknown": {
                "level": "ready",
                "note": "공고가 있다면 제목과 실제 맡으려는 일을 적어 두세요."
              }
            }
          },
          {
            "id": "procurement-stage",
            "options": {
              "new": {
                "level": "ready",
                "note": "먼저 신청할 업무와 공고가 정해졌는지 상담 때 알려주세요."
              },
              "filed": {
                "level": "ready",
                "note": "접수일과 접수번호를 기록해 두세요."
              },
              "requested": {
                "level": "documents",
                "note": "요청한 자료, 방문 장소와 담당자 연락처를 받은 안내에서 표시하세요."
              },
              "existing": {
                "level": "ready",
                "note": "최근 확인서나 등록 화면에서 품목·업종과 유효기간 표시를 살펴보세요."
              },
              "unknown": {
                "level": "documents",
                "note": "이전 담당자나 업무용 메일에서 접수 알림과 발급 기록을 찾아보세요."
              }
            }
          },
          {
            "id": "procurement-changes",
            "showWhen": {
              "procurement-stage": [
                "filed",
                "requested",
                "existing"
              ]
            },
            "options": {
              "changed": {
                "level": "documents",
                "note": "바뀐 항목과 날짜를 적고, 이전 등록 내역과 현재 자료를 함께 챙기세요."
              },
              "same": {
                "level": "ready",
                "note": "최근 신청서나 확인서의 대표자·주소를 현재 정보와 대조하세요."
              },
              "unknown": {
                "level": "documents",
                "note": "최근 사업자등록증과 신청 당시 자료를 나란히 놓고 확인하세요."
              }
            }
          },
          {
            "id": "procurement-date",
            "options": {
              "near": {
                "level": "urgent",
                "note": "공고나 보완 안내의 마감 시각을 확인하고, 안내한 곳에 지금 가능한 절차를 문의하세요."
              },
              "later": {
                "level": "ready",
                "note": "각 마감의 이름과 날짜·시각을 함께 기록하세요."
              },
              "none": {
                "level": "ready",
                "note": "공고가 정해지면 참가등록과 입찰서 제출 날짜를 각각 확인하세요."
              },
              "unknown": {
                "level": "official",
                "note": "받은 공고나 안내에서 마감 시각과 문의처를 찾아보세요."
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
      "none": "문서를 받지 않았거나 문서에 기한이 없습니다"
    },
    "urgentReasons": {
      "diagnosis": "셀프 진단",
      "visaIntake": "비자 접수 답변",
      "visaDiagnosis": "비자 사전진단",
      "selfReported": "고객 직접 선택"
    }
  }
};
