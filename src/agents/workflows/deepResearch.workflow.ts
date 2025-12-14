import { Annotation, END, LangGraphRunnableConfig, START, StateGraph } from '@langchain/langgraph';
import { tavily } from '@tavily/core';
import { generateObject, streamObject } from 'ai';
import z from 'zod';

import { model } from '@/agents/config';
import { extractCompanyNameAndJobTitlePrompt } from '@/agents/prompts/extractCompanyNameAndJobTitle.prompt';
import { interviewPrepGuidePrompt } from '@/agents/prompts/interviewPrepGuide.prompt';
import { deepResearchPlanPrompt } from '@/agents/prompts/planDeepResearch.prompt';
import { researchReportPrompt } from '@/agents/prompts/researchReport.prompt';
import { extractCompanyNameAndJobTitleSchema } from '@/agents/schemas/extractCompanyNameAndJobTitle.schema';
import {
  InterviewPrepGuide,
  interviewPrepGuideSchema,
} from '@/agents/schemas/interviewPrepGuide.schema';
import { DeepResearchPlanSchema } from '@/agents/schemas/planDeepResearch.schema';
import { ResearchReport, researchReportSchema } from '@/agents/schemas/researchReport.schema';
import { SkillAssessment } from '@/agents/schemas/skillAssessment.schema';
import { SuitabilityAssessment } from '@/agents/schemas/suitabilityAssessment.schema';

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const stateAnnotation = Annotation.Root({
  jobDescription: Annotation<string>,
  skillAssessment: Annotation<SkillAssessment>,
  suitabilityAssessment: Annotation<SuitabilityAssessment>,
  companyName: Annotation<string | null>,
  jobTitle: Annotation<string | null>,
  searchQueries: Annotation<string[]>,
  searchResults: Annotation<string[]>({
    reducer: (prev, curr) => [...prev, ...curr],
    default: () => [],
  }),
  searchResultsQuality: Annotation<string>,
  searchResultsReviewCount: Annotation<number>({
    reducer: (prev, curr) => curr,
    default: () => 0,
  }),
  searchResultsReviewFeedback: Annotation<string>,
  interviewPrepGuide: Annotation<InterviewPrepGuide>,
  researchReport: Annotation<ResearchReport>,
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
const shouldProceedWithDeepResearch = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  const { companyName, jobTitle } = state;
  const isValidCompanyName = typeof companyName === 'string' && companyName.length > 0;
  const isValidJobTitle = typeof jobTitle === 'string' && jobTitle.length > 0;
  const shouldProceed = isValidCompanyName && isValidJobTitle;

  if (!isValidCompanyName || !isValidJobTitle) {
    config.writer?.({
      event: 'NODE_END',
      data: {
        node: 'SHOULD_PROCEED_WITH_DEEP_RESEARCH',
        message: 'Unable to infer company name or job title',
      },
    });
  }

  return shouldProceed ? 'YES' : 'NO';
};

// NODE 3: Plan deep research
const planDeepResearch = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] planning deep research');
  const { searchResultsReviewCount } = state;

  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'PLAN_DEEP_RESEARCH',
      message:
        searchResultsReviewCount > 0
          ? 'Re-planning search queries for better quality results...'
          : 'Planning search queries...',
    },
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

  const { object } = await generateObject({
    model,
    schema: DeepResearchPlanSchema,
    abortSignal: config.signal,
    ...deepResearchPlanPrompt({
      companyName,
      jobTitle,
      skillAssessment,
      suitabilityAssessment,
      searchResultsReviewFeedback,
    }),
  });

  return {
    searchQueries: object.searchQueries.map(({ query }) => query.trim()),
  };
};

const searchForInformation = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] searching for information');
  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'SEARCH_FOR_INFORMATION',
      message: 'Searching for information...',
    },
  });

  const { searchQueries } = state;

  if (!searchQueries) {
    throw new Error('Missing search queries at SEARCH_FOR_INFORMATION node');
  }

  let totalPages = 0;
  const searchResults = await Promise.all(
    searchQueries.map(async (query) => {
      const results = await tavilyClient.search(query);

      config.writer?.({
        event: 'TOOL_CALL',
        data: {
          node: 'SEARCH_FOR_INFORMATION',
          message: `Gathering intelligence from ${++totalPages} source${totalPages === 1 ? '' : 's'}`,
        },
      });

      return results.results
        .map((result) => `SOURCE: ${result.url}\nCONTENT: ${result.content}`)
        .join('\n\n---\n\n');
    }),
  );
  const combinedSearchResults = searchResults.join('\n\n---\n\n');

  return {
    searchResults: combinedSearchResults,
  };
};

