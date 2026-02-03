import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisCreated, emitAnalysisPartial } from '@/ai/analyze-fit/events';
import { models } from '@/ai/config';

const skillImportanceSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;

    const normalized = value.trim().toLowerCase().replace(/_/g, '-');

    // Coerce common variants the model may emit into the supported enum values.
    // We intentionally default unknown strings to "nice-to-have" to avoid hard-failing the workflow.
    if (
      normalized === 'critical' ||
      normalized === 'required' ||
      normalized === 'must-have' ||
      normalized === 'must have' ||
      normalized === 'mandatory'
    ) {
      return 'critical';
    }

    if (
      normalized === 'nice-to-have' ||
      normalized === 'nice to have' ||
      normalized === 'preferred' ||
      normalized === 'strongly-preferred' ||
      normalized === 'strongly preferred' ||
      normalized === 'bonus' ||
      normalized === 'plus'
    ) {
      return 'nice-to-have';
    }

    return 'nice-to-have';
  },
  z.enum(['critical', 'nice-to-have']),
);

export const skillAssessmentSchema = z.object({
  skills: z.array(
    z.object({
      status: z.enum(['verified', 'transferable', 'missing']),
      skillName: z.string(),
      importance: skillImportanceSchema,
      reasoning: z.string(),
    }),
  ),
});

export type SkillAssessment = z.infer<typeof skillAssessmentSchema>;

type AssessSkillsState = {
  resumeText: string;
  jobDescriptionText: string;
};

export const assessSkills = async (state: AssessSkillsState, config: LangGraphRunnableConfig) => {
  const { resumeText, jobDescriptionText } = state;

  const skillAssessmentStream = streamObject({
    model: models.balanced,
    schema: skillAssessmentSchema,
    abortSignal: config.signal,
    system: `
      You are a SKILLS ASSESSMENT SPECIALIST. Analyze the candidate's fit for a role based solely on evidence from the resume and job description.

      OUTPUT FORMAT: Return a JSON object with a single field \`skills\`, which is a flat array of skill objects. Each skill appears exactly once with its assessed status.

      SKILL OBJECT FIELDS:
      - status: "verified" | "transferable" | "missing"
      - skillName: Normalized technology name (e.g., "React" not "React.js", "PostgreSQL" not "Postgres")
      - importance: "critical" | "nice-to-have" (MUST be exactly one of these two strings)
      - reasoning: Brief evidence-based justification

      STATUS DEFINITIONS:
      - verified: Technology explicitly required AND directly evidenced with hands-on experience
      - transferable: Candidate has a comparable alternative technology (e.g., Vue.js for React requirement)
      - missing: Technology required but not evidenced in resume

      IMPORTANCE:
      - critical: Marked as "required" or "must have" in job description
      - nice-to-have: Marked as "preferred", "plus", or "bonus"

      RULES:
      - EXTRACT ALL RELEVANT HARD SKILLS AND TECHNOLOGIES. Do not limit yourself to just a few. 
      - Aim to identify at least 5-10 distinct skills if the job description mentions them.
      - Only include CONCRETE TECHNOLOGIES (React, Docker, AWS, PostgreSQL, Kubernetes)
      - Exclude vague concepts (async programming, version control, agile, soft skills)
      - Each skill must have exactly ONE status
      - Never output values like "strongly preferred" for importance. Use only "critical" or "nice-to-have".
      - Provide specific evidence in reasoning
    `,
    prompt: `
      Analyze the job description against the candidate's resume. For each specific technology mentioned in the job description, output a skill object with its status and importance, wrapped in a JSON object under the key \`skills\`.
      
      BE COMPREHENSIVE. List every single technology found in the job description and assess it.

      RESUME TEXT:
      ${resumeText}

      JOB DESCRIPTION TEXT:
      ${jobDescriptionText}
    `,
  });

  for await (const partial of skillAssessmentStream.partialObjectStream) {
    emitAnalysisPartial(config, { node: 'ASSESS_SKILLS', type: 'skillAssessment', data: partial });
  }

  const skillAssessment = await skillAssessmentStream.object;

  emitAnalysisCreated(config, {
    node: 'ASSESS_SKILLS',
    type: 'skillAssessment',
    message: 'Skill assessment created successfully',
    data: skillAssessment,
  });
  return { skillAssessment };
};
