import { NextResponse } from 'next/server';

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

  const abortSignal = request.signal;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      // Check if already aborted before starting
      if (abortSignal.aborted) {
        controller.close();
        return;
      }

      const emit = (event: string, data: unknown) => {
        // Don't emit if aborted
        if (abortSignal.aborted) {
          return;
        }
        controller.enqueue(
          encoder.encode(
            `id: ${crypto.randomUUID()}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
          ),
        );
      };

      try {
        const graphStream = await analyzeFitGraph.stream(
          { resumeText, jobDescriptionText },
          { streamMode: 'custom', signal: abortSignal },
        );

        for await (const chunk of graphStream) {
          // Check if aborted during iteration
          if (abortSignal.aborted) {
            break;
          }
          emit(chunk.event, chunk.data);
        }

        controller.close();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Analysis aborted by client');
          controller.close();
          return;
        }

        console.error('Error in analyze fit:', error);
        emit('ERROR', {
          message: error instanceof Error ? error.message : 'Failed to generate analysis',
        });
        controller.close();
      }
    },
    cancel() {
      console.log('Analysis stream cancelled by client');
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
