import * as z from 'zod';

export const suitabilityAssessmentSchema = z.object({
  suitabilityScore: z.number().min(0).max(10),
  suitabilityReasoning: z.string(),
});

export type SuitabilityAssessment = z.infer<typeof suitabilityAssessmentSchema>;
