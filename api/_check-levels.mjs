// scripts/gen-check-levels.ts가 생성한 파일 — 직접 편집하지 마세요.
export const visibility = {
  "permit": {
    "permit-site-advice": {
      "permit-address": [
        "candidate",
        "contracted",
        "owned"
      ]
    },
    "permit-building": {
      "permit-address": [
        "candidate",
        "contracted",
        "owned"
      ]
    },
    "permit-supplement-deadline": {
      "permit-stage": [
        "supplement"
      ]
    }
  },
  "suspension": {
    "susp-opinion-deadline": {
      "susp-stage": [
        "prior-notice"
      ]
    },
    "susp-elapsed": {
      "susp-stage": [
        "confirmed"
      ]
    },
    "susp-execution": {
      "susp-stage": [
        "confirmed"
      ]
    },
    "susp-fine-advice": {
      "susp-stage": [
        "prior-notice",
        "confirmed"
      ]
    }
  },
  "dui": {
    "dui-elapsed": {
      "dui-disposition": [
        "suspend",
        "revoke",
        "unknown"
      ]
    },
    "dui-procedure": {
      "dui-disposition": [
        "suspend",
        "revoke",
        "unknown"
      ]
    },
    "dui-bac": {
      "dui-refusal": [
        "measured",
        "unknown"
      ]
    },
    "dui-evidence": {
      "dui-livelihood": [
        "job",
        "work",
        "commute",
        "other"
      ]
    }
  },
  "veterans": {
    "vet-elapsed": {
      "vet-stage": [
        "rejected"
      ]
    },
    "vet-records": {
      "vet-event": [
        "injury",
        "death"
      ]
    },
    "vet-current": {
      "vet-event": [
        "injury"
      ]
    }
  },
  "land": {
    "land-use": {
      "land-topic": [
        "development"
      ]
    },
    "land-location": {
      "land-topic": [
        "development"
      ]
    },
    "land-compensation-paper": {
      "land-topic": [
        "compensation"
      ]
    },
    "land-compensation-list": {
      "land-topic": [
        "compensation"
      ],
      "land-compensation-paper": [
        "inventory",
        "offer"
      ]
    },
    "land-notice": {
      "land-topic": [
        "notice"
      ]
    },
    "land-contract": {
      "land-topic": [
        "contract"
      ]
    }
  },
  "appeal": {
    "appeal-delivery": {
      "appeal-stage": [
        "decision",
        "before"
      ]
    },
    "appeal-reasons": {
      "appeal-stage": [
        "decision",
        "before"
      ]
    },
    "appeal-receipt": {
      "appeal-stage": [
        "waiting"
      ]
    },
    "appeal-impact": {
      "appeal-stage": [
        "decision"
      ]
    },
    "appeal-date": {
      "appeal-stage": [
        "decision",
        "before"
      ]
    }
  },
  "procurement": {
    "procurement-production": {
      "procurement-topic": [
        "production"
      ]
    },
    "procurement-business": {
      "procurement-topic": [
        "women"
      ]
    },
    "procurement-supply": {
      "procurement-topic": [
        "registration"
      ]
    },
    "procurement-changes": {
      "procurement-stage": [
        "filed",
        "requested",
        "existing"
      ]
    }
  }
};
// 문항 판 표시(api/_diagnosis-routing.mjs diagnosisForm). 문항을 고치면 바뀐다.
export const forms = {
  "permit": "yx5fls",
  "suspension": "1uq53z6",
  "dui": "dg6woy",
  "veterans": "ope175",
  "land": "1djwkg9",
  "appeal": "1rc6yr2",
  "procurement": "1cqef75"
};
// 다른 답에 따라 등급을 바꾸는 덮어쓰기(src/types/content.ts AnswerOverride.level)
export const overrides = {
  "permit": [],
  "suspension": [],
  "dui": [
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
      "level": "ready"
    },
    {
      "questionId": "dui-elapsed",
      "when": {
        "dui-procedure": [
          "appeal",
          "appeal-done"
        ]
      },
      "level": "documents"
    }
  ],
  "veterans": [],
  "land": [],
  "appeal": [],
  "procurement": []
};
export default {
  "permit": {
    "permit-type": {
      "corporation": "ready",
      "factory": "official",
      "warehouse": "official",
      "business": "ready",
      "other": "official",
      "unknown": "official"
    },
    "permit-purpose": {
      "new": "ready",
      "change": "official",
      "takeover": "official",
      "other": "official"
    },
    "permit-authority": {
      "contacted": "ready",
      "department": "official",
      "agencyonly": "official",
      "none": "official"
    },
    "permit-address": {
      "candidate": "ready",
      "contracted": "documents",
      "owned": "ready",
      "notyet": "ready",
      "no-location-change": "ready",
      "no-site-advised": "ready",
      "unknown": "official"
    },
    "permit-site-advice": {
      "allowed": "ready",
      "conditions": "official",
      "waiting": "official",
      "none": "official",
      "unknown": "official"
    },
    "permit-building": {
      "clean": "ready",
      "flagged": "official",
      "notchecked": "official",
      "na": "ready",
      "unknown": "official"
    },
    "permit-facility-advice": {
      "pending": "documents",
      "done": "ready",
      "not-needed": "ready",
      "none": "official",
      "na": "ready",
      "unknown": "official"
    },
    "permit-personnel-advice": {
      "collected": "ready",
      "pending": "documents",
      "not-needed": "ready",
      "none": "official",
      "unknown": "official"
    },
    "permit-stage": {
      "reviewing": "ready",
      "preparing": "documents",
      "submitted": "ready",
      "supplement": "documents",
      "rejectedwithdoc": "official",
      "rejectednodoc": "official",
      "finished": "ready",
      "unknown": "official"
    },
    "permit-supplement-deadline": {
      "four-plus": "documents",
      "soon": "urgent",
      "passed": "urgent",
      "unknown": "urgent"
    },
    "permit-opening": {
      "already": "official",
      "month": "official",
      "later": "ready",
      "undecided": "ready"
    }
  },
  "suspension": {
    "susp-business": {
      "restaurant": "ready",
      "karaoke": "ready",
      "academy": "ready",
      "other": "official",
      "unknown": "ready"
    },
    "susp-stage": {
      "prior-notice": "documents",
      "confirmed": "official",
      "investigating": "ready",
      "none": "ready",
      "unknown": "official"
    },
    "susp-opinion-deadline": {
      "four-plus": "documents",
      "soon": "urgent",
      "passed": "urgent",
      "unknown": "urgent"
    },
    "susp-elapsed": {
      "within30": "official",
      "d31to60": "official",
      "d61to90": "urgent",
      "over90": "urgent",
      "unknown": "urgent"
    },
    "susp-reason": {
      "youth": "official",
      "hygiene": "documents",
      "unlicensed": "official",
      "other": "official",
      "unknown": "official"
    },
    "susp-count": {
      "first": "ready",
      "second": "official",
      "third": "official",
      "unknown": "official"
    },
    "susp-livelihood": {
      "only": "documents",
      "main": "documents",
      "side": "ready",
      "other": "ready"
    },
    "susp-execution": {
      "scheduled": "urgent",
      "ongoing": "urgent",
      "finished": "official",
      "no-date": "official",
      "unknown": "official"
    },
    "susp-evidence": {
      "collected": "ready",
      "partial": "documents",
      "none": "documents",
      "unknown": "official"
    },
    "susp-fine-advice": {
      "available": "official",
      "unavailable": "official",
      "none": "ready",
      "unknown": "ready"
    }
  },
  "dui": {
    "dui-disposition": {
      "suspend": "ready",
      "revoke": "official",
      "prior-notice": "official",
      "investigation": "ready",
      "unknown": "official"
    },
    "dui-elapsed": {
      "none": "official",
      "within30": "official",
      "d31to60": "urgent",
      "d61to90": "urgent",
      "over90": "urgent",
      "unknown": "urgent"
    },
    "dui-procedure": {
      "no": "ready",
      "objection": "official",
      "objection-result": "official",
      "appeal": "official",
      "appeal-done": "official",
      "unknown": "official"
    },
    "dui-refusal": {
      "measured": "ready",
      "yes": "official",
      "not-asked": "official",
      "unknown": "official"
    },
    "dui-bac": {
      "below003": "ready",
      "low": "ready",
      "mid": "official",
      "over01": "official",
      "unknown": "documents"
    },
    "dui-accident": {
      "none": "ready",
      "property": "official",
      "injury": "official",
      "unknown": "official"
    },
    "dui-history": {
      "none": "ready",
      "once": "official",
      "multi": "official",
      "unknown": "official"
    },
    "dui-livelihood": {
      "job": "documents",
      "work": "documents",
      "commute": "ready",
      "no": "ready",
      "other": "ready"
    },
    "dui-evidence": {
      "ready": "ready",
      "partial": "documents",
      "none": "documents",
      "unknown": "official"
    },
    "dui-criminal": {
      "none": "ready",
      "investigating": "official",
      "trial": "official",
      "done": "ready",
      "unknown": "official"
    }
  },
  "veterans": {
    "vet-applicant": {
      "self": "ready",
      "family": "ready",
      "other": "official"
    },
    "vet-event": {
      "injury": "ready",
      "death": "ready",
      "other": "ready",
      "unknown": "official"
    },
    "vet-stage": {
      "before": "ready",
      "reviewing": "ready",
      "rejected": "official",
      "filed": "official",
      "accepted": "ready",
      "other": "official"
    },
    "vet-elapsed": {
      "within30": "official",
      "d31to90": "urgent",
      "over90": "urgent",
      "unknown": "urgent"
    },
    "vet-connection": {
      "collected": "ready",
      "partial": "documents",
      "not-collected": "documents",
      "unsure": "official"
    },
    "vet-records": {
      "collected": "ready",
      "partial": "documents",
      "no-copies": "documents",
      "no-treatment": "ready",
      "unknown": "official"
    },
    "vet-current": {
      "yes": "ready",
      "none": "documents",
      "unknown": "official"
    },
    "vet-history": {
      "first": "ready",
      "once": "official",
      "multi": "official",
      "other": "official",
      "unknown": "official"
    },
    "vet-consult": {
      "yes": "ready",
      "none": "official",
      "unknown": "ready"
    }
  },
  "land": {
    "land-topic": {
      "development": "ready",
      "compensation": "ready",
      "notice": "ready",
      "contract": "ready",
      "unknown": "ready"
    },
    "land-use": {
      "build": "ready",
      "ground": "ready",
      "split": "ready",
      "unknown": "ready"
    },
    "land-location": {
      "parcel": "ready",
      "map": "documents",
      "unknown": "ready"
    },
    "land-compensation-paper": {
      "inventory": "documents",
      "offer": "documents",
      "decision": "official",
      "unknown": "official"
    },
    "land-compensation-list": {
      "difference": "documents",
      "compared": "ready",
      "unknown": "documents"
    },
    "land-notice": {
      "record": "ready",
      "spoken": "documents",
      "first": "ready",
      "unknown": "documents"
    },
    "land-contract": {
      "draft": "documents",
      "signed": "documents",
      "verbal": "ready",
      "unknown": "documents"
    },
    "land-schedule": {
      "due": "urgent",
      "later": "ready",
      "none": "ready",
      "unknown": "official"
    }
  },
  "appeal": {
    "appeal-stage": {
      "decision": "documents",
      "before": "documents",
      "waiting": "ready",
      "spoken": "official",
      "unknown": "ready"
    },
    "appeal-delivery": {
      "record": "ready",
      "memory": "documents",
      "unknown": "official"
    },
    "appeal-reasons": {
      "found": "ready",
      "unclear": "documents",
      "unknown": "official"
    },
    "appeal-receipt": {
      "receipt": "ready",
      "sent": "official",
      "unknown": "official"
    },
    "appeal-contacts": {
      "filed": "documents",
      "spoken": "ready",
      "none": "ready",
      "unknown": "documents"
    },
    "appeal-evidence": {
      "held": "ready",
      "elsewhere": "documents",
      "unknown": "documents"
    },
    "appeal-impact": {
      "already": "documents",
      "scheduled": "documents",
      "none": "ready",
      "unknown": "official"
    },
    "appeal-date": {
      "near": "urgent",
      "later": "ready",
      "period": "official",
      "unknown": "official"
    }
  },
  "procurement": {
    "procurement-topic": {
      "production": "ready",
      "women": "ready",
      "registration": "ready",
      "unknown": "documents"
    },
    "procurement-notice": {
      "saved": "ready",
      "heard": "documents",
      "none": "ready",
      "unknown": "ready"
    },
    "procurement-production": {
      "own": "documents",
      "partial": "documents",
      "purchased": "official",
      "unknown": "ready"
    },
    "procurement-business": {
      "individual": "ready",
      "company": "documents",
      "cooperative": "documents",
      "unknown": "ready"
    },
    "procurement-supply": {
      "manufacture": "documents",
      "goods": "ready",
      "services": "documents",
      "unknown": "ready"
    },
    "procurement-stage": {
      "new": "ready",
      "filed": "ready",
      "requested": "documents",
      "existing": "ready",
      "unknown": "documents"
    },
    "procurement-changes": {
      "changed": "documents",
      "same": "ready",
      "unknown": "documents"
    },
    "procurement-date": {
      "near": "urgent",
      "later": "ready",
      "none": "ready",
      "unknown": "official"
    }
  }
};
