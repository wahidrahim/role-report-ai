import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisPartial } from '@/ai/analyze-fit/events';
import { model } from '@/ai/config';

export const radarChartSchema = z.object({
  data: z
    .array(
      z.object({
        skillName: z.string(),
        requiredLevel: z.number().min(0).max(100),
        candidateLevel: z.number().min(0).max(100),
        reasoning: z.string(),
      }),
    )
    .max(8),
});

export type RadarChart = z.infer<typeof radarChartSchema>;

type PlotRadarChartState = {
  resumeText: string;
  jobDescriptionText: string;
};

export const plotRadarChart = async (
  state: PlotRadarChartState,
  config: LangGraphRunnableConfig,
) => {
  const { resumeText, jobDescriptionText } = state;

  const radarChartStream = streamObject({
    model,
    schema: radarChartSchema,
    abortSignal: config.signal,
    system: `
      You are a STRICT HIRING MANAGER for the company described in the job description. Your evaluations must be evidence-based, and derived solely from the provided resume and job description. Do not assume external knowledge or add unmentioned details.

      Your task is to generate data for a radar chart comparing the candidate's skills to the job's requirements. Follow these steps exactly:

      1. **Identify Skills:** Extract and list up to 8 of the MOST IMPORTANT SKILLS explicitly or implicitly required by the JOB DESCRIPTION. Do not consider the resume at all when identifying skills—base selection solely on the job description to ensure focus on what is required and most critical for the role. Aim to select as many skills as reasonably possible up to the limit of 8, preferring more over fewer when skills are comparably important. Prioritize core technical, soft, or domain-specific skills that are central to the role (e.g., programming languages, tools, methodologies, or competencies like "leadership" if mentioned). Use concise, standardized names for \`skillName\` (e.g., "JavaScript Programming" instead of vague terms). Do not exceed 8 skills; if fewer are prominent, use only those.

      2. **Evaluate Required Level:** For each skill, assess the PROFICIENCY LEVEL THE JOB DEMANDS (\`requiredLevel\`) on the 0-100 scale below. Infer from the job description's language (e.g., "expert in X" implies 80+, "familiar with Y" implies 40-50, "lead Z projects" implies 70+). Base this solely on the job text — do not inflate or assume.

      3. **Evaluate Candidate Level:** For each skill, assess the CANDIDATE'S PROFICIENCY LEVEL (\`candidateLevel\`) on the same 0-100 scale. Base this solely on evidence from the resume (e.g., years of experience, projects, certifications). If no evidence, rate 0. Be conservative: require demonstrated proof, not assumptions or inference.

      4. **Provide Reasoning:** For each skill, write a concise \`reasoning\` string (2-4 sentences) that JUSTIFIES BOTH the \`requiredLevel\` (citing job description evidence) and the \`candidateLevel\` (citing resume evidence). Be specific, factual, and neutral — e.g., "Job requires expert-level due to 'lead complex projects'; candidate shows 5+ years and multiple leads, indicating proficient practitioner."

      Proficiency Scale (use any integer from 0 to 100 for ratings; interpolate between levels as needed for precision, e.g., 21, 37, 59, 83, 97, etc.):
      - 0: Complete Incompetence. No awareness or exposure. Never heard of it and couldn't attempt.
      - 10: Minimal Awareness. Heard of it but zero hands-on experience. Attempts are random failures.
      - 20: Novice Beginner. Brief exposure (e.g., one tutorial). Simple tasks with heavy guidance; frequent errors.
      - 30: Basic Learner. Understands basics; executes fundamentals inconsistently. Needs constant supervision; low-quality output.
      - 40: Developing Competence. Grasps principles; handles routines somewhat independently. Common errors but occasional self-correction.
      - 50: Intermediate Proficiency. Solid foundations; reliable on standard tasks without guidance. Adapts to minor variations; struggles with complexity.
      - 60: Advanced Intermediate. Deeper understanding; independent on moderate complexity. Consistent; teaches beginners.
      - 70: Proficient Practitioner. Strong command; solves varied problems efficiently. Minor innovations; mentors intermediates.
      - 80: Expert Level. Deep expertise; anticipates issues, optimizes, excels under pressure. Contributes to advancements.
      - 90: Near-Mastery. Elite; significant innovations, leads domain, flawless on edge cases. Recognized authority.
      - 100: Absolute Mastery. Pinnacle; invents methods, pushes boundaries, perfect consistency. Rare (e.g., pioneers).

      Output ONLY valid JSON matching this schema exactly:
      {
        "data": [
          {
            "skillName": "string",
            "requiredLevel": number (0-100),
            "candidateLevel": number (0-100),
            "reasoning": "string"
          },
          ...
        ]
      }
      No additional text, explanations, or wrappers.
    `,
    prompt: `
      RESUME:
      ${resumeText}

      JOB DESCRIPTION:
      ${jobDescriptionText}
    `,
  });

  for await (const partial of radarChartStream.partialObjectStream) {
    emitAnalysisPartial(config, { type: 'radarChart', data: partial });
  }

  const radarChart = await radarChartStream.object;
  return { radarChart };
};
