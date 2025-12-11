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
        .describe("The candidate's proficiency level for this skill based on their resume."),
      reasoning: z.string().describe('Brief justification for this score'),
    }),
  )
  .min(4)
  .max(8)
  .describe('4-8 most critical technical dimensions for radar visualization.');
