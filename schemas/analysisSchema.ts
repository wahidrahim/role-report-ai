import { z } from 'zod';

// This schema defines the structure of your entire report
export const analysisSchema = z.object({
  analysis: z.object({
    match_score: z.number().min(0).max(10).describe('Overall compatibility score 0-10'),
    verdict: z.string().describe('A 2-sentence executive summary of the fit'),

    // DYNAMIC RADAR CHART
    // We use z.array() to let the AI decide how many items to return.
    skills_radar_chart: z
      .array(
        z.object({
          axis: z
            .string()
            .describe('The skill or competency name (e.g., "React", "System Design")'),
          required_skill_level: z.number().min(0).max(10).describe('Level required by job (1-10)'),
          users_skill_level: z
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

    skill_audit: z.object({
      verified_matches: z.array(z.string()).describe('Skills found in both documents'),
      critical_missing: z
        .array(z.string())
        .describe('Important requirements completely missing from resume'),
      transferable_skills: z.array(
        z.object({
          missing_skill: z.string(),
          your_skill: z.string(),
          explanation: z.string().describe('Why your skill maps to the missing one'),
        }),
      ),
    }),

    advice: z.object({
      ats_keywords: z.array(z.string()).describe('Keywords to add to resume'),
      interview_talking_points: z.array(z.string()).describe('Scripts to handle gaps'),
    }),
  }),
});
