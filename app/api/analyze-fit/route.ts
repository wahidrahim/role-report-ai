import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

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

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      prompt: `Analyze how well this resume fits the job description. Provide a comprehensive analysis including:

1. Fit Score (0-100)
2. Key Strengths - specific skills and experiences that match
3. Weaknesses/Gaps - areas where the resume doesn't align with the job requirements
4. Recommendations - actionable suggestions to improve the resume for this role

Resume:
${resumeText}

Job Description:
${jobDescription}

Please format your response in a clear, structured way.`,
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
