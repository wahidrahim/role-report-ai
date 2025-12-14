import { z } from 'zod';

export const interviewPrepGuideSchema = z.object({
  interviewFormat: z.object({
    style: z.enum([
      'LeetCode/DSA',
      'Practical/Take-home',
      'System Design',
      'Behavioral',
      'Unknown',
    ]),
    description: z
      .string()
      .describe('Specific details found in research (e.g. "They use HackerRank for the screen").'),
    evidence: z
      .string()
      .describe('Quote the specific Reddit/Glassdoor text that supports this prediction.'),
  }),

  skillGapCrashCourses: z.array(
    z.object({
      topic: z.string(),
      companyContext: z
        .string()
        .describe(
          'FACTUAL usage of this tech at the company. Must cite specific tools/versions found in research (e.g. "They use Redis with Sentinel"). If no data found, write "General Industry Standard".',
        ),
      studyTip: z.string().describe('Specific concept to learn.'),
    }),
  ),

  strategicQuestions: z
    .array(
      z.object({
        question: z.string(),
        context: z
          .string()
          .describe(
            'Why this question matters (e.g. "Referencing their recent migration to Rust").',
          ),
      }),
    )
    .max(3),
});

export type InterviewPrepGuide = z.infer<typeof interviewPrepGuideSchema>;
