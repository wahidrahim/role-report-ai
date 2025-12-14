import { Annotation, END, LangGraphRunnableConfig, START, StateGraph } from '@langchain/langgraph';
import { generateObject } from 'ai';

import { model } from '@/agents/config';
import { extractCompanyNameAndJobTitlePrompt } from '@/agents/prompts/extractCompanyNameAndJobTitle.prompt';
import { deepResearchPlanPrompt } from '@/agents/prompts/planDeepResearch.prompt';
import { extractCompanyNameAndJobTitleSchema } from '@/agents/schemas/extractCompanyNameAndJobTitle.schema';
import { DeepResearchPlanSchema } from '@/agents/schemas/planDeepResearch.schema';
import { SkillAssessment } from '@/agents/schemas/skillAssessment.schema';
import { SuitabilityAssessment } from '@/agents/schemas/suitabilityAssessment.schema';

const stateAnnotation = Annotation.Root({
  jobDescription: Annotation<string>,
  skillAssessment: Annotation<SkillAssessment>,
  suitabilityAssessment: Annotation<SuitabilityAssessment>,
  companyName: Annotation<string | null>,
  jobTitle: Annotation<string | null>,
  searchQueries: Annotation<string[] | null>,
});

// NODE 1: Extract company name and job title
const inferCompanyNameAndJobTitle = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] inferring company name and job title');
  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'INFER_COMPANY_NAME_AND_JOB_TITLE',
      message: 'Inferring company name and job title...',
    },
  });

  const { jobDescription } = state;
  const { object } = await generateObject({
    model,
    schema: extractCompanyNameAndJobTitleSchema,
    abortSignal: config.signal,
    ...extractCompanyNameAndJobTitlePrompt(jobDescription),
  });

  if (object.unableToExtract) {
    return {
      companyName: null,
      jobTitle: null,
    };
  }

  config.writer?.({
    event: 'NODE_END',
    data: {
      node: 'INFER_COMPANY_NAME_AND_JOB_TITLE',
      message: `Company: ${object.companyName}, Job Title: ${object.jobTitle}`,
      companyName: object.companyName,
      jobTitle: object.jobTitle,
    },
  });

  return {
    companyName: object.companyName,
    jobTitle: object.jobTitle,
  };
};

// NODE 2: Determine if we should proceed with deep research
const shouldProceedWithDeepResearch = async (state: typeof stateAnnotation.State) => {
  const { companyName, jobTitle } = state;
  const isValidCompanyName = typeof companyName === 'string' && companyName.length > 0;
  const isValidJobTitle = typeof jobTitle === 'string' && jobTitle.length > 0;
  const shouldProceed = isValidCompanyName && isValidJobTitle;

  return shouldProceed ? 'YES' : 'NO';
};

// NODE 3: Plan deep research
const planDeepResearch = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] planning deep research');
  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'PLAN_DEEP_RESEARCH',
      message: 'Planning deep research...',
    },
  });

  const { companyName, jobTitle, skillAssessment, suitabilityAssessment } = state;

  if (!companyName || !jobTitle) {
    throw new Error('Missing company name or job title at DEEP_RESEARCH_PLAN node');
  }

  const { object } = await generateObject({
    model,
    schema: DeepResearchPlanSchema,
    abortSignal: config.signal,
    ...deepResearchPlanPrompt({ companyName, jobTitle, skillAssessment, suitabilityAssessment }),
  });

  console.log('[NODE] planned deep research', { searchQueries: object.searchQueries });
  config.writer?.({
    event: 'NODE_END',
    data: {
      node: 'PLAN_DEEP_RESEARCH',
      message: 'Planned deep research',
      searchQueries: object.searchQueries,
    },
  });

  return {
    searchQueries: object.searchQueries,
  };
};

export const deepResearchWorkflow = new StateGraph(stateAnnotation)
  .addNode('INFER_COMPANY_NAME_AND_JOB_TITLE', inferCompanyNameAndJobTitle)
  .addNode('PLAN_DEEP_RESEARCH', planDeepResearch)
  .addEdge(START, 'INFER_COMPANY_NAME_AND_JOB_TITLE')
  .addConditionalEdges('INFER_COMPANY_NAME_AND_JOB_TITLE', shouldProceedWithDeepResearch, {
    YES: 'PLAN_DEEP_RESEARCH',
    NO: END,
  })
  .addEdge('PLAN_DEEP_RESEARCH', END)
  .compile();
