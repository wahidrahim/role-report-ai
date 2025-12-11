import { z } from 'zod';

export const AnalyzeSchema = z.object({
  radarChartData: z
    .array(
      z.object({
        skillName: z.string().min(1).max(50).describe('Name of the skill'),
        requiredLevel: z.number().min(0).max(100).describe('Required proficiency level (0-100)'),
        candidateLevel: z.number().min(0).max(100).describe('Candidate proficiency level (0-100)'),
        reasoning: z.string().min(10).max(300).describe('Brief justification for the assessment'),
      }),
    )
    .min(4)
    .max(8)
    .describe('Top quantifiable skills for radar chart visualization'),
  skillAuditData: z.object({
    verified: z
      .array(
        z.object({
          skillName: z.string().min(1).max(50).describe('Name of the verified skill'),
          importance: z.enum(['critical', 'nice-to-have']).describe('Importance level'),
          reasoning: z
            .string()
            .min(15)
            .max(300)
            .describe('How this skill appears in JD and resume'),
        }),
      )
      .describe('Skills the job requires AND the candidate possesses'),
    transferable: z
      .array(
        z.object({
          skillName: z.string().min(1).max(50).describe('Candidate skill that can transfer'),
          importance: z.enum(['critical', 'nice-to-have']).describe('Importance level'),
          reasoning: z
            .string()
            .min(15)
            .max(300)
            .describe('How job requires skill X and candidate has Y'),
        }),
      )
      .describe('Candidate skills that can serve as proxies for required job skills'),
    missing: z
      .array(
        z.object({
          skillName: z.string().min(1).max(50).describe('Required skill name'),
          importance: z.enum(['critical', 'nice-to-have']).describe('Importance level'),
          reasoning: z
            .string()
            .min(15)
            .max(300)
            .describe('How job requires skill but candidate lacks it'),
        }),
      )
      .describe('Skills required by the job that the candidate has NO mention of'),
  }),
  fitScore: z.number().min(0).max(100).describe('Overall candidate fit score (0-100)'),
  verdict: z.string().min(20).max(300).describe('Explanation of the fit score and suitability'),
});
