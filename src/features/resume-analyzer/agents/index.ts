import { END, START, StateGraph } from '@langchain/langgraph';
import { generateObject, streamObject } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import * as z from 'zod';

import { GraphStateSchema, RadarChartDataSchema } from './schemas';

const ollama = createOllama();

export type GraphState = z.infer<typeof GraphStateSchema>;

export async function generateRadarChartData(resumeText: string, jobDescriptionText: string) {
  const result = streamObject({
    model: ollama('qwen3-coder:30b'),
    schema: RadarChartDataSchema,
    prompt: `
      Analyze both the job description and candidate resume to identify the top 4-8 core technical skills required for this role,
      and assess the candidate's proficiency level for each skill.

      *** REQUIRED LEVEL SCALE (for job requirements) ***
      - 91-100: Expert/Lead (critical, advanced, expert ownership/responsibility)
      - 71-90: Senior/Proficient (must have real-world experience, frequent use)
      - 51-70: Familiarity (baseline knowledge needed, valued but not core)
      - 0-50: Nice to Have (beneficial, secondary/optional)

      *** CANDIDATE LEVEL SCALE (for candidate assessment) ***
      - 91-100: Expert (deep expertise, leadership, extensive experience)
      - 71-90: Advanced (strong proficiency, independent work, mentoring others)
      - 51-70: Intermediate (solid foundation, regular use, needs some guidance)
      - 31-50: Beginner (basic knowledge, limited experience, needs significant guidance)
      - 0-30: None/Limited (minimal or no relevant experience)

      *** INSTRUCTIONS ***
      - Only extract concrete skills (frameworks, platforms, languages, technical concepts, major tools) that are suggested by the job description
      - Do NOT infer skills not suggested in the job description
      - For each skill, provide both required level and candidate level with detailed reasoning
      - Group related skills under one entry when appropriate (e.g., "AWS & Cloud Services")
      - Be conservative in candidate assessments - require clear evidence for higher scores
      - Consider years of experience, complexity of projects, and leadership roles in candidate assessment
      - Provide specific reasoning that references actual text from both the job description and resume

      JOB DESCRIPTION:
      ${jobDescriptionText}

      CANDIDATE RESUME:
      ${resumeText}
    `,
  });

  return result;
}

const workflow = new StateGraph(GraphStateSchema)
  // Nodes
  .addNode('ANALYZE_SKILLS_FIT', analyzeSkillsFit)

  // Edges
  .addEdge(START, 'ANALYZE_SKILLS_FIT')
  .addEdge('ANALYZE_SKILLS_FIT', END);

const radarChartGraph = workflow.compile();

export async function generateRadarChart(resumeText: string, jobDescriptionText: string) {
  console.log('🚀 Starting job fit analysis...');

  const result = await radarChartGraph.invoke({
    resumeText,
    jobDescriptionText,
  });

  console.log('✅ Analysis complete!');

  return { radarChartData: result.radarChartData };
}
