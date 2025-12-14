import { NextRequest, NextResponse } from 'next/server';

import { analyzeFitWorkflow } from '@/agents/workflows/analyzeFit.workflow';

export async function POST(request: NextRequest) {
  const { resumeText, jobDescriptionText } = await request.json();

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  // Pass the request's abort signal to stop generation when client disconnects
  const stream = analyzeFitWorkflow(resumeText, jobDescriptionText, request.signal);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
