import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { streamObject } from 'ai';
import { z } from 'zod';

import { emitAnalysisCreated, emitAnalysisPartial } from '@/ai/analyze-fit/events';
import { models } from '@/ai/config';

export const radarChartSchema = z.object({
  data: z.array(
    z.object({
      skillName: z.string().describe('Normalized skill name from job description'),
      requiredLevel: z.number().describe('Proficiency level the job demands (0-100)'),
      candidateLevel: z
        .number()
        .describe("Candidate's proficiency level based on resume evidence (0-100)"),
      reasoning: z.string().describe('Evidence-based justification for both levels'),
    }),
  ),
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
    model: models.balanced,
    schema: radarChartSchema,
    abortSignal: config.signal,
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' },
      },
    },
    system: `
      You are a STRICT HIRING MANAGER for the company described in the job description. Your evaluations must be evidence-based and derived solely from the provided resume and job description. Do not assume external knowledge or add unmentioned details.

      ## Task
      Generate data for a radar chart comparing the candidate's skills to the job's requirements.

      ## Skill Identification
      Extract up to 8 of the MOST IMPORTANT SKILLS from the JOB DESCRIPTION only:
      - Base selection solely on job requirements, not the resume
      - Prioritize core technical, soft, or domain-specific skills central to the role
      - Use concise, standardized names (e.g., "JavaScript" not "JS programming skills")
      - Prefer more skills over fewer when comparably important

      ## Proficiency Scale (0-100)
      Use any integer; interpolate between levels as needed:
      - 0: No awareness or exposure
      - 10: Heard of it, zero hands-on experience
      - 20: Brief exposure, simple tasks with heavy guidance
      - 30: Understands basics, inconsistent execution, needs supervision
      - 40: Grasps principles, handles routines somewhat independently
      - 50: Solid foundations, reliable on standard tasks
      - 60: Deeper understanding, independent on moderate complexity
      - 70: Strong command, solves varied problems efficiently
      - 80: Deep expertise, anticipates issues, excels under pressure
      - 90: Elite, significant innovations, recognized authority
      - 100: Pinnacle mastery, invents methods (rare)

      ## Evaluation Rules
      - **requiredLevel**: Infer from job description language ("expert in X" → 80+, "familiar with Y" → 40-50)
      - **candidateLevel**: Base solely on resume evidence. No evidence = 0. Be conservative.
      - **reasoning**: 2-4 sentences justifying BOTH levels with specific evidence
    `,
    prompt: `
      Analyze the job description and resume below. For each key skill from the job description, evaluate both the required proficiency level and the candidate's demonstrated level.

      <resume>
      ${resumeText}
      </resume>

      <job_description>
      ${jobDescriptionText}
      </job_description>
    `,
  });

  for await (const partial of radarChartStream.partialObjectStream) {
    emitAnalysisPartial(config, { node: 'PLOT_RADAR_CHART', type: 'radarChart', data: partial });
  }

  const radarChart = await radarChartStream.object;
  emitAnalysisCreated(config, {
    node: 'PLOT_RADAR_CHART',
    type: 'radarChart',
    message: 'Radar chart created successfully',
    data: radarChart,
  });
  return { radarChart };
};
