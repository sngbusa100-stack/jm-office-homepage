export declare const TOPIC_ROUTES: Record<string, { route: 'case' | 'reply'; caseType?: string }>;
export declare const DIAGNOSIS_ROUTES: Record<string, { route: 'case' | 'reply'; caseType?: string }>;
export declare const REPLY_TEMPLATES: { topic: string; intro: string }[];
export declare function planReply(record: unknown): {
  template: { topic: string; intro: string };
  recap: string[];
  asks: { text: string; deadline: boolean }[];
  notes: string[];
  urgent: boolean;
} | null;
export declare function buildReplyDraft(record: unknown): { text: string; notes: string[] } | null;
export declare function buildDirectReplyDraft(input: { topic: string; name?: string }): { text: string; notes: string[] } | null;
