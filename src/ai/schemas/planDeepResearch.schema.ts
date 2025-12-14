import { z } from 'zod';

export const DeepResearchPlanSchema = z.object({
  searchQueries: z
    .array(
      z.object({
        query: z.string(),
        rationale: z.string(),
        category: z.enum(['pulse', 'culture', 'leaks']),
      }),
    )
    .min(3)
    .max(6),
});

export type DeepResearchPlan = z.infer<typeof DeepResearchPlanSchema>;
