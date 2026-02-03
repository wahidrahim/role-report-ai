import { END, START, StateGraph } from '@langchain/langgraph';

import { assessSkills } from '@/ai/analyze-fit/nodes/assessSkills';
import { assessSuitability } from '@/ai/analyze-fit/nodes/assessSuitability';
import { learningPrioritiesPlan } from '@/ai/analyze-fit/nodes/learningPrioritiesPlan';
import { plotRadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { resumeOptimizationPlans } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';
import { routeAfterValidation, validateInputs } from '@/ai/analyze-fit/nodes/validateInputs';
import { stateAnnotation } from '@/ai/analyze-fit/state';

export const analyzeFitGraph = new StateGraph(stateAnnotation)
  .addNode('validateInputs', validateInputs)
  .addNode('plotRadarChart', plotRadarChart)
  .addNode('assessSkills', assessSkills)
  .addNode('assessSuitability', assessSuitability)
  .addNode('resumeOptimizationPlans', resumeOptimizationPlans)
  .addNode('learningPrioritiesPlan', learningPrioritiesPlan)
  .addEdge(START, 'validateInputs')
  .addConditionalEdges('validateInputs', routeAfterValidation, [
    'plotRadarChart',
    'assessSkills',
    END,
  ])
  .addEdge('plotRadarChart', 'assessSuitability')
  .addEdge('assessSkills', 'assessSuitability')
  .addEdge('assessSuitability', 'resumeOptimizationPlans')
  .addEdge('assessSuitability', 'learningPrioritiesPlan')
  .addEdge('resumeOptimizationPlans', END)
  .addEdge('learningPrioritiesPlan', END)
  .compile();
