import { END, START, StateGraph } from '@langchain/langgraph';

import { shouldProceedWithDeepResearch, shouldReGenerateSearchQueries } from './decisions';
import { createInterviewPrepGuide } from './nodes/createInterviewPrepGuide';
import { createResearchReport } from './nodes/createResearchReport';
import { inferCompanyNameAndJobTitle } from './nodes/inferCompanyNameAndJobTitle';
import { planDeepResearch } from './nodes/planDeepResearch';
import { reviewSearchResults } from './nodes/reviewSearchResults';
import { searchForInformation } from './nodes/searchForInformation';
import { stateAnnotation } from './state';

export const deepResearchWorkflow = new StateGraph(stateAnnotation)
  .addNode('INFER_COMPANY_NAME_AND_JOB_TITLE', inferCompanyNameAndJobTitle)
  .addNode('PLAN_DEEP_RESEARCH', planDeepResearch)
  .addNode('SEARCH_FOR_INFORMATION', searchForInformation)
  .addNode('REVIEW_SEARCH_RESULTS', reviewSearchResults)
  .addNode('CREATE_INTERVIEW_PREP_GUIDE', createInterviewPrepGuide)
  .addNode('CREATE_RESEARCH_REPORT', createResearchReport)
  .addEdge(START, 'INFER_COMPANY_NAME_AND_JOB_TITLE')
  .addConditionalEdges('INFER_COMPANY_NAME_AND_JOB_TITLE', shouldProceedWithDeepResearch, {
    YES: 'PLAN_DEEP_RESEARCH',
    NO: END,
  })
  .addEdge('PLAN_DEEP_RESEARCH', 'SEARCH_FOR_INFORMATION')
  .addEdge('SEARCH_FOR_INFORMATION', 'REVIEW_SEARCH_RESULTS')
  .addConditionalEdges('REVIEW_SEARCH_RESULTS', shouldReGenerateSearchQueries, {
    YES: 'PLAN_DEEP_RESEARCH',
    NO: 'CREATE_INTERVIEW_PREP_GUIDE',
  })
  .addEdge('CREATE_INTERVIEW_PREP_GUIDE', 'CREATE_RESEARCH_REPORT')
  .addEdge('CREATE_RESEARCH_REPORT', END)
  .compile();
