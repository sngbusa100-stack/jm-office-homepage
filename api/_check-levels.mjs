// scripts/gen-check-levels.ts가 생성한 파일 — 직접 편집하지 마세요.
export default {
  "dui": {
    "dui-disposition": {
      "suspend": "ready",
      "revoke": "official",
      "pending": "official",
      "unknown": "official"
    },
    "dui-bac": {
      "low": "ready",
      "mid": "official",
      "high": "official",
      "unknown": "documents"
    },
    "dui-elapsed": {
      "none": "ready",
      "within30": "ready",
      "d30to60": "official",
      "d60to90": "urgent",
      "over90": "urgent",
      "unknown": "urgent"
    },
    "dui-procedure": {
      "no": "ready",
      "objection": "official",
      "appeal": "official"
    },
    "dui-livelihood": {
      "job": "documents",
      "work": "documents",
      "commute": "ready",
      "no": "ready"
    },
    "dui-history": {
      "none": "ready",
      "once": "official",
      "multi": "official"
    },
    "dui-accident": {
      "none": "ready",
      "property": "official",
      "injury": "official"
    },
    "dui-refusal": {
      "no": "ready",
      "yes": "official"
    },
    "dui-evidence": {
      "ready": "ready",
      "partial": "documents",
      "none": "documents"
    },
    "dui-criminal": {
      "none": "ready",
      "investigating": "official",
      "trial": "official",
      "done": "ready"
    }
  },
  "suspension": {
    "susp-business": {
      "restaurant": "ready",
      "karaoke": "ready",
      "academy": "ready",
      "other": "official"
    },
    "susp-stage": {
      "prenotice": "urgent",
      "confirmed": "official",
      "investigating": "ready"
    },
    "susp-opinion-deadline": {
      "remaining": "documents",
      "soon": "urgent",
      "passed": "official",
      "na": "ready"
    },
    "susp-elapsed": {
      "within30": "ready",
      "d30to60": "official",
      "d60to90": "urgent",
      "over90": "urgent",
      "na": "ready"
    },
    "susp-reason": {
      "youth": "official",
      "hygiene": "documents",
      "unlicensed": "official",
      "other": "official"
    },
    "susp-count": {
      "first": "ready",
      "second": "official",
      "third": "official"
    },
    "susp-livelihood": {
      "only": "documents",
      "main": "documents",
      "side": "ready"
    },
    "susp-execution": {
      "imminent": "urgent",
      "notyet": "ready",
      "ongoing": "official"
    },
    "susp-evidence": {
      "ready": "ready",
      "partial": "documents",
      "none": "documents"
    },
    "susp-fine": {
      "known": "official",
      "unknown": "official"
    }
  },
  "veterans": {
    "vet-applicant": {
      "self": "ready",
      "family": "ready"
    },
    "vet-type": {
      "combat": "ready",
      "died": "ready",
      "compensation": "ready",
      "unknown": "official"
    },
    "vet-stage": {
      "before": "ready",
      "reviewing": "official",
      "rejected": "official",
      "appealing": "official"
    },
    "vet-elapsed": {
      "na": "ready",
      "within30": "ready",
      "d30to90": "urgent",
      "over90": "urgent"
    },
    "vet-connection": {
      "yes": "ready",
      "partial": "documents",
      "none": "documents",
      "unsure": "official"
    },
    "vet-records": {
      "yes": "ready",
      "partial": "documents",
      "none": "documents"
    },
    "vet-current": {
      "yes": "ready",
      "none": "documents"
    },
    "vet-history": {
      "first": "ready",
      "once": "official",
      "multi": "official"
    },
    "vet-consult": {
      "yes": "ready",
      "none": "official"
    }
  }
};
