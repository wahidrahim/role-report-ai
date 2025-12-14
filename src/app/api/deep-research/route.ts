import { Annotation, END, LangGraphRunnableConfig, START, StateGraph } from '@langchain/langgraph';
import { UIMessage, generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { model } from '@/agents/config';
import { extractCompanyNameAndJobTitlePrompt } from '@/agents/prompts/extractCompanyNameAndJobTitle.prompt';
import { deepResearchPlanPrompt } from '@/agents/prompts/planDeepResearch.prompt';
import { extractCompanyNameAndJobTitleSchema } from '@/agents/schemas/extractCompanyNameAndJobTitle.schema';
import { DeepResearchPlanSchema } from '@/agents/schemas/planDeepResearch.schema';
import { deepResearchWorkflow } from '@/agents/workflows/deepResearch.workflow';

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
  const body = await request.json();
  const { resumeText, jobDescriptionText, skillAssessment, suitabilityAssessment } = body;

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  console.log({
    messages: body.messages,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      const emit = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(
            `id: ${crypto.randomUUID()}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
          ),
        );
      };

      const state = await deepResearchWorkflow.stream(
        { jobDescription: jobDescriptionText, skillAssessment, suitabilityAssessment },
        { streamMode: 'custom' },
      );

      for await (const chunk of state) {
        emit(chunk.event, chunk.data);
      }

      controller.close();
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
