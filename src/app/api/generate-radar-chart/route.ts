import { NextRequest, NextResponse } from 'next/server';

import { generateRadarChartData } from '@/features/radar-chart/agent';

export async function POST(request: NextRequest) {
  const { resumeText, jobDescriptionText } = await request.json();

  console.log({ resumeText, jobDescriptionText });

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  const result = await generateRadarChartData(resumeText, jobDescriptionText);

  return result.toTextStreamResponse();
}
