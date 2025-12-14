import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';

import { emitAnalysisCreated, emitAnalysisPartial } from '@/ai/analyze-fit/events';
import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { actionPlanSchema } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';
import { model } from '@/ai/config';

type LearningPrioritiesPlanState = {
  resumeText: string;
  jobDescriptionText: string;
  radarChart: RadarChart;
  skillAssessment: SkillAssessment;
  suitabilityAssessment: SuitabilityAssessment;
};

export const learningPrioritiesPlan = async (
  state: LearningPrioritiesPlanState,
  config: LangGraphRunnableConfig,
) => {
  const { resumeText, jobDescriptionText, radarChart, skillAssessment, suitabilityAssessment } =
    state;

  if (!radarChart || !skillAssessment || !suitabilityAssessment) {
    throw new Error('Missing required state at learningPrioritiesPlan node');
  }

  const learningPrioritiesStream = streamObject({
    model,
    schema: actionPlanSchema,
    abortSignal: config.signal,
    system: `
      You are an seasoned career coach helping a candidate prepare for a screening call and potential interview.

      Your task is to generate a list of learning priorities for the candidate.

      Ground your recommendations based on the candidate's resume, their skills, and the job description.
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

  for await (const partial of learningPrioritiesStream.partialObjectStream) {
    emitAnalysisPartial(config, {
      node: 'LEARNING_PRIORITIES_PLAN',
      type: 'learningPriorities',
      data: partial,
    });
  }

  const learningPriorities = await learningPrioritiesStream.object;
  emitAnalysisCreated(config, {
    node: 'LEARNING_PRIORITIES_PLAN',
    type: 'learningPriorities',
    message: 'Learning priorities created successfully',
    data: learningPriorities,
  });
  return { learningPriorities: learningPriorities as ActionPlan };
};
