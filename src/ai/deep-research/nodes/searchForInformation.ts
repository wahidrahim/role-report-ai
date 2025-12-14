import type { LangGraphRunnableConfig } from '@langchain/langgraph';

import { emitNodeStart, emitToolCall } from '@/ai/deep-research/events';
import type { DeepResearchState } from '@/ai/deep-research/state';
import { tavilyClient } from '@/ai/deep-research/tools';

export const searchForInformation = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] searching for information');
  emitNodeStart(config, {
    node: 'SEARCH_FOR_INFORMATION',
    message: 'Searching for information...',
  });

  const { searchQueries } = state;

  if (!searchQueries) {
    throw new Error('Missing search queries at SEARCH_FOR_INFORMATION node');
  }

  let totalPages = 0;
  const searchResults = await Promise.all(
    searchQueries.map(async (query) => {
      const results = await tavilyClient.search(query);

      emitToolCall(config, {
        node: 'SEARCH_FOR_INFORMATION',
        message: `Gathering intelligence from ${++totalPages} source${totalPages === 1 ? '' : 's'}`,
      });

      return results.results
        .map((result) => `SOURCE: ${result.url}\nCONTENT: ${result.content}`)
        .join('\n\n---\n\n');
    }),
  );

  const combinedSearchResults = searchResults.join('\n\n---\n\n');

  return {
    // NOTE: Preserving existing behavior (single combined string), even though stateAnnotation types this as string[].
    // If you want, we can follow up by fixing the type/value mismatch.
    searchResults: combinedSearchResults as unknown as string[],
  };
};
