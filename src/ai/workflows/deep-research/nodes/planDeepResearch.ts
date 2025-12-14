import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { z } from 'zod';

import { model } from '@/ai/config';
import { emitNodeStart } from '@/ai/workflows/deep-research/events';
import type { DeepResearchState } from '@/ai/workflows/deep-research/state';

export const DeepResearchPlanSchema = z.object({
  searchQueries: z
    .array(
      z.object({
        query: z.string(),
        rationale: z.string(),
        category: z.enum(['pulse', 'culture', 'leaks']),
      }),
    )
    .min(3)
    .max(6),
});

export type DeepResearchPlan = z.infer<typeof DeepResearchPlanSchema>;

export const planDeepResearch = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] planning deep research');
  const { searchResultsReviewCount } = state;

  emitNodeStart(config, {
    node: 'PLAN_DEEP_RESEARCH',
    message:
      searchResultsReviewCount > 0
        ? 'Re-planning search queries for better quality results...'
        : 'Planning search queries...',
  });

  const {
    companyName,
    jobTitle,
    skillAssessment,
    suitabilityAssessment,
    searchResultsReviewFeedback,
  } = state;

  if (!companyName || !jobTitle) {
    throw new Error('Missing company name or job title at DEEP_RESEARCH_PLAN node');
  }

  const gapsList = skillAssessment.skills.filter(
    (skill) => skill.status === 'missing' || skill.status === 'transferable',
  );

  const { object } = await generateObject({
    model,
    schema: DeepResearchPlanSchema,
    abortSignal: config.signal,
    system: `
      You are a Lead Investigator for a Career Intelligence Unit.
      Your goal is to uncover "Insider Intel" tailored to a specific candidate's weaknesses.

      TARGET: ${companyName}
      ROLE: ${jobTitle}
      CANDIDATE GAPS: ${gapsList}
      SUITABILITY ASSESSMENT: ${suitabilityAssessment.suitabilityReasoning}

      *** STRATEGY BUCKETS ***
      1. PULSE (Stability): Recent layoffs, funding, pivots.
      2. CULTURE (Vibe): Engineering values, RTO mandates.
      3. LEAKS (The Exam): General interview questions.
      4. GAP RECON (Critical): SPECIFICALLY search for how the company uses the technologies the candidate is missing. 
        - If candidate lacks ${gapsList}, find out how ${companyName} implements them.
        - Find interview questions specifically about these missing topics.

      *** QUERY GUIDELINES ***
      - Generic: "Stripe interview questions"
      - Better: "Stripe GraphQL interview questions" (if GraphQL is a gap)
      - Better: "Stripe engineering blog Kubernetes architecture" (if Kubernetes is a gap)
    `,
    prompt: searchResultsReviewFeedback
      ? `
      ***PREVIOUS RESEARCH PLAN FAILED***
      FEEDBACK: ${searchResultsReviewFeedback}
      TASK: Generate better search queries based on the feedback.
    `
      : 'Generate a 6-point personalized search plan.',
  });

  return {
    searchQueries: object.searchQueries.map(({ query }) => query.trim()),
  };
};
