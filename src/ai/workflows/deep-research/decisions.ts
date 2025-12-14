import type { LangGraphRunnableConfig } from '@langchain/langgraph';

import { emitNodeEnd } from './events';
import type { DeepResearchState } from './state';

export const shouldProceedWithDeepResearch = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  const { companyName, jobTitle } = state;
  const isValidCompanyName = typeof companyName === 'string' && companyName.length > 0;
  const isValidJobTitle = typeof jobTitle === 'string' && jobTitle.length > 0;
  const shouldProceed = isValidCompanyName && isValidJobTitle;

  if (!isValidCompanyName || !isValidJobTitle) {
    emitNodeEnd(config, {
      node: 'SHOULD_PROCEED_WITH_DEEP_RESEARCH',
      message: 'Unable to infer company name or job title',
    });
  }

  return shouldProceed ? 'YES' : 'NO';
};

export const shouldReGenerateSearchQueries = async (state: DeepResearchState) => {
  return state.searchResultsQuality === 'FAIL' ? 'YES' : 'NO';
};
