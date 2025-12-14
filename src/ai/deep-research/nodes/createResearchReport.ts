import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { model } from '@/ai/config';
import {
  emitNodeStart,
  emitResearchReportCreated,
  emitResearchReportPartial,
} from '@/ai/deep-research/events';
import { interviewPrepGuideSchema } from '@/ai/deep-research/nodes/createInterviewPrepGuide';
import type { DeepResearchState } from '@/ai/deep-research/state';

export const researchReportSchema = z.object({
  companyHealth: z.object({
    status: z.enum(['Stable/Growing', 'Risky/Layoffs', 'Unknown']),
    summary: z
      .string()
      .describe('A 1-2 sentence "Insider" summary of their financial/hiring stability. Be direct.'),
    redFlags: z
      .array(z.string())
      .describe('Specific risks found (e.g., "Stock down 40%", "RTO mandate").'),
  }),

  cultureIntel: z.object({
    keywords: z
      .array(z.string())
      .describe('Top 3 distinct cultural values (e.g., "Frugality", "Radical Candor").'),
    managerVibe: z
      .string()
      .describe('What employees say about management (sourced from Blind/Glassdoor).'),
    engineeringCulture: z
      .string()
      .describe(
        'Specifics on how they work (e.g., "Shape Up", "Heavy On-call", "Flat structure").',
      ),
  }),

  interviewPrepGuide: interviewPrepGuideSchema,
});

export type ResearchReport = z.infer<typeof researchReportSchema>;

export const createResearchReport = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  const { searchResults, interviewPrepGuide, companyName } = state;

  if (!searchResults || !interviewPrepGuide || !companyName) {
    throw new Error('Missing required state at CREATE_RESEARCH_REPORT node');
  }

  emitNodeStart(config, {
    node: 'CREATE_RESEARCH_REPORT',
    message: 'Creating research report...',
  });

  const researchReportStream = streamObject({
    model,
    schema: researchReportSchema,
    system: `
      You are a Senior Career Strategist for a specialized talent agency.
      Your goal is to write a confidential "Intelligence Brief" (Dossier) for a candidate.

      *** INPUT DATA ***
      RAW INTEL:
      ${searchResults.join('\n\n')}

      INTERVIEW PREP GUIDE (Already Generated):
      ${JSON.stringify(interviewPrepGuide)}

      *** INSTRUCTIONS ***
      1. TONE: Confidential, direct, and "Insider". Avoid corporate fluff.
         - Bad: "Stripe values transparency."
         - Good: "Stripe is culturally intense. Expect 'Radical Candor' where feedback is blunt and public."

      2. COMPANY HEALTH: Look for layoffs, stock performance, or hiring freezes in the raw intel. 
         - If they had layoffs recently, mark as "Risky".
         - If they raised funding, mark as "Stable/Growing".

      3. ENGINEERING CULTURE: Look for details on *how* they work.
         - Remote policy? On-call load? CI/CD practices?

      4. INTEGRATION:
         - The "technical_playbook" field should closely match the provided Technical Curriculum input.
    `,
    prompt: `Generate the final report for ${companyName}.`,
  });

  for await (const partial of researchReportStream.partialObjectStream) {
    emitResearchReportPartial(config, {
      node: 'CREATE_RESEARCH_REPORT',
      researchReport: partial,
    });
  }

  const researchReport = await researchReportStream.object;

  emitResearchReportCreated(config, {
    node: 'CREATE_RESEARCH_REPORT',
    message: 'Research report created successfully',
    researchReport,
  });

  return { researchReport };
};
