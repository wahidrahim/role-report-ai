import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider-v2';
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
        You are assessing candidate suitability for this role.
        Use the provided chart data and categorized skills analysis to inform your assessment.
        
        ${chartData ? `Chart Data: ${JSON.stringify(chartData)}` : 'Chart Data: Not provided'}
        ${categorizedSkills ? `Categorized Skills: ${JSON.stringify(categorizedSkills)}` : 'Categorized Skills: Not provided'}

        RESUME TEXT:
        ${resumeText}

        JOB DESCRIPTION TEXT:
        ${jobDescriptionText}
      `,
      prompt: `
        Use the provided chart data and categorized skills analysis to inform your assessment.

        Provide a suitability score between 0 and 100 and a reasoning for the score.

        Where 100 = Perfect Match, 0 = Absolutely terrible fit.
      `,
    }).toTextStreamResponse();
  } catch (error) {
    console.error('Error in suitability assessment:', error);
    return NextResponse.json({ error: 'Failed to assess suitability' }, { status: 500 });
  }
}
