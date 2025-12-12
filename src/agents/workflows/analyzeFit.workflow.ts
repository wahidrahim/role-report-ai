import { streamObject } from 'ai';

import { model } from '@/agents/config';
import { learningPrioritiesPrompt } from '@/agents/prompts/learningPriorities.prompt';
import { radarChartPrompt } from '@/agents/prompts/radarChart.prompt';
import { resumeOptimizationsPrompt } from '@/agents/prompts/resumeOptimizations.prompt';
import { skillAssessmentPrompt } from '@/agents/prompts/skillAssessment.prompt';
import { suitabilityAssessmentPrompt } from '@/agents/prompts/suitabilityAssessment.prompt';
import { actionPlanSchema } from '@/agents/schemas/actionPlan.schema';
import { radarChartSchema } from '@/agents/schemas/radarChart.schema';
import { skillAssessmentSchema } from '@/agents/schemas/skillAssessment.schema';
import { suitabilityAssessmentSchema } from '@/agents/schemas/suitabilityAssessment.schema';

const encoder = new TextEncoder();

const sendDataFn =
  (controller: ReadableStreamDefaultController) => (type: string, data: unknown) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
  };

export const analyzeFitWorkflow = (resumeText: string, jobDescriptionText: string) =>
  new ReadableStream({
    start: async (controller) => {
      try {
        const sendData = sendDataFn(controller);

        const radarChartStream = streamObject({
          model,
          schema: radarChartSchema,
          ...radarChartPrompt(resumeText, jobDescriptionText),
        });

        const skillAssessmentStream = streamObject({
          model,
          schema: skillAssessmentSchema,
          ...skillAssessmentPrompt(resumeText, jobDescriptionText),
        });

        const streamRadarChart = (async () => {
          for await (const partial of radarChartStream.partialObjectStream) {
            sendData('radarChart', partial);
          }
        })();

        const streamSkillAssessment = (async () => {
          for await (const partial of skillAssessmentStream.partialObjectStream) {
            sendData('skillAssessment', partial);
          }
        })();

        await Promise.all([streamRadarChart, streamSkillAssessment]);

        const [radarChart, skillAssessment] = await Promise.all([
          radarChartStream.object,
          skillAssessmentStream.object,
        ]);

        const suitabilityAssessmentStream = streamObject({
          model,
          schema: suitabilityAssessmentSchema,
          ...suitabilityAssessmentPrompt(
            resumeText,
            jobDescriptionText,
            radarChart,
            skillAssessment,
          ),
        });

        for await (const partial of suitabilityAssessmentStream.partialObjectStream) {
          sendData('suitabilityAssessment', partial);
        }

        const suitabilityAssessment = await suitabilityAssessmentStream.object;

        const resumeOptimizationsStream = streamObject({
          model,
          schema: actionPlanSchema,
          ...resumeOptimizationsPrompt(
            resumeText,
            jobDescriptionText,
            radarChart,
            skillAssessment,
            suitabilityAssessment,
          ),
        });
        const learningPrioritiesStream = streamObject({
          model,
          schema: actionPlanSchema,
          ...learningPrioritiesPrompt(
            resumeText,
            jobDescriptionText,
            radarChart,
            skillAssessment,
            suitabilityAssessment,
          ),
        });

        const streamResumeOptimizations = (async () => {
          for await (const partial of resumeOptimizationsStream.partialObjectStream) {
            sendData('resumeOptimizations', partial);
          }
        })();

        const streamLearningPriorities = (async () => {
          for await (const partial of learningPrioritiesStream.partialObjectStream) {
            sendData('learningPriorities', partial);
          }
        })();

        await Promise.all([streamResumeOptimizations, streamLearningPriorities]);

        sendData('done', null);
        controller.close();
      } catch (error) {
        console.error('Error in analyzeFitWorkflow:', error);
        sendDataFn(controller)(
          'error',
          error instanceof Error ? error.message : 'Failed to generate analysis',
        );
        controller.close();
      }
    },
  });
