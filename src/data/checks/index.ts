import type { CheckDefinition, CheckDomain } from '../../types/content';
import { dui } from './dui';
import { suspension } from './suspension';
import { veterans } from './veterans';

export const checks: Record<CheckDomain, CheckDefinition> = { dui, suspension, veterans };
