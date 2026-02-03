import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisCreated, emitAnalysisPartial } from '@/ai/analyze-fit/events';
import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { models } from '@/ai/config';

export const actionPlanSchema = z.object({
  plan: z.array(
    z.object({
      title: z
        .string()
        .describe('Concise, actionable title (e.g., "Add missing TypeScript keyword")'),
      category: z
        .enum([
          'keyword-optimization',
          'quantification',
          'experience-alignment',
          'skills-section',
          'format-structure',
        ])
        .describe('The type of resume improvement'),
      description: z
        .string()
        .describe(
          'Detailed explanation of what to change and why it matters for ATS/recruiter screening',
        ),
      example: z
        .string()
        .describe(
          'Specific before/after text showing exactly what to change (e.g., "Before: Managed team → After: Led cross-functional team of 8 engineers")',
        ),
      estimatedEffort: z
        .enum(['15min', '1hr', '2-4hrs', '1day', 'multi-day'])
        .describe('Realistic time estimate to implement this change'),
      priority: z
        .enum(['critical', 'high', 'medium', 'low'])
        .describe(
          'Impact level: critical = major skill gap, high = missing keyword, medium = enhancement, low = nice-to-have',
        ),
    }),
  ),
});

export type ActionPlan = z.infer<typeof actionPlanSchema>;

type ResumeOptimizationPlansState = {
  resumeText: string;
  jobDescriptionText: string;
  radarChart: RadarChart;
  skillAssessment: SkillAssessment;
  suitabilityAssessment: SuitabilityAssessment;
};

export const resumeOptimizationPlans = async (
  state: ResumeOptimizationPlansState,
  config: LangGraphRunnableConfig,
) => {
  const { resumeText, jobDescriptionText, radarChart, skillAssessment, suitabilityAssessment } =
    state;

  if (!radarChart || !skillAssessment || !suitabilityAssessment) {
    throw new Error('Missing required state at resumeOptimizationPlans node');
  }

  const resumeOptimizationsStream = streamObject({
    model: models.powerful,
    schema: actionPlanSchema,
    abortSignal: config.signal,
    system: `
      You are an expert ATS (Applicant Tracking System) optimization specialist and career coach with 15+ years of experience helping candidates land interviews.

      ## Your Mission
      Generate SPECIFIC, ACTIONABLE resume improvements that will:
      1. Pass automated ATS screening
      2. Capture recruiter attention in 6-second scans
      3. Demonstrate clear fit for THIS specific role

      ## Recommendation Categories (include at least one from each relevant category):

      ### KEYWORD OPTIMIZATION
      - Identify missing keywords from the job description
      - Suggest exact phrases to add and where to place them
      - Use job description terminology verbatim where appropriate

      ### QUANTIFICATION
      - Find vague statements and suggest specific metrics
      - Example: "Managed team" → "Led cross-functional team of 8 engineers, delivering 3 major releases on schedule"
      - Example: "Improved performance" → "Reduced API response time by 40% through database query optimization"

      ### EXPERIENCE ALIGNMENT
      - Suggest reframing existing experience to match job requirements
      - Identify transferable achievements that should be highlighted
      - Recommend de-emphasizing irrelevant experience

      ### SKILLS SECTION
      - Recommend skills to add, remove, or reorder based on job requirements
      - Match terminology exactly to job description (e.g., "React" not "React.js" if JD says "React")
      - Suggest skill groupings that mirror job description categories

      ### FORMAT & STRUCTURE
      - Identify structural improvements for scannability
      - Flag any potential red flags and mitigation strategies

      ## Output Requirements
      - Every recommendation MUST include a specific example or before/after text in the 'example' field
      - Prioritize high-impact changes that address critical skill gaps from the assessment
      - Be direct and actionable — no generic advice like "tailor your resume"
      - Limit to 6-8 recommendations maximum, ordered by impact
      - Assign realistic effort estimates
    `,
    prompt: `
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

      <suitability_assessment>
        ${suitabilityAssessment.suitabilityReasoning}
      </suitability_assessment>
    `,
  });

  for await (const partial of resumeOptimizationsStream.partialObjectStream) {
    emitAnalysisPartial(config, {
      node: 'RESUME_OPTIMIZATION_PLANS',
      type: 'resumeOptimizations',
      data: partial,
    });
  }

  const resumeOptimizations = await resumeOptimizationsStream.object;
  emitAnalysisCreated(config, {
    node: 'RESUME_OPTIMIZATION_PLANS',
    type: 'resumeOptimizations',
    message: 'Resume optimizations created successfully',
    data: resumeOptimizations,
  });
  return { resumeOptimizations };
};
