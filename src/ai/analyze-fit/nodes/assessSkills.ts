import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisPartial } from '@/ai/analyze-fit/events';
import { model } from '@/ai/config';

export const skillAssessmentSchema = z.object({
  skills: z.array(
    z.object({
      skillName: z.string(),
      status: z.enum(['verified', 'transferable', 'missing']),
      importance: z.enum(['critical', 'nice-to-have']),
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
    model,
    schema: skillAssessmentSchema,
    abortSignal: config.signal,
    system: `
      You are a SKILLS ASSESSMENT SPECIALIST. Analyze the candidate's fit for a role based solely on evidence from the resume and job description.

      OUTPUT FORMAT: Return a JSON object with a single field \`skills\`, which is a flat array of skill objects. Each skill appears exactly once with its assessed status.

      SKILL OBJECT FIELDS:
      - skillName: Normalized technology name (e.g., "React" not "React.js", "PostgreSQL" not "Postgres")
      - status: "verified" | "transferable" | "missing"
      - importance: "critical" | "nice-to-have"
      - reasoning: Brief evidence-based justification

      STATUS DEFINITIONS:
      - verified: Technology explicitly required AND directly evidenced with hands-on experience
      - transferable: Candidate has a comparable alternative technology (e.g., Vue.js for React requirement)
      - missing: Technology required but not evidenced in resume

      IMPORTANCE:
      - critical: Marked as "required" or "must have" in job description
      - nice-to-have: Marked as "preferred", "plus", or "bonus"

      RULES:
      - Only include CONCRETE TECHNOLOGIES (React, Docker, AWS, PostgreSQL, Kubernetes)
      - Exclude vague concepts (async programming, version control, agile, soft skills)
      - Each skill must have exactly ONE status
      - Provide specific evidence in reasoning
    `,
    prompt: `
      Analyze the job description against the candidate's resume. For each specific technology mentioned in the job description, output a skill object with its status and importance, wrapped in a JSON object under the key \`skills\`.

      RESUME TEXT:
      ${resumeText}

      JOB DESCRIPTION TEXT:
      ${jobDescriptionText}
    `,
  });

  for await (const partial of skillAssessmentStream.partialObjectStream) {
    emitAnalysisPartial(config, { type: 'skillAssessment', data: partial });
  }

  const skillAssessment = await skillAssessmentStream.object;
  return { skillAssessment };
};