const reviewSearchResults = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  const { searchResults, searchResultsReviewCount } = state;

  if (!searchResults) {
    throw new Error('Missing search results at REVIEW_SEARCH_RESULTS node');
  }

  if (searchResultsReviewCount >= 3) {
    console.log(`Max retries reached (${searchResultsReviewCount}). Forcing progress.`);
    return { quality: 'pass', feedback: 'Max retries exceeded.' };
  }

  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'REVIEW_SEARCH_RESULTS',
      message: 'Reviewing search results...',
    },
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

      Assign "PASS" if ALL of the following are true:
      1. Contains specific interview questions (not just generic advice).
      2. Contains specific engineering values or tech stack details (e.g. "Apollo Federation", "Radical Candor").
      3. Is NOT just generic "About Us" marketing text.

      Assign "FAIL" if ANY of the above criteria are NOT met.
      When assigning "FAIL", provide actionable feedback on what specific information is missing so the search can be improved.

      DATA TO REVIEW:
      ${searchResults.join('\n\n---\n\n')}
    `,
    prompt: `Evaluate the data quality and assign "PASS" or "FAIL" based on the criteria above.`,
    abortSignal: config.signal,
  });

  return {
    searchResultsQuality: object.status,
    searchResultsReviewFeedback: object.feedback,
    searchResultsReviewCount: searchResultsReviewCount + 1,
  };
};

const shouldReGenerateSearchQueries = async (state: typeof stateAnnotation.State) => {
  return state.searchResultsQuality === 'FAIL' ? 'YES' : 'NO';
};

const createInterviewPrepGuide = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  const { searchResults, skillAssessment, suitabilityAssessment, companyName, jobTitle } = state;

  if (!searchResults || !skillAssessment || !suitabilityAssessment || !companyName || !jobTitle) {
    throw new Error('Missing required state at CREATE_INTERVIEW_PREP_GUIDE node');
  }

  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'CREATE_INTERVIEW_PREP_GUIDE',
      message: 'Creating interview prep guide...',
    },
  });

  const { object } = await generateObject({
    model,
    schema: interviewPrepGuideSchema,
    ...interviewPrepGuidePrompt({
      companyName,
      jobTitle,
      skillAssessment,
      suitabilityAssessment,
      searchResults,
    }),
    abortSignal: config.signal,
  });

  config.writer?.({
    event: 'NODE_END',
    data: {
      node: 'CREATE_INTERVIEW_PREP_GUIDE',
      message: 'Interview prep guide created successfully',
      interviewPrepGuide: object,
    },
  });

  return { interviewPrepGuide: object };
};

const createResearchReport = async (
  state: typeof stateAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  const { searchResults, interviewPrepGuide, companyName } = state;

  if (!searchResults || !interviewPrepGuide || !companyName) {
    throw new Error('Missing required state at CREATE_RESEARCH_REPORT node');
  }

  config.writer?.({
    event: 'NODE_START',
    data: {
      node: 'CREATE_RESEARCH_REPORT',
      message: 'Creating research report...',
    },
  });

  const researchReportStream = streamObject({
    model,
    schema: researchReportSchema,
    ...researchReportPrompt({
      companyName,
      searchResults,
      interviewPrepGuide,
    }),
  });

  for await (const partial of researchReportStream.partialObjectStream) {
    config.writer?.({
      event: 'RESEARCH_REPORT_STREAM_PARTIAL',
      data: {
        node: 'CREATE_RESEARCH_REPORT',
        researchReport: partial,
      },
    });
  }

  const researchReport = await researchReportStream.object;

  config.writer?.({
    event: 'RESEARCH_REPORT_CREATED',
    data: {
      node: 'CREATE_RESEARCH_REPORT',
      message: 'Research report created successfully',
      researchReport,
    },
  });

  return { researchReport };
};

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
