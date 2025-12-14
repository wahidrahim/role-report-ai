import { z } from 'zod';

export const interviewPrepGuideSchema = z.object({
  interviewFormat: z
    .object({
      format: z.string(),
      rationale: z.string(),
    })
    .describe(
      'The predicted style of the interview (e.g., "LeetCode-heavy", "Practical Take-home", "System Design focus", "Behavioral-first").',
    ),

  skillGapCrashCourses: z
    .array(
      z.object({
        topic: z.string().describe('The missing skill (e.g., "GraphQL").'),
        companyContext: z
          .string()
          .describe(
            'How THIS company specifically uses that tech, based on the research data (e.g., "They use Apollo Federation with 20 subgraphs").',
          ),
        studyTip: z
          .string()
          .describe(
            'A specific concept or term the candidate should memorize to sound like an insider (e.g., "Read up on Schema Stitching vs Composition").',
          ),
      }),
    )
    .describe('Create a bridge lesson for every user gap identified.'),

  strategicQuestions: z
    .array(z.string())
    .min(3)
    .max(3)
    .describe(
      '3 highly specific, intelligent question the candidate should ask the interviewer to demonstrate deep research (e.g., "How has the migration to Next.js App Router affected your CI/CD pipelines?").',
    ),
});

export type InterviewPrepGuide = z.infer<typeof interviewPrepGuideSchema>;
