import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { tavily } from '@tavily/core';
import { generateObject, generateText, streamObject, streamText } from 'ai';
import { NextResponse } from 'next/server';
import { check, z } from 'zod';

import { model } from '@/agents/config';

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export async function POST(request: Request) {
  const { resumeText, jobDescriptionText } = await request.json();

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

  const encoder = new TextEncoder();
  const StateAnnotation = Annotation.Root({
    topic: Annotation<string>,
    joke: Annotation<string>,
    improvedJoke: Annotation<string>,
    finalJoke: Annotation<string>,
  });

  const stream = new ReadableStream({
    start: async (controller) => {
      const makeJokeNode = async (state: typeof StateAnnotation.State) => {
        const jokeStream = streamObject({
          model,
          schema: z.object({
            joke: z.string(),
          }),
          prompt: `Write a short joke about ${state.topic}`,
        });

        for await (const chunk of jokeStream.partialObjectStream) {
          // controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          const updatedState = {
            ...state,
            joke: state.joke + chunk.joke,
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedState)}\n\n`));
        }

        const { joke } = await jokeStream.object;

        return { joke };
      };

      const checkPunchline = (state: typeof StateAnnotation.State) => {
        if (state.joke?.includes('?') || state.joke?.includes('!')) {
          return 'Pass';
        }
        return 'Fail';
      };

      const improveJokeNode = async (state: typeof StateAnnotation.State) => {
        const improvedJokeStream = streamObject({
          model,
          schema: z.object({
            improvedJoke: z.string(),
          }),
          prompt: `Improve the joke: ${state.joke}`,
        });

        for await (const chunk of improvedJokeStream.partialObjectStream) {
          const updatedState = {
            ...state,
            improvedJoke: state.improvedJoke + chunk.improvedJoke,
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedState)}\n\n`));
        }

        const { improvedJoke } = await improvedJokeStream.object;

        return { improvedJoke };
      };

      const polishJokeNode = async (state: typeof StateAnnotation.State) => {
        const finalJokeStream = streamObject({
          model,
          schema: z.object({
            finalJoke: z.string(),
          }),
          prompt: `Add a surprise twist to this joke: ${state.improvedJoke}`,
        });

        for await (const chunk of finalJokeStream.partialObjectStream) {
          const updatedState = {
            ...state,
            finalJoke: state.finalJoke + chunk.finalJoke,
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedState)}\n\n`));
        }

        const { finalJoke } = await finalJokeStream.object;

        return { finalJoke };
      };

      const workflow = new StateGraph(StateAnnotation)
        .addNode('makeJoke', makeJokeNode)
        .addNode('improveJoke', improveJokeNode)
        .addNode('polishJoke', polishJokeNode)
        .addEdge(START, 'makeJoke')
        .addConditionalEdges('makeJoke', checkPunchline, {
          Pass: 'improveJoke',
          Fail: END,
        })
        .addEdge('improveJoke', 'polishJoke')
        .addEdge('polishJoke', END)
        .compile();

      const state = await workflow.invoke({
        topic: 'AI',
        joke: '',
        improvedJoke: '',
        finalJoke: '',
      });

      console.log(state);

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

  // const encoder = new TextEncoder();

  // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // const stream = new ReadableStream({
  //   start: async (controller) => {
  //     let fullData = '';

  //     for (const char of jobDescriptionText) {
  //       fullData += char;
  //       controller.enqueue(encoder.encode(fullData));
  //       await delay(100);
  //     }

  //     controller.close();
  //   },
  // });

  // return new Response(stream, {
  //   headers: {
  //     'Content-Type': 'text/event-stream',
  //     'Cache-Control': 'no-cache',
  //     Connection: 'keep-alive',
  //   },
  // });

  // return NextResponse.json({
  //   state,
  //   // joke: joke.text,
  //   // ...companyNameAndJobTitle.object,
  //   // ...searchQueries.object,
  //   // searchResults,
  // });
}
