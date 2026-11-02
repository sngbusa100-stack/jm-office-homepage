import type { CheckDefinition, CheckDomain } from '../../types/content';
import { dui } from './dui';
import { suspension } from './suspension';
import { veterans } from './veterans';
import { permit } from './permit';

// 홈·/check 카드 순서. 명함 업무 순서에 맞춰 인허가를 맨 앞에 둔다(2026-11-02 주인님 지시).
export const checks: Record<CheckDomain, CheckDefinition> = { permit, suspension, dui, veterans };

export function findCheck(domain: string | undefined): CheckDefinition | undefined {
  if (!domain || !Object.hasOwn(checks, domain)) return undefined;
  return checks[domain as CheckDomain];
}
