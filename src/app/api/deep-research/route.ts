import { tavily } from '@tavily/core';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { model } from '@/agents/config';

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export async function POST(request: Request) {
  const { resumeText, jobDescriptionText } = await request.json();

  const companyNameAndJobTitle = await generateObject({
    model,
    schema: z.object({
      companyName: z.string(),
      jobTitle: z.string(),
    }),
    system: `
      You are a company name and job title generator.

      You will be given a job description.

      You need to generate a company name and a job title that are relevant to the job description.

      INSTRUCTIONS:
      - company name should be the full name of the company
      - job title should be the full title of the role, avoid generalizations
    `,
    prompt: `
      Figure out the company name and job title from the following job description:

      JOB DESCRIPTION:
      ${jobDescriptionText}
    `,
  });

  const searchQueries = await generateObject({
    model,
    schema: z.object({
      queries: z
        .array(
          z.object({
            query: z.string(),
            category: z.enum(['news', 'culture', 'interview', 'tech']),
            reasoning: z.string(),
          }),
        )
        .min(12)
        .max(12),
    }),
    system: `
      You are the Lead Investigator. Your goal is to generate 3 targeted search queries to uncover deep intel about {companyName} for the role of {jobTitle}.

      GUIDELINES:
      - you must produce queries for each category: news, culture, interview, tech
      - come up with up to 3 queries for each category
      - keep your reasoning concise and to the point
    `,
    prompt: `
      COMPANY NAME:
      ${companyNameAndJobTitle.object.companyName}

      JOB TITLE:
      ${companyNameAndJobTitle.object.jobTitle}
    `,
  });

  const searchResults = await Promise.all(
    searchQueries.object.queries.map(async (query) => {
      const results = await tavilyClient.search(query.query, {
        maxResults: 5,
        searchType: 'advanced',
      });

      return {
        query: query.query,
        results: results.results.map((result) => result.content),
      };
    }),
  );

  return NextResponse.json({
    ...companyNameAndJobTitle.object,
    ...searchQueries.object,
    searchResults,
  });
}
