import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { generateObject } from 'ai';
import z from 'zod';

import { model } from '@/ai/config';
import { emitNodeStart } from '@/ai/deep-research/events';
import type { DeepResearchState } from '@/ai/deep-research/state';

export const reviewSearchResults = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  const { searchResults, searchResultsReviewCount } = state;

  if (!searchResults) {
    throw new Error('Missing search results at REVIEW_SEARCH_RESULTS node');
  }

  if (searchResultsReviewCount >= 3) {
    console.log(`Max retries reached (${searchResultsReviewCount}). Forcing progress.`);
    return {
      searchResultsQuality: 'PASS',
      searchResultsReviewFeedback: 'Max retries exceeded.',
      searchResultsReviewCount: searchResultsReviewCount + 1,
    };
  }

  emitNodeStart(config, {
    node: 'REVIEW_SEARCH_RESULTS',
    message: 'Reviewing search results...',
  });

  const { object } = await generateObject({
    model,
    schema: z.object({
      status: z.enum(['PASS', 'FAIL']),
      feedback: z.string(),
    }),
    system: `
      You are a Research Quality Assurance Officer.
      Evaluate the gathered data for the "Deep Research Dossier".

      OUTPUT (STRICT):
      - Return a JSON OBJECT (an instance), not a schema/description.
      - Return EXACTLY these keys: "status", "feedback" (no extra keys).
      - "status" MUST be exactly one of: "PASS" | "FAIL" (case-sensitive).
      - "feedback" MUST be a non-empty string. If status is PASS, briefly explain why it passed.

      Assign "PASS" if ALL of the following are true:
      1. Contains specific interview questions (not just generic advice).
      2. Contains specific engineering values or tech stack details (e.g. "Apollo Federation", "Radical Candor").
      3. Is NOT just generic "About Us" marketing text.

      Assign "FAIL" if ANY of the above criteria are NOT met.
      When assigning "FAIL", provide actionable feedback on what specific information is missing so the search can be improved.

      DATA TO REVIEW:
      ${searchResults.join('\n\n---\n\n')}
    `,
    prompt: `Return { "status": "PASS" | "FAIL", "feedback": string } based on the criteria above.`,
    abortSignal: config.signal,
  });

  return {
    searchResultsQuality: object.status,
    searchResultsReviewFeedback: object.feedback,
    searchResultsReviewCount: searchResultsReviewCount + 1,
  };
};
