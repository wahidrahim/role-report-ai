import { z } from 'zod';

import { interviewPrepGuideSchema } from './interviewPrepGuide.schema';

export const researchReportSchema = z.object({
  companyHealth: z.object({
    status: z.enum(['Stable/Growing', 'Risky/Layoffs', 'Unknown']),
    summary: z
      .string()
      .describe('A 1-2 sentence "Insider" summary of their financial/hiring stability. Be direct.'),
    redFlags: z
      .array(z.string())
      .describe('Specific risks found (e.g., "Stock down 40%", "RTO mandate").'),
  }),

  cultureIntel: z.object({
    keywords: z
      .array(z.string())
      .describe('Top 3 distinct cultural values (e.g., "Frugality", "Radical Candor").'),
    managerVibe: z
      .string()
      .describe('What employees say about management (sourced from Blind/Glassdoor).'),
    engineeringCulture: z
      .string()
      .describe(
        'Specifics on how they work (e.g., "Shape Up", "Heavy On-call", "Flat structure").',
      ),
  }),

  interviewPrepGuide: interviewPrepGuideSchema,
});

export type ResearchReport = z.infer<typeof researchReportSchema>;
