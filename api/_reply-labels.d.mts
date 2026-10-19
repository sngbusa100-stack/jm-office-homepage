declare const replyLabels: {
  office: { name: string; representative: string; phone: string; email: string };
  diagnosis: Record<string, Record<string, { text: string; options: Record<string, string> }>>;
  visa: Record<string, { question: string; options?: Record<string, string> }>;
};
export default replyLabels;
