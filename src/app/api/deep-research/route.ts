import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { model } from '@/agents/config';

export async function POST(request: Request) {
  const { jobDescriptionText } = await request.json();

  const stateAnnotation = Annotation.Root({
    jobDescription: Annotation<string>,
    companyName: Annotation<string | null>,
    jobTitle: Annotation<string | null>,
  });

  const extractCompanyNameAndJobTitle = async (state: typeof stateAnnotation.State) => {
    console.log('[NODE] extracting company name and job title');

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
      return {
        companyName: null,
        jobTitle: null,
      };
    }

    console.log('[NODE] extracted company name and job title', {
      companyName: object.companyName,
      jobTitle: object.jobTitle,
    });
    return {
      companyName: object.companyName,
      jobTitle: object.jobTitle,
    };
  };

  const shouldProceedWithDeepResearch = async (state: typeof stateAnnotation.State) => {
    console.log('[NODE] determining if we should proceed with deep research');

    const { companyName, jobTitle } = state;
    const isValidCompanyName = typeof companyName === 'string' && companyName.length > 0;
    const isValidJobTitle = typeof jobTitle === 'string' && jobTitle.length > 0;
    const shouldProceed = isValidCompanyName && isValidJobTitle;

    console.log('[NODE] should proceed with deep research', { shouldProceed });
    return shouldProceed ? 'YES' : 'NO';
  };

  const planDeepResearch = async (state: typeof stateAnnotation.State) => {
    console.log('[NODE] planning deep research');
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

  const state = await workflow.invoke({ jobDescription: jobDescriptionText });

  return NextResponse.json(state);

  // const companyNameAndJobTitle = await generateObject({
  //   model,
  //   schema: z.object({
  //     companyName: z.string(),
  //     jobTitle: z.string(),
  //   }),
  //   system: `
  //     You are a company name and job title generator.

  //     You will be given a job description.

  //     You need to generate a company name and a job title that are relevant to the job description.

  //     INSTRUCTIONS:
  //     - company name should be the full name of the company
  //     - job title should be the full title of the role, avoid generalizations
  //   `,
  //   prompt: `
  //     Figure out the company name and job title from the following job description:

  //     JOB DESCRIPTION:
  //     ${jobDescriptionText}
  //   `,
  // });

  // const searchQueries = await generateObject({
  //   model,
  //   schema: z.object({
  //     queries: z
  //       .array(
  //         z.object({
  //           query: z.string(),
  //           category: z.enum(['news', 'culture', 'interview', 'tech']),
  //           reasoning: z.string(),
  //         }),
  //       )
  //       .min(12)
  //       .max(12),
  //   }),
  //   system: `
  //     You are the Lead Investigator. Your goal is to generate 3 targeted search queries to uncover deep intel about {companyName} for the role of {jobTitle}.

  //     GUIDELINES:
  //     - you must produce queries for each category: news, culture, interview, tech
  //     - come up with up to 3 queries for each category
  //     - keep your reasoning concise and to the point
  //   `,
  //   prompt: `
  //     COMPANY NAME:
  //     ${companyNameAndJobTitle.object.companyName}

  //     JOB TITLE:
  //     ${companyNameAndJobTitle.object.jobTitle}
  //   `,
  // });

  // const searchResults = await Promise.all(
  //   searchQueries.object.queries.map(async (query) => {
  //     const results = await tavilyClient.search(query.query, {
  //       maxResults: 5,
  //       searchType: 'advanced',
  //     });

  //     return {
  //       query: query.query,
  //       results: results.results.map((result) => result.content),
  //     };
  //   }),
  // );

  // ------------------------------------------------------------

  // const StateAnnotation = Annotation.Root({
  //   topic: Annotation<string>,
  //   joke: Annotation<string>,
  //   improvedJoke: Annotation<string>,
  //   finalJoke: Annotation<string>,
  // });

  // const stream = createUIMessageStream({
  //   execute: async ({ writer }) => {
  //     const makeJokeNode = async (
  //       state: typeof StateAnnotation.State,
  //       config: LangGraphRunnableConfig,
  //     ) => {
  //       const jokeStream = streamObject({
  //         model,
  //         schema: z.object({
  //           joke: z.string(),
  //         }),
  //         prompt: `Write a short joke about ${state.topic}`,
  //       });

  //       for await (const chunk of jokeStream.partialObjectStream) {
  //         config.writer?.({ joke: chunk.joke });
  //       }

  //       const { joke } = await jokeStream.object;

  //       config.writer?.({ joke });

  //       return { joke };
  //     };

  //     const checkPunchline = (state: typeof StateAnnotation.State) => {
  //       if (state.joke?.includes('?') || state.joke?.includes('!')) {
  //         return 'Pass';
  //       }
  //       return 'Fail';
  //     };

  //     const improveJokeNode = async (
  //       state: typeof StateAnnotation.State,
  //       config: LangGraphRunnableConfig,
  //     ) => {
  //       const improvedJokeStream = streamObject({
  //         model,
  //         schema: z.object({
  //           improvedJoke: z.string(),
  //         }),
  //         prompt: `Improve the joke: ${state.joke}`,
  //       });

  //       for await (const chunk of improvedJokeStream.partialObjectStream) {
  //         config.writer?.({
  //           improvedJoke: chunk.improvedJoke,
  //         });
  //       }

  //       const { improvedJoke } = await improvedJokeStream.object;

  //       config.writer?.({
  //         improvedJoke,
  //       });

  //       return { improvedJoke };
  //     };

  //     const polishJokeNode = async (
  //       state: typeof StateAnnotation.State,
  //       config: LangGraphRunnableConfig,
  //     ) => {
  //       const finalJokeStream = streamObject({
  //         model,
  //         schema: z.object({
  //           finalJoke: z.string(),
  //         }),
  //         prompt: `Add a surprise twist to this joke: ${state.improvedJoke}`,
  //       });

  //       for await (const chunk of finalJokeStream.partialObjectStream) {
  //         config.writer?.({
  //           finalJoke: chunk.finalJoke,
  //         });
  //       }

  //       const { finalJoke } = await finalJokeStream.object;

  //       config.writer?.({ finalJoke });

  //       return { finalJoke };
  //     };

  //     const workflow = new StateGraph(StateAnnotation)
  //       .addNode('makeJoke', makeJokeNode)
  //       .addNode('improveJoke', improveJokeNode)
  //       .addNode('polishJoke', polishJokeNode)
  //       .addEdge(START, 'makeJoke')
  //       .addConditionalEdges('makeJoke', checkPunchline, {
  //         Pass: 'improveJoke',
  //         Fail: END,
  //       })
  //       .addEdge('improveJoke', 'polishJoke')
  //       .addEdge('polishJoke', END)
  //       .compile();

  //     const state = await workflow.stream(
  //       {
  //         topic: 'AI',
  //         joke: '',
  //         improvedJoke: '',
  //         finalJoke: '',
  //       },
  //       {
  //         streamMode: 'custom',
  //       },
  //     );

  //     for await (const chunk of state) {
  //       console.log({ chunk });
  //       writer.write({
  //         type: 'data-stream',
  //         data: chunk,
  //       });
  //     }
  //   },
  // });

  // return createUIMessageStreamResponse({ stream });
}
