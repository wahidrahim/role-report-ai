import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

import { analysisSchema } from '@/schemas/analysisSchema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    // Validate required fields
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Both resume text and job description are required' },
        { status: 400 },
      );
    }

    const result = await streamObject({
      model: 'openai/gpt-4o-mini',
      schema: analysisSchema,
      system: `
        You are an expert Technical Recruiter and Career Coach. 
        Your goal is to perform a 'Gap Analysis' between the user's resume and a job description.
        
        SCORING RULES (1-10):
        - Job Requirement: 10=Architect/Expert needed, 5=Standard usage, 2=Nice to have.
        - Candidate Score: 10=Deep evidence/leadership, 8=Strong action verbs, 5=Mentioned in skill list, 0=Missing.
        
        RADAR CHART LOGIC:
        - Identify the most critical distinct dimensions (Technology, Soft Skills, Domain). 
        - Determine the optimal number of axes (between 4 and 8) based on the job complexity.
        - Do not list generic terms like "Coding"; use specific stacks like "React Ecosystem" or "Cloud Infra".
      `,
      prompt: `
        RESUME TEXT:
        ${resumeText}
  
        JOB DESCRIPTION:
        ${jobDescription}
      `,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error analyzing fit:', error);
    return NextResponse.json(
      { error: 'Failed to analyze fit. Please try again.' },
      { status: 500 },
    );
  }
}
