import * as z from 'zod';

export const SuitabilityAssessmentSchema = z.object({
  suitabilityScore: z.number().min(0).max(10),
  suitabilityReasoning: z.string(),
});

export const RadarChartDataSchema = z.object({
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

export const CategorizedSkillsSchema = z.object({
  skills: z.object({
    verified: z.array(
      z.object({
        skillName: z.string(),
        importance: z.enum(['critical', 'nice-to-have']),
        reasoning: z.string(),
      }),
    ),
    transferable: z.array(
      z.object({
        skillName: z.string(),
        importance: z.enum(['critical', 'nice-to-have']),
        reasoning: z.string(),
      }),
    ),
    missing: z.array(
      z.object({
        skillName: z.string(),
        importance: z.enum(['critical', 'nice-to-have']),
        reasoning: z.string(),
      }),
    ),
  }),
});

export type RadarChartData = z.infer<typeof RadarChartDataSchema>;
export type CategorizedSkills = z.infer<typeof CategorizedSkillsSchema>;
export type SuitabilityAssessment = z.infer<typeof SuitabilityAssessmentSchema>;
