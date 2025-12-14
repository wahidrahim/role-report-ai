import { Annotation } from '@langchain/langgraph';

import { InterviewPrepGuide } from '@/ai/deep-research/nodes/createInterviewPrepGuide';
import { ResearchReport } from '@/ai/deep-research/nodes/createResearchReport';
import type { SkillAssessment, SuitabilityAssessment } from '@/ai/workflows/analyzeFit.workflow';

export const stateAnnotation = Annotation.Root({
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

export type DeepResearchState = typeof stateAnnotation.State;
