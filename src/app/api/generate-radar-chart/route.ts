import { NextRequest, NextResponse } from 'next/server';

import { generateRadarChart } from '@/features/radar-chart/generateRadarChart';

export async function POST(request: NextRequest) {
  const { resumeText, jobDescriptionText } = await request.json();

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  try {
    return generateRadarChart({ resumeText, jobDescriptionText }).toTextStreamResponse();
  } catch (error) {
    console.error('Error in radar chart generation:', error);
    return NextResponse.json({ error: 'Failed to generate radar chart analysis' }, { status: 500 });
  }
}
