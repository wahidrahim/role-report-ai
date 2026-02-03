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
        .describe(
          'Concise title for the learning priority (e.g., "TypeScript Fundamentals for React")',
        ),
      category: z
        .enum(['critical-gap', 'quick-win', 'interview-prep'])
        .describe(
          'Type of learning priority: critical-gap = must address first, quick-win = high ROI low effort, interview-prep = likely interview topic',
        ),
      description: z
        .string()
        .describe(
          'Why this learning priority matters and how it connects to the role requirements',
        ),
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
      You are a technical interview coach specializing in rapid skill development for job seekers. Your goal is to create a focused learning plan that maximizes interview readiness in limited time.

      ## Context
      The candidate is preparing for a specific role. They need to:
      1. Fill critical skill gaps identified in the assessment
      2. Be able to discuss these topics confidently in interviews
      3. Demonstrate practical understanding, not just theoretical knowledge

      ## Learning Priority Categories

      ### CRITICAL GAPS (Must Address First)
      - Skills marked as "missing" or "critical" in the skill assessment
      - Focus on reaching "conversational competency" — able to discuss intelligently, not master
      - Include specific resources: official docs sections, popular tutorials, small practice projects

      ### QUICK WINS (High ROI, Low Effort)
      - Skills where candidate is close to required level (small gap in radar chart)
      - Topics that can be refreshed or learned in 1-2 hours
      - Areas where candidate's existing skills transfer well

      ### INTERVIEW-LIKELY TOPICS
      - Common interview questions for this specific role type
      - System design concepts if applicable to the role
      - Behavioral scenarios related to the job requirements

      ## Output Requirements
      - Each recommendation MUST include:
        - Specific resource (e.g., "React docs: Hooks section", "LeetCode medium array problems", "Build a todo app with X")
        - Realistic time estimate
        - Clear outcome statement (what they'll be able to discuss)
      - Assume the candidate has 1-2 weeks of prep time
      - Order by interview impact, not learning sequence
      - Limit to 6-8 recommendations maximum
      - Be practical — suggest free resources when possible
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
        Score: ${suitabilityAssessment.suitabilityScore}/10

        Critical Gaps (prioritize learning for these):
        ${suitabilityAssessment.criticalGaps?.map((g) => `- ${g}`).join('\n        ') ?? 'N/A'}

        Criteria Breakdown:
        ${
          suitabilityAssessment.criteriaBreakdown
            ? Object.entries(suitabilityAssessment.criteriaBreakdown)
                .map(([key, value]) => `- ${key}: ${value.score}/10 - ${value.reasoning}`)
                .join('\n        ')
            : 'N/A'
        }
      </suitability_assessment>
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
