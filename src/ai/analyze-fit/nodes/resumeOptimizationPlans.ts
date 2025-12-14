import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisPartial } from '@/ai/analyze-fit/events';
import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { model } from '@/ai/config';

export const actionPlanSchema = z.object({
  plan: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
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
    model,
    schema: actionPlanSchema,
    abortSignal: config.signal,
    system: `
      You are a season career coach providing actionable advice to improve a candidate's resume.
      
      Your recommendations should be based on comparing the candidate's resume to the job description.

      Your priority is to help the candidate pass the initial screen.

      Ground your recommendations on the candidate's particular skills and experience, and a pre-determined suitability assessment.
    `,
    prompt: `
      RESUME:
      ${resumeText}

      JOB DESCRIPTION:
      ${jobDescriptionText}

      SKILLS RADAR CHART DATA:
      ${JSON.stringify(radarChart, null, 2)}

      SKILL ASSESSMENT:
      ${JSON.stringify(skillAssessment, null, 2)}

      SUITABILITY ASSESSMENT:
      ${suitabilityAssessment.suitabilityReasoning}
    `,
  });

  for await (const partial of resumeOptimizationsStream.partialObjectStream) {
    emitAnalysisPartial(config, { type: 'resumeOptimizations', data: partial });
  }

  const resumeOptimizations = await resumeOptimizationsStream.object;
  return { resumeOptimizations };
};
