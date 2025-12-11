import { z } from 'zod';

export const RadarChartDataSchema = z.object({
  data: z
    .array(
      z.object({
        skillName: z
          .string()
          .describe('The skill name (must match one from the job requirements analysis).'),
        requiredLevel: z
          .number()
          .min(0)
          .max(100)
          .describe(
            'The required proficiency level for this skill (from job requirements analysis).',
          ),
        candidateLevel: z
          .number()
          .min(0)
          .max(100)
          .describe(
            "The candidate's assessed proficiency level for this skill based on resume analysis.",
          ),
        reasoning: z
          .string()
          .describe(
            'Concise but clear assessment reasoning with specific evidence from the resume (2-3 sentences max).',
          ),
      }),
    )
    .min(4)
    .max(8)
    .describe(
      'Candidate assessment for the predetermined critical skills from job requirements analysis.',
    ),
});
