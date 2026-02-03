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
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' },
      },
    },
    system: `
      You are a SKILLS ASSESSMENT SPECIALIST. Analyze the candidate's fit for a role based solely on evidence from the resume and job description.

      OUTPUT FORMAT: Return a JSON object with a single field \`skills\`. Each skill object corresponds to a skill FROM THE JOB DESCRIPTION. The skillName must be the JD's terminology. Do NOT include candidate skills that aren't required by the job.

      SKILL OBJECT FIELDS:
      - status: "verified" | "transferable" | "missing"
      - skillName: Normalized technology name (e.g., "React" not "React.js", "PostgreSQL" not "Postgres")
      - importance: "critical" | "nice-to-have" (MUST be exactly one of these two strings)
      - reasoning: Brief evidence-based justification

      STATUS DEFINITIONS (all JD-anchored — skillName is always the JD skill):
      - verified: JD skill that the candidate directly possesses with hands-on experience
      - transferable: JD skill the candidate lacks, BUT has a comparable alternative (state the alternative in reasoning)
      - missing: JD skill the candidate lacks with no comparable alternative

      TRANSFERABILITY GUIDELINES:
      A skill is "transferable" ONLY when the candidate has a directly comparable alternative:

      Valid transfers (same category):
      - Vue.js → React (frontend frameworks)
      - PostgreSQL → MySQL (relational databases)
      - AWS → GCP (cloud platforms)
      - Python → Ruby (backend scripting languages)

      NOT transferable:
      - "General programming" for specific framework
      - Backend experience for frontend requirement
      - SQL for NoSQL (different paradigms)
      - Mobile for web development

      When marking "transferable", state the equivalent skill in reasoning.

      IMPORTANCE:
      - critical: Marked as "required" or "must have" in job description
      - nice-to-have: Marked as "preferred", "plus", or "bonus"

      SOFT SKILLS (include only if job description explicitly mentions them):
      If JD mentions soft skills, include up to 3:
      - Leadership / Team Management
      - Communication / Presentation
      - Collaboration / Cross-functional work
      - Mentoring / Coaching
      - Project Management

      For soft skills:
      - "verified": concrete resume evidence (led team of X, presented to stakeholders)
      - "missing": required but no evidence
      - Importance follows same rules as technical skills

      EXPERIENCE LEVEL CONTEXT:
      Adjust "verified" threshold based on job seniority:
      - Senior roles: Expect deeper expertise, leadership evidence
      - Mid-level roles: Solid hands-on experience sufficient
      - Junior roles: Exposure and learning potential matter more

      RULES:
      - CRITICAL: ONLY output skills from the JOB DESCRIPTION. The skillName must match JD terminology. Never include candidate skills that the JD doesn't require.
      - Extract all relevant hard skills and technologies FROM THE JOB DESCRIPTION. Aim to identify at least 5-10 distinct skills if the job description mentions them.
      - Only include CONCRETE TECHNOLOGIES (React, Docker, AWS, PostgreSQL, Kubernetes)
      - Exclude vague concepts (async programming, version control, agile)
      - Each skill must have exactly ONE status
      - Never output values like "strongly preferred" for importance. Use only "critical" or "nice-to-have".
      - Provide specific evidence in reasoning
    `,
    prompt: `
      Analyze the job description against the candidate's resume. For each specific technology mentioned in the job description, output a skill object with its status and importance, wrapped in a JSON object under the key \`skills\`.

      BE COMPREHENSIVE. List every single technology found in the job description and assess it.

      EXAMPLE (JD-anchored output):
      Job requires: React, TypeScript, Node.js, PostgreSQL, Leadership
      Candidate has: Vue.js, JavaScript, Express, MongoDB, "Led team of 5"

      Output (skillName = JD skill, NOT candidate skill):
      - skillName: "React", status: transferable, reasoning: "Candidate has Vue.js, a comparable frontend framework"
      - skillName: "TypeScript", status: missing, reasoning: "Only JavaScript shown, no TypeScript evidence"
      - skillName: "Node.js", status: verified, reasoning: "Express.js experience demonstrates Node.js proficiency"
      - skillName: "PostgreSQL", status: missing, reasoning: "MongoDB experience shown, but different paradigm (NoSQL vs SQL)"
      - skillName: "Leadership", status: verified, reasoning: "Led team of 5 engineers"

      WRONG (never do this):
      - skillName: "Vue.js", status: verified <- WRONG! Vue.js isn't in the JD
      - skillName: "MongoDB", status: verified <- WRONG! MongoDB isn't in the JD

      <resume>
      ${resumeText}
      </resume>

      <job-description>
      ${jobDescriptionText}
      </job-description>
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
