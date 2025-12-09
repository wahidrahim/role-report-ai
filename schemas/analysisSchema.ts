import { z } from 'zod';

// This schema defines the structure of your entire report
export const analysisSchema = z.object({
  analysis: z.object({
    matchScore: z.number().min(0).max(10).describe('Overall compatibility score 0-10'),
    verdict: z.string().describe('A 2-sentence executive summary of the fit'),

    // DYNAMIC RADAR CHART
    // We use z.array() to let the AI decide how many items to return.
    skillsRadarChart: z
      .array(
        z.object({
          axis: z
            .string()
            .describe('The skill or competency name (e.g., "React", "System Design")'),
          requiredSkillLevel: z.number().min(0).max(10).describe('Level required by job (1-10)'),
          usersSkillLevel: z
            .number()
            .min(0)
            .max(10)
            .describe('Level demonstrated in resume (1-10)'),
          reason: z.string().describe('Short reason for the score difference'),
        }),
      )
      .describe(
        'Analyze the job to find the most critical 4-8 distinct competencies. Do not force a fixed number.',
      ),

    skillAudit: z.object({
      verifiedMatches: z.array(z.string()).describe('Skills found in both documents'),
      criticalMissing: z
        .array(z.string())
        .describe('Important requirements completely missing from resume'),
      transferableSkills: z.array(
        z.object({
          missingSkill: z.string(),
          yourSkill: z.string(),
          explanation: z.string().describe('Why your skill maps to the missing one'),
        }),
      ),
    }),

    advice: z.object({
      atsKeywords: z.array(z.string()).describe('Keywords to add to resume'),
      interviewTalkingPoints: z.array(z.string()).describe('Scripts to handle gaps'),
    }),
  }),
});
