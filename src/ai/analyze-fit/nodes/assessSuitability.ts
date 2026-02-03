import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisCreated, emitAnalysisPartial } from '@/ai/analyze-fit/events';
import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { models } from '@/ai/config';

const criteriaScoreSchema = z.object({
  score: z.number().describe('Score from 0-10'),
  reasoning: z.string(),
});

export const suitabilityAssessmentSchema = z.object({
  suitabilityScore: z.number().describe('Overall score from 0-10'),
  criteriaBreakdown: z.object({
    coreSkillsMatch: criteriaScoreSchema.describe(
      'Alignment with must-have requirements (35% weight)',
    ),
    experienceRelevance: criteriaScoreSchema.describe(
      'How well past roles prepare them (25% weight)',
    ),
    skillGapsSeverity: criteriaScoreSchema.describe(
      'Impact of missing skills and learnability (20% weight)',
    ),
    transferableSkills: criteriaScoreSchema.describe('Existing skills that bridge gaps (10% weight)'),
    overallPotential: criteriaScoreSchema.describe('Growth trajectory and adaptability (10% weight)'),
  }),
  keyStrengths: z.array(z.string()).describe('Top 3 strengths for this role'),
  criticalGaps: z
    .array(z.string())
    .describe('Top 3 gaps to address (can be fewer if minimal gaps)'),
  bottomLine: z.string().describe('2-3 sentence summary recommendation'),
});

export type SuitabilityAssessment = z.infer<typeof suitabilityAssessmentSchema>;

type AssessSuitabilityState = {
  resumeText: string;
  jobDescriptionText: string;
  radarChart: RadarChart;
  skillAssessment: SkillAssessment;
};

export const assessSuitability = async (
  state: AssessSuitabilityState,
  config: LangGraphRunnableConfig,
) => {
  const { resumeText, jobDescriptionText, radarChart, skillAssessment } = state;

  if (!radarChart || !skillAssessment) {
    throw new Error('Missing required state at assessSuitability node');
  }

  const suitabilityAssessmentStream = streamObject({
    model: models.balanced,
    schema: suitabilityAssessmentSchema,
    abortSignal: config.signal,
    system: `
      You are an expert technical recruiter conducting a candidate suitability assessment. Your evaluations are fair, evidence-based, and concise.

      ## Input Data
      You will receive:
      1. **Resume** - The candidate's background and qualifications
      2. **Job Description** - Role requirements and responsibilities
      3. **Skills Radar Chart Data** - Required vs. candidate proficiency levels for key skills
      4. **Skill Assessment** - A list of skills with status (verified/transferable/missing), importance, and reasoning

      ## Scoring Guide (0-10 scale, use one decimal place as needed)
      - **9.0-10**: Exceptional fit. Exceeds requirements, minimal gaps.
      - **8.0-8.9**: Strong fit. Meets core requirements, minor gaps.
      - **7.0-7.9**: Good fit. Solid foundation, some training needed.
      - **6.0-6.9**: Moderate fit. Relevant experience but notable gaps.
      - **5.0-5.9**: Weak fit. Transferable skills present but significant gaps.
      - **4.0-4.9**: Poor fit. Major skill misalignment.
      - **Below 4.0**: Not suitable. Fundamental mismatch.

      ## Output Structure

      Provide a comprehensive assessment with:

      1. **Overall Score (0-10)**: Weighted combination of criteria below

      2. **Criteria Breakdown**: Score (0-10) and 1-2 sentence reasoning for each:
         - Core Skills Match (35% weight): Alignment with must-have requirements
         - Experience Relevance (25% weight): How well past roles prepare them
         - Skill Gaps Severity (20% weight): Impact of missing skills, learnability
         - Transferable Skills (10% weight): Existing skills that bridge gaps
         - Overall Potential (10% weight): Growth trajectory and adaptability

      3. **Key Strengths**: Exactly 3 strongest points for this candidacy

      4. **Critical Gaps**: Up to 3 most important gaps to address (can be fewer if minimal gaps)

      5. **Bottom Line**: 2-3 sentence hiring recommendation

      Keep it direct and professional. No fluff or filler phrases.
    `,
    prompt: `
      Assess this candidate's suitability for the role.

      <resume>
        ${resumeText}
      </resume>

      <job_description>
        ${jobDescriptionText}
      </job_description>

      <radar_chart>
        ${JSON.stringify(radarChart, null, 2)}
      </radar_chart>

      <skill_assessment>
        ${JSON.stringify(skillAssessment, null, 2)}
      </skill_assessment>
    `,
  });

  for await (const partial of suitabilityAssessmentStream.partialObjectStream) {
    emitAnalysisPartial(config, {
      node: 'ASSESS_SUITABILITY',
      type: 'suitabilityAssessment',
      data: partial,
    });
  }

  const suitabilityAssessment = await suitabilityAssessmentStream.object;
  emitAnalysisCreated(config, {
    node: 'ASSESS_SUITABILITY',
    type: 'suitabilityAssessment',
    message: 'Suitability assessment created successfully',
    data: suitabilityAssessment,
  });
  return { suitabilityAssessment };
};
