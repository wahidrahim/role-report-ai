'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';

import { SkillAuditSchema } from '@/features/skill-audit/schema';

export function useAuditSkills() {
  return useObject({
    api: '/api/audit-skills',
    schema: SkillAuditSchema,
  });
}
