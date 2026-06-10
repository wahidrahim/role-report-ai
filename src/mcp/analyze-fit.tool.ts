import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { skillAssessmentSchema } from '@/ai/analyze-fit/nodes/assessSkills';
import { suitabilityAssessmentSchema } from '@/ai/analyze-fit/nodes/assessSuitability';
import { radarChartSchema } from '@/ai/analyze-fit/nodes/plotRadarChart';
import { analyzeFitGraph } from '@/ai/analyze-fit/workflow';

// Mirrors MIN_TEXT_LENGTH in the validateInputs node so obviously bad input fails fast.
const MIN_TEXT_LENGTH = 100;

const inputSchema = {
  resumeText: z
    .string()
    .min(MIN_TEXT_LENGTH)
    .describe(
      'Full plain-text content of the candidate resume/CV, including experience, skills, and education.',
    ),
  jobDescriptionText: z
    .string()
    .min(MIN_TEXT_LENGTH)
    .describe(
      'Full plain-text job description to evaluate the resume against, including responsibilities and requirements.',
    ),
};

const outputSchema = {
  radarChart: radarChartSchema,
  skillAssessment: skillAssessmentSchema,
  suitabilityAssessment: suitabilityAssessmentSchema,
};

const DESCRIPTION = `Analyzes how well a candidate's resume fits a specific job description. Runs a multi-step AI workflow (30-60 seconds) and returns: a radar chart of competency scores across key skill dimensions, a skill-by-skill assessment with evidence from the resume, and an overall suitability verdict with strengths, gaps, and a fit score. Provide the complete raw text of both the resume and the job description.`;

export const registerAnalyzeFitTool = (server: McpServer) => {
  server.registerTool(
    'analyze_fit',
    {
      title: 'Analyze Resume-Job Fit',
      description: DESCRIPTION,
      inputSchema,
      outputSchema,
    },
    async (args, extra) => {
      const { resumeText, jobDescriptionText } = args;

      try {
        const state = await analyzeFitGraph.invoke(
          { resumeText, jobDescriptionText },
          { signal: extra.signal },
        );

        if (state.validationError) {
          return {
            isError: true,
            content: [
              { type: 'text' as const, text: `Input validation failed: ${state.validationError}` },
            ],
          };
        }

        const result = {
          radarChart: state.radarChart,
          skillAssessment: state.skillAssessment,
          suitabilityAssessment: state.suitabilityAssessment,
        };

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate analysis';

        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Analysis failed: ${message}` }],
        };
      }
    },
  );
};
