import { z } from 'zod';

export const RadarChartDataSchema = z
  .array(
    z.object({
      skillName: z.string().describe('The skill name.'),
      requiredLevel: z
        .number()
        .min(0)
        .max(100)
        .describe('The required proficiency level for this skill based on the job description.'),
      candidateLevel: z
        .number()
        .min(0)
        .max(100)
        .describe('The candidate proficiency level for this skill based on their resume.'),
      requiredReasoning: z
        .string()
        .describe(
          'The reasoning for the required level based on evidence from the job description.',
        ),
      candidateReasoning: z
        .string()
        .describe('The reasoning for the candidate level based on evidence from their resume.'),
    }),
  )
  .min(4)
  .max(8)
  .describe(
    'Radar chart data with skill analysis including required levels, candidate levels, and reasoning.',
  );

export const GraphStateSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),

  radarChartData: RadarChartDataSchema.optional(),
});
