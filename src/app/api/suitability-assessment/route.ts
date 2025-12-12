import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

export const SuitabilityAssessmentSchema = z.object({
  suitabilityScore: z.number().min(0).max(100),
  suitabilityReasoning: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescriptionText, chartData, categorizedSkills } = body;

    if (!resumeText || !jobDescriptionText) {
      return NextResponse.json(
        { error: 'Both resume text and job description text are required' },
        { status: 400 },
      );
    }

    return streamObject({
      // model: ollama('qwen3-coder:30b'),
      model: 'openai/gpt-4o',
      schema: SuitabilityAssessmentSchema,
      system: `
        You are assessing a candidate's suitability for a certain role, based on the candidate's resume and the job description.

        You will be provided:
        - The candidate's resume
        - The job description
        - A radar chart data which indicates the most important skills for the role, the level of proficiency required for the role, and the level of proficiency the candidate has for each skill.
        - A categorized list of skills which indicates the relevant skills the candidate has, any skills that are potentially transferable for the role, and any missing skills of the client for the role.

        You should use ALL the provided data to make an informed assessment of the candidate's suitability for the role.

        You should provide a suitability score between 0 and 100 (\`suitabilityScore\`) and a reasoning for the score (\`suitabilityReasoning\`).

        You can consider the following scale as a guide:
        -   100: Perfect Fit
        - >= 90: Very Good Fit
        - >= 80: Good Fit
        - >= 70: Average Fit
        - >= 60: Below Average Fit
        - >= 50: Poor Fit
        - >= 40: Very Poor Fit
        - >= 30: Terrible Fit
        -  < 30: Absolutely Terrible Fit
      `,
      prompt: `
        RESUME TEXT:
        ${resumeText}

        JOB DESCRIPTION TEXT:
        ${jobDescriptionText}

        SKILLS RADAR CHART DATA (JSON format):
        ${chartData ? JSON.stringify(chartData) : 'Not provided'}

        CATEGORIZED SKILLS (JSON format):
        ${categorizedSkills ? JSON.stringify(categorizedSkills) : 'Not provided'}
      `,
    }).toTextStreamResponse();
  } catch (error) {
    console.error('Error in suitability assessment:', error);
    return NextResponse.json({ error: 'Failed to assess suitability' }, { status: 500 });
  }
}
