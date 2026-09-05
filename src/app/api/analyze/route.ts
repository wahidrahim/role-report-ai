import { IterableReadableStream } from '@langchain/core/utils/stream';
import { JsonToSseTransformStream } from 'ai';
import { NextResponse } from 'next/server';

import { analyzeFitGraph } from '@/ai/analyze-fit/workflow';

async function* analysisFrames(
  resumeText: string,
  jobDescriptionText: string,
  signal: AbortSignal,
) {
  try {
    yield* await analyzeFitGraph.stream(
      { resumeText, jobDescriptionText },
      { streamMode: 'custom', signal },
    );
  } catch (error) {
    // A client disconnect aborts the run mid-flight, which is not worth logging as a failure.
    if (error instanceof Error && error.name === 'AbortError') return;

    console.error('Error in analyze fit:', error);

    yield { error: error instanceof Error ? error.message : 'Failed to generate analysis' };
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { resumeText, jobDescriptionText } = body;

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  return new Response(
    IterableReadableStream.fromAsyncGenerator(
      analysisFrames(resumeText, jobDescriptionText, request.signal),
    )
      .pipeThrough(new JsonToSseTransformStream())
      .pipeThrough(new TextEncoderStream()),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    },
  );
}
