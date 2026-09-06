import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { NextResponse } from 'next/server';

import type { AnalysisUIMessage } from '@/ai/analyze-fit/events';
import { analyzeFitGraph } from '@/ai/analyze-fit/workflow';

export async function POST(request: Request) {
  const body = await request.json();
  const { resumeText, jobDescriptionText } = body;

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  const stream = createUIMessageStream<AnalysisUIMessage>({
    execute: async ({ writer }) => {
      const frames = await analyzeFitGraph.stream(
        { resumeText, jobDescriptionText },
        { streamMode: 'custom', signal: request.signal },
      );

      for await (const frame of frames) writer.write(frame);
    },
    onError: (error) => {
      // A client disconnect aborts the run mid-flight, which is not worth logging as a failure.
      const isAbort = error instanceof Error && error.name === 'AbortError';

      if (!isAbort) console.error('Error in analyze fit:', error);

      return error instanceof Error ? error.message : 'Failed to generate analysis';
    },
  });

  return createUIMessageStreamResponse({ stream });
}
