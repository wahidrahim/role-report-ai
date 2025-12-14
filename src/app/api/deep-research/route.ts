import { Annotation, END, LangGraphRunnableConfig, START, StateGraph } from '@langchain/langgraph';
import {
  UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
} from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { model } from '@/agents/config';

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
  const { resumeText, jobDescriptionText } = body;

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  console.log({
    messages: body.messages,
  });

  const stateAnnotation = Annotation.Root({
    jobDescription: Annotation<string>,
    companyName: Annotation<string | null>,
    jobTitle: Annotation<string | null>,
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

      // NODE 1: Extract company name and job title
      const extractCompanyNameAndJobTitle = async (
        state: typeof stateAnnotation.State,
        config: LangGraphRunnableConfig,
      ) => {
        console.log('[NODE] extracting company name and job title');
        config.writer?.({
          event: 'NODE_START',
          data: {
            node: 'EXTRACT_COMPANY_NAME_AND_JOB_TITLE',
            message: 'Extracting company name and job title...',
          },
        });

        const { jobDescription } = state;
        const { object } = await generateObject({
          model,
          schema: z.object({
            companyName: z.string(),
            jobTitle: z.string(),
            unableToExtract: z.boolean(),
          }),
          system: `
        You extract the hiring company name and the job title from a job description.

        Your outputs are used downstream for research, so accuracy and specificity matter more than always returning something.

        OUTPUT FIELDS:
        - companyName: the full hiring company name (as written in the posting)
        - jobTitle: the most specific, canonical title for the role
        - unableToExtract: true if either field cannot be determined with high confidence

        EXTRACT FIRST (preferred):
        - If the job description explicitly contains a company name and/or job title, copy them exactly (do not paraphrase).

        COMPANY NAME RULES:
        - Use the hiring company (not a staffing/agency name) when the posting distinguishes them (e.g., "Our client, X" => X).
        - Include suffixes if present (Inc., Ltd., LLC, GmbH, etc.).
        - Do not guess the company from vague hints (e.g., "Fortune 100", "leading fintech").
        - If multiple companies appear and the hiring company is ambiguous, set unableToExtract to true.

        JOB TITLE RULES (be maximally specific and accurate):
        - Use the exact title from the posting when present.
        - If the posting does not state a title but the role is clearly implied, infer a title using only evidence in the text.
        - The title should include seniority/level and specialization when supported (e.g., "Senior Machine Learning Engineer, Recommender Systems", not "Engineer" or "ML Role").
        - Do NOT include company name, location, remote/hybrid, contract type, or compensation in the title.
        - Prefer the primary role if multiple levels/titles are listed (choose the best match for the described responsibilities).

        FAILURE CONDITIONS:
        - If you cannot confidently determine BOTH a companyName and jobTitle, set unableToExtract to true and return empty strings for companyName and jobTitle.
      `,
          prompt: `
        Extract the hiring company name and job title from the job description below.

        JOB DESCRIPTION:
        ${jobDescription}
      `,
        });

        if (object.unableToExtract) {
          console.log('[NODE] unable to extract company name and job title');
          config.writer?.({
            event: 'NODE_END',
            nodeName: 'EXTRACT_COMPANY_NAME_AND_JOB_TITLE',
            message: 'Unable to extract company name and job title',
          });
          return {
            companyName: null,
            jobTitle: null,
          };
        }

        console.log('[NODE] extracted company name and job title', {
          companyName: object.companyName,
          jobTitle: object.jobTitle,
        });
        config.writer?.({
          event: 'NODE_END',
          data: {
            node: 'EXTRACT_COMPANY_NAME_AND_JOB_TITLE',
            message: 'Extracted company name and job title',
            companyName: object.companyName,
            jobTitle: object.jobTitle,
          },
        });

        return {
          companyName: object.companyName,
          jobTitle: object.jobTitle,
        };
      };

      // NODE 2: Determine if we should proceed with deep research
      const shouldProceedWithDeepResearch = async (
        state: typeof stateAnnotation.State,
        config: LangGraphRunnableConfig,
      ) => {
        console.log('[NODE] determining if we should proceed with deep research');
        config.writer?.({
          event: 'NODE_START',
          data: {
            node: 'SHOULD_PROCEED_WITH_DEEP_RESEARCH',
            message: 'Determining if we should proceed with deep research...',
          },
        });

        const { companyName, jobTitle } = state;
        const isValidCompanyName = typeof companyName === 'string' && companyName.length > 0;
        const isValidJobTitle = typeof jobTitle === 'string' && jobTitle.length > 0;
        const shouldProceed = isValidCompanyName && isValidJobTitle;

        console.log('[NODE] should proceed with deep research', { shouldProceed });
        config.writer?.({
          event: 'NODE_END',
          data: {
            node: 'SHOULD_PROCEED_WITH_DEEP_RESEARCH',
            message: shouldProceed
              ? 'Proceeding with deep research'
              : 'Not proceeding with deep research',
          },
        });

        return shouldProceed ? 'YES' : 'NO';
      };

      // NODE 3: Plan deep research
      const planDeepResearch = async (
        state: typeof stateAnnotation.State,
        config: LangGraphRunnableConfig,
      ) => {
        console.log('[NODE] planning deep research');
        config.writer?.({
          event: 'NODE_START',
          data: {
            node: 'PLAN_DEEP_RESEARCH',
            message: 'Planning deep research...',
          },
        });

        const { companyName, jobTitle } = state;
        const { object } = await generateObject({
          model,
          schema: z.object({
            plan: z.array(z.string()),
          }),
          system: `
      You are a deep research planner.

      You will be given a company name and a job title.

      You need to plan a deep research strategy to uncover deep intel about the company and the job title.

      INSTRUCTIONS:
      - you need to plan a deep research strategy to uncover deep intel about the company and the job title.
    `,
          prompt: `
      COMPANY NAME:
      ${companyName}

      JOB TITLE:
      ${jobTitle}
    `,
        });

        console.log('[NODE] planned deep research', { plan: object.plan });
        config.writer?.({
          event: 'NODE_END',
          data: {
            node: 'PLAN_DEEP_RESEARCH',
            message: 'Planned deep research',
            plan: object.plan,
          },
        });

        return {
          plan: object.plan,
        };
      };

      const workflow = new StateGraph(stateAnnotation)
        .addNode('extractCompanyNameAndJobTitle', extractCompanyNameAndJobTitle)
        .addNode('planDeepResearch', planDeepResearch)
        .addEdge(START, 'extractCompanyNameAndJobTitle')
        .addConditionalEdges('extractCompanyNameAndJobTitle', shouldProceedWithDeepResearch, {
          YES: 'planDeepResearch',
          NO: END,
        })
        .addEdge('planDeepResearch', END)
        .compile();

      const state = await workflow.stream(
        { jobDescription: jobDescriptionText },
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
