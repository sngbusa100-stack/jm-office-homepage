export interface ConsultBriefSection {
  title: string;
  lines: string[];
}
export declare const LEVEL_LABEL: Record<'urgent' | 'documents' | 'official' | 'ready', string>;
export declare function classifyDiagnosis(diagnosis: unknown): {
  questionId: string;
  questionText: string;
  answerLabel: string;
  level: 'urgent' | 'documents' | 'official' | 'ready';
  note: string;
  lawRef?: string;
}[];
export declare function buildConsultBrief(record: unknown): ConsultBriefSection[] | null;
export declare function consultBriefText(sections: ConsultBriefSection[] | null | undefined): string;
