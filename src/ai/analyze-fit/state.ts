import { Annotation } from '@langchain/langgraph';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';

export const stateAnnotation = Annotation.Root({
  resumeText: Annotation<string>,
  jobDescriptionText: Annotation<string>,
  validationError: Annotation<string | null>,

  radarChart: Annotation<RadarChart>,
  skillAssessment: Annotation<SkillAssessment>,
  suitabilityAssessment: Annotation<SuitabilityAssessment>,
  resumeOptimizations: Annotation<ActionPlan>,
  learningPriorities: Annotation<ActionPlan>,
});

export type AnalyzeFitState = typeof stateAnnotation.State;
