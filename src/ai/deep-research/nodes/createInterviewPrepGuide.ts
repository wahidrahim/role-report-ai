import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { z } from 'zod';

import { model } from '@/ai/config';
import { emitNodeEnd, emitNodeStart } from '@/ai/deep-research/events';
import type { DeepResearchState } from '@/ai/deep-research/state';

export const interviewPrepGuideSchema = z.object({
  interviewFormat: z.object({
    style: z.enum([
      'LeetCode/DSA',
      'Practical/Take-home',
      'System Design',
      'Behavioral',
      'Unknown',
    ]),
    description: z
      .string()
      .describe('Specific details found in research (e.g. "They use HackerRank for the screen").'),
    evidence: z
      .string()
      .describe('Quote the specific Reddit/Glassdoor text that supports this prediction.'),
  }),

  skillGapCrashCourses: z.array(
    z.object({
      topic: z.string(),
      companyContext: z
        .string()
        .describe(
          'FACTUAL usage of this tech at the company. Must cite specific tools/versions found in research (e.g. "They use Redis with Sentinel"). If no data found, write "General Industry Standard".',
        ),
      studyTip: z.string().describe('Specific concept to learn.'),
    }),
  ),

  strategicQuestions: z
    .array(
      z.object({
        question: z.string(),
        context: z
          .string()
          .describe(
            'Why this question matters (e.g. "Referencing their recent migration to Rust").',
          ),
      }),
    )
    .max(3),
});

export type InterviewPrepGuide = z.infer<typeof interviewPrepGuideSchema>;

export const createInterviewPrepGuide = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  const { searchResults, skillAssessment, suitabilityAssessment, companyName, jobTitle } = state;

  if (!searchResults || !skillAssessment || !suitabilityAssessment || !companyName || !jobTitle) {
    throw new Error('Missing required state at CREATE_INTERVIEW_PREP_GUIDE node');
  }

  emitNodeStart(config, {
    node: 'CREATE_INTERVIEW_PREP_GUIDE',
    message: 'Creating interview prep guide...',
  });

  const skillGaps = skillAssessment.skills
    .filter((skill) => skill.status === 'missing')
    .map((skill) => `${skill.skillName} ${skill.importance}`)
    .join(', ');

  const { object } = await generateObject({
    model,
    schema: interviewPrepGuideSchema,
    system: `
      You are a **Forensic Technical Interview Strategist**.
      Your goal is to build a "Gap-Bridging" study plan that helps a specific candidate pass an interview at ${companyName}.

      OUTPUT (STRICT):
      - Return VALID JSON that matches the provided schema exactly.
      - interviewFormat.style MUST be exactly one of:
        "LeetCode/DSA" | "Practical/Take-home" | "System Design" | "Behavioral" | "Unknown"
      - Do not add extra keys.

      *** THE CANDIDATE PROFILE (PHASE 1) ***
      - Target Role: ${jobTitle}
      - Baseline Fit: ${suitabilityAssessment.suitabilityReasoning}
      - SKILL GAPS: ${skillGaps || 'None detected (Focus on Advanced Topics)'}

      *** THE COMPANY INTELLIGENCE (PHASE 2) ***
      ${searchResults.join('\n\n').slice(0, 25000)}

      *** GENERATION PROTOCOL (STRICT) ***
      
      1. PREDICT INTERVIEW FORMAT (Evidence-Based):
        - Scan the Research Data for keywords: "LeetCode", "HackerRank", "Take-home", "System Design", "Behavioral".
        - If text says "we value practical coding," predict "Practical/Take-home".
        - If text says "standard loops," predict "LeetCode/DSA".
        - **CONSTRAINT:** You must cite the specific source (e.g. "Based on Reddit thread from 2024").

      2. GENERATE GAP CRASH COURSES (Personalized):
        - Iterate through the **CRITICAL SKILL GAPS** listed above.
        - For each gap, search the **Research Data** to find how ${companyName} specifically uses that technology.
        - **IF FOUND:** Explain the specific implementation (e.g. "You lack GraphQL. ${companyName} uses Apollo Federation v2. Study 'Subgraphs'.").
        - **IF NOT FOUND:** Provide the "High-Scale Industry Standard" for a company of this size, but explicitly state "Specific stack details not found in public search."
        - **BAN:** Do not write generic definitions (e.g. "GraphQL is a query language"). The candidate knows Google exists. Give them *strategy*.

      3. STRATEGIC "SILVER BULLET" QUESTION:
        - Find a specific engineering challenge, migration, or outage mentioned in the Research Data.
        - Formulate a question that proves the candidate did their homework.
        - Example: "I read about your migration to Rust for the payment gateway. Did you encounter issues with crate maturity?"
    `,
    prompt: `Generate the interview prep guide for ${jobTitle} at ${companyName}.`,
    abortSignal: config.signal,
  });

  emitNodeEnd(config, {
    node: 'CREATE_INTERVIEW_PREP_GUIDE',
    message: 'Interview prep guide created successfully',
    data: {
      interviewPrepGuide: object,
    },
  });

  return { interviewPrepGuide: object };
};
