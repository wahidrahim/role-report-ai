import { tavily } from '@tavily/core';
import { generateText, streamObject, tool } from 'ai';
import { z } from 'zod';

import { model } from '@/agents/config';

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const searchTool = tool({
  description: 'Search the web for company and interview information',
  inputSchema: z.object({
    query: z.string(),
    category: z.enum(['news', 'culture', 'interview', 'tech']),
  }),
  execute: async ({ query, category }) => {
    console.log(`🔍 Searching ${category}: ${query}`);

    const response = await tavilyClient.search(query);

    return {
      category,
      results: response.results.map((r) => ({
        title: r.title,
        snippet: r.content,
        url: r.url,
      })),
    };
  },
});

export async function POST(request: Request) {
  const { resumeText, jobDescriptionText } = await request.json();

  // Phase 1: Let the agent research using tools
  const researchResult = await generateText({
    model,
    tools: { searchWeb: searchTool },
    maxRetries: 3,
    system: `You are a career research assistant. 
      Use the searchWeb tool to find:
      1. Recent company news
      2. Interview experiences (Glassdoor, Reddit)
      3. Engineering culture and tech stack
      
      Search multiple times with different queries to gather comprehensive intel.`,
    prompt: `Research this company and role:
      JOB DESCRIPTION:
      ${jobDescriptionText}`,
  });

  // Phase 2: Structure the research into a study plan
  const planStream = streamObject({
    model,
    schema: z.object({
      companyIntel: z.object({
        recentNews: z.array(z.string()),
        interviewTips: z.array(z.string()),
        techStack: z.array(z.string()),
      }),
      studyPlan: z.array(
        z.object({
          topic: z.string(),
          priority: z.enum(['critical', 'high', 'medium']),
          resources: z.array(z.string()),
        }),
      ),
    }),
    prompt: `Based on this research, create a study plan:
      
      RESEARCH FINDINGS:
      ${researchResult.text}
      
      CANDIDATE RESUME:
      ${resumeText}`,
  });

  return planStream.toTextStreamResponse();
}
