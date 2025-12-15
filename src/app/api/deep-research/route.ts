import { UIMessage } from 'ai';
import { NextResponse } from 'next/server';

import { deepResearchWorkflow } from '@/ai/deep-research/workflow';
import { isFeatureEnabled } from '@/core/featureFlags';

export type DeepResearchUIMessage = UIMessage<
  never,
  {
    nodeStart: {
      nodeName: string;
      message: string;
      data?: Record<string, unknown>;
    };
    nodeEnd: {
      nodeName: string;
      message: string;
      data?: Record<string, unknown>;
    };
  }
>;

export async function POST(request: Request) {
  if (!isFeatureEnabled('deepResearch')) {
    return NextResponse.json(
      { error: 'Deep Research is disabled in this environment.' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { resumeText, jobDescriptionText, skillAssessment, suitabilityAssessment } = body;

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
        const state = await deepResearchWorkflow.stream(
          { jobDescription: jobDescriptionText, skillAssessment, suitabilityAssessment },
          { streamMode: 'custom', signal: abortSignal },
        );

        for await (const chunk of state) {
          // Check if aborted during iteration
          if (abortSignal.aborted) {
            break;
          }
          emit(chunk.event, chunk.data);
        }

        controller.close();
      } catch (error) {
        // Handle abort errors gracefully
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Deep research aborted by client');
          controller.close();
          return;
        }

        console.error('Error in deep research:', error);
        controller.close();
      }
    },
    cancel() {
      // This is called when the client disconnects
      console.log('Deep research stream cancelled by client');
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
