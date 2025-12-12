import * as z from 'zod';

export const skillAssessmentSchema = z.object({
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
