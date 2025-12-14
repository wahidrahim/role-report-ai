import { Annotation } from '@langchain/langgraph';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import { InterviewPrepGuide } from '@/ai/deep-research/nodes/createInterviewPrepGuide';
import { ResearchReport } from '@/ai/deep-research/nodes/createResearchReport';

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
