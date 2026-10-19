export declare const TOPIC_ROUTES: Record<string, { route: 'case' | 'reply'; caseType?: string }>;
export declare const REPLY_TEMPLATES: { topic: string; intro: string }[];
export declare function buildReplyDraft(record: unknown): { text: string; notes: string[] } | null;
