import { NextRequest, NextResponse } from 'next/server';

import { analyzeFitGraph } from '@/ai/analyze-fit/workflow';

const encoder = new TextEncoder();

const sendDataFn =
  (controller: ReadableStreamDefaultController) => (type: string, data: unknown) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
  };

export async function POST(request: NextRequest) {
  const { resumeText, jobDescriptionText } = await request.json();

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  const abortSignal = request.signal;
  const stream = new ReadableStream({
    start: async (controller) => {
      try {
        if (abortSignal.aborted) {
          controller.close();
          return;
        }

        const sendData = sendDataFn(controller);

        const graphStream = await analyzeFitGraph.stream(
          { resumeText, jobDescriptionText },
          { streamMode: 'custom', signal: abortSignal },
        );

        for await (const chunk of graphStream) {
          if (abortSignal.aborted) {
            break;
          }
          sendData(chunk.event as string, (chunk as { data: unknown }).data);
        }

        if (!abortSignal.aborted) {
          sendData('done', null);
        }

        controller.close();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Analysis aborted by client');
          controller.close();
          return;
        }

        console.error('Error in analyze fit:', error);
        sendDataFn(controller)(
          'error',
          error instanceof Error ? error.message : 'Failed to generate analysis',
        );
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
