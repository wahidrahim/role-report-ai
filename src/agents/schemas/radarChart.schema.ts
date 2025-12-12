import * as z from 'zod';

export const radarChartSchema = z.object({
  data: z
    .array(
      z.object({
        skillName: z.string(),
        requiredLevel: z.number().min(0).max(100),
        candidateLevel: z.number().min(0).max(100),
        reasoning: z.string(),
      }),
    )
    .max(8),
});
