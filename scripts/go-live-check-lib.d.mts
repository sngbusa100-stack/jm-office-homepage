export interface CheckResult { id: string; title: string; status: 'ok' | 'fail' | 'manual' | 'skip'; detail: string }
type Office = Record<string, unknown> & { isOpen: boolean; openedOn?: string | null };
export declare const REQUIRED_OFFICE_FIELDS: string[];
export declare const REQUIRED_VERCEL_ENV: string[];
export declare function checkOffice(office: Office): CheckResult;
export declare function checkPolicy(input: { office: Office; effectiveDate: string; consentVersion: string; historyDates?: string[] }): CheckResult;
export declare function checkWording(input: { office: Office; pages: { path: string; text: string }[] | null }): CheckResult;
export declare function checkConsultApi(input: { office: Office; probe: { status: number; body: Record<string, unknown> } | null }): CheckResult;
export declare function checkProtectedApis(statuses: Record<string, number> | null): CheckResult;
export declare function checkVercelEnv(names: string[] | null, office: Office, options?: { offline?: boolean }): CheckResult;
export declare function checkLiveSite(input: { office: Office; text: string | null }): CheckResult;
export declare function checkVisaSite(input: { office: Office; text: string | null }): CheckResult;
export declare function checkLocalConnector(input: { envKeys: string[] | null; task: { lastResult: number; lastRunTime: string } | null; now?: Date }): CheckResult;
export declare function manualItems(): CheckResult[];
export declare function summarizeChecks(results: { status: string }[], options?: { strict?: boolean }): { ok: number; fail: number; manual: number; skip: number; exitCode: number };
