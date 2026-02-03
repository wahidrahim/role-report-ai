import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { z } from 'zod';

import { models } from '@/ai/config';
import { emitNodeStart } from '@/ai/deep-research/events';
import type { DeepResearchState } from '@/ai/deep-research/state';

export const DeepResearchPlanSchema = z.object({
  searchQueries: z
    .array(
      z.object({
        query: z.string(),
        rationale: z.string(),
        category: z.enum(['pulse', 'culture', 'leaks', 'skillGap']),
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

  if (!companyName || !jobTitle)
    throw new Error('Missing company name or job title at DEEP_RESEARCH_PLAN node');

  const skillGaps = skillAssessment.skills
    .filter((skill) => skill.status === 'missing')
    .map((skill) => `${skill.skillName} ${skill.importance}`)
    .join(', ');
  const { object } = await generateObject({
    model: models.balanced,
    schema: DeepResearchPlanSchema,
    abortSignal: config.signal,
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' },
      },
    },
    system: `
      You are a Lead Investigator for a Career Intelligence Unit.
      Your goal is to uncover "Insider Intel" tailored to a specific candidate's weaknesses.

      TARGET: ${companyName}
      ROLE: ${jobTitle}
      SKILL GAPS: ${skillGaps}
      SUITABILITY ASSESSMENT: ${suitabilityAssessment.bottomLine}

      OUTPUT (STRICT):
      - Return VALID JSON that matches the provided schema exactly.
      - Return an object with a single key: "searchQueries".
      - "searchQueries" must be an array of 3 to 6 items.
      - Each item must have EXACTLY these keys: "query", "rationale", "category".
      - "category" MUST be exactly one of: "pulse" | "culture" | "leaks" | "skillGap"
        (These are case-sensitive; do NOT output "gap", "skill_gap", or uppercase variants.)

      CATEGORY DEFINITIONS (use these exact strings):
      - pulse: company stability signals (layoffs, hiring freezes, restructuring, major pivots)
      - culture: engineering culture & ways of working (RTO/remote, on-call, values, org structure)
      - leaks: general interview formats/questions reported publicly
      - skillGap: how ${companyName} uses technologies the candidate is missing + gap-specific interview questions

      SKILL GAP FOCUS (category="skillGap"):
      - If candidate lacks ${skillGaps}, search for how ${companyName} uses those exact technologies.
      - Search for interview questions specifically about those missing topics at this company.

      *** QUERY GUIDELINES ***
      - Generic: "Stripe interview questions"
      - Better: "Stripe GraphQL interview questions" (if GraphQL is a gap)
      - Better: "Stripe engineering blog Kubernetes architecture" (if Kubernetes is a gap)
    `,
    prompt: searchResultsReviewFeedback
      ? `
      ***PREVIOUS RESEARCH PLAN FAILED***
      FEEDBACK: ${searchResultsReviewFeedback}
      TASK: Regenerate the JSON plan. Apply the feedback and keep the output schema-valid.
    `
      : 'Generate a 6-item personalized search plan (must still be 3..6 items).',
  });

  return {
    searchQueries: object.searchQueries.map(({ query }) => query.trim()),
  };
};
