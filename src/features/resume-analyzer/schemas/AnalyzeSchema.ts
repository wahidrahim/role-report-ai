import { z } from 'zod';

export const AnalyzeSchema = z.object({
  radarChart: z
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
            'Concise but clear assessment reasoning with specific evidence from the resume (2 sentences max).',
          ),
      }),
    )
    .min(4)
    .max(8)
    .describe(
      'Candidate assessment for the predetermined critical skills from job requirements analysis.',
    ),
  skillAudit: z.object({
    verified: z
      .array(
        z.object({
          skillName: z.string().describe('The skill name'),
          importance: z
            .enum(['critical', 'nice-to-have'])
            .describe('The importance of this skill.'),
          reasoning: z
            .string()
            .describe(
              'Brief evidence or thought process of their skill being mentioned in the resume, and how it matches the requirements of the job.',
            ),
        }),
      )
      .describe(
        'The skills that are required for the job and are also explicitly mentioned in the resume.',
      ),
    transferable: z
      .array(
        z.object({
          skillName: z.string().describe('The skill name'),
          importance: z
            .enum(['critical', 'nice-to-have'])
            .describe('The importance of this skill.'),
          reasoning: z
            .string()
            .describe(
              'Brief evidence or thought process of their skill being mentioned in the resume, and how it can be transferrable to the requirements of the job.',
            ),
        }),
      )
      .describe(
        'The skills that exist in their resume and are transferrable to requirements mentioned in the job description.',
      ),
    missing: z
      .array(
        z.object({
          skillName: z.string().describe('The skill name'),
          importance: z
            .enum(['critical', 'nice-to-have'])
            .describe('The importance of this skill.'),
          reasoning: z
            .string()
            .describe(
              'Brief evidence or thought process of the skill required for the job but not found in the resume.',
            ),
        }),
      )
      .describe('The skills that are required for the job but no evidence found in the resume.'),
  }),
});
