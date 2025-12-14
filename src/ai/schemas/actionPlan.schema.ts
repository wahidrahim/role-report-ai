import * as z from 'zod';

export const actionPlanSchema = z.object({
  plan: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    }),
  ),
});

export type ActionPlan = z.infer<typeof actionPlanSchema>;
