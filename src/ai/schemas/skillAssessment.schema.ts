import * as z from 'zod';

export const skillAssessmentSchema = z.object({
  skills: z.array(
    z.object({
      skillName: z.string(),
      status: z.enum(['verified', 'transferable', 'missing']),
      importance: z.enum(['critical', 'nice-to-have']),
      reasoning: z.string(),
    }),
  ),
});

export type SkillAssessment = z.infer<typeof skillAssessmentSchema>;
