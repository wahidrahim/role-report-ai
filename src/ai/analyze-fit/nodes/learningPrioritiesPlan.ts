import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisCreated, emitAnalysisPartial } from '@/ai/analyze-fit/events';
import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { models } from '@/ai/config';

export const learningPlanSchema = z.object({
  plan: z.array(
    z.object({
      title: z
        .string()
        .describe('Concise title for the learning priority (e.g., "TypeScript Fundamentals for React")'),
      category: z
        .enum(['critical-gap', 'quick-win', 'interview-prep'])
        .describe(
          'Type of learning priority: critical-gap = must address first, quick-win = high ROI low effort, interview-prep = likely interview topic',
        ),
      description: z
        .string()
        .describe('Why this learning priority matters and how it connects to the role requirements'),
      resource: z
        .string()
        .describe(
          'Specific course, tutorial, documentation, or project idea (e.g., "React docs: Hooks section", "LeetCode medium array problems")',
        ),
      estimatedTime: z
        .enum(['30min', '1-2hrs', '4-8hrs', '1-2days', '1week+'])
        .describe('Realistic time estimate assuming focused learning'),
      outcome: z
        .string()
        .describe(
          'What the candidate will be able to discuss or demonstrate in an interview after completing',
        ),
      priority: z
        .enum(['critical', 'high', 'medium', 'low'])
        .describe(
          'Impact level: critical = major skill gap, high = important for role, medium = helpful, low = nice-to-have',
        ),
    }),
  ),
});

export type LearningPlan = z.infer<typeof learningPlanSchema>;

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
    model: models.powerful,
    schema: learningPlanSchema,
    abortSignal: config.signal,
    system: `
      You are a seasoned career coach helping a candidate prepare for a screening call and potential interview.

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
  return { learningPriorities: learningPriorities as LearningPlan };
};
