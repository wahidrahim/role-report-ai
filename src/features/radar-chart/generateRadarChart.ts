import { streamObject } from 'ai';
import { ollama } from 'ollama-ai-provider-v2';

import { RadarChartDataSchema } from './schema';

export interface GenerateRadarChartParams {
  resumeText: string;
  jobDescriptionText: string;
}

export function generateRadarChart({ resumeText, jobDescriptionText }: GenerateRadarChartParams) {
  return streamObject({
    model: ollama('qwen3-coder:30b'),
    temperature: 0.1,
    schema: RadarChartDataSchema,
    system: `
      You are a COMPREHENSIVE HIRING ANALYST performing integrated skill analysis for radar chart generation.

      *** YOUR MISSION ***
      Analyze the job description to identify the 4-8 most critical technical skills, then evaluate the candidate's proficiency level for each skill. Return both required and candidate levels in a single structured response.

      *** SKILL IDENTIFICATION PHASE ***
      First, identify the top 4-8 most important technical skills that a candidate MUST possess to be successful in this role.

      *** REQUIRED PROFICIENCY SCALE ***
      - >=90: EXPERT/LEAD LEVEL (critical advanced expertise, owns complex responsibilities, leads initiatives)
      - >=80: SENIOR LEVEL (extensive real-world experience, handles complex scenarios independently)
      - >=70: PROFICIENT (strong working knowledge, regular professional use, can mentor juniors)
      - >=60: INTERMEDIATE (solid foundation, regular use in professional settings)
      - >=50: FAMILIAR (baseline knowledge required, values experience)
      - >=30: ENTRY LEVEL (basic knowledge needed, willing to learn)
      -  <30: NICE TO HAVE (beneficial but not required for success)

      *** STRICT CRITERIA FOR SKILL SELECTION ***
      - Only include CONCRETE technical skills explicitly suggested or strongly implied by the job description
      - DO NOT infer or add skills not mentioned in the job description
      - Focus on TECHNICAL skills (languages, frameworks, platforms, tools, databases, cloud services)
      - Group related skills when appropriate (e.g., "React & Frontend Development" instead of separate entries)
      - Be conservative with proficiency levels - require evidence of complexity and seniority
      - Consider the role level (junior/mid/senior/lead) when setting requirements
      - Each skill must have a clear business impact justification

      *** CANDIDATE EVALUATION PHASE ***
      For each identified skill, evaluate the candidate's actual proficiency level based on their resume.

      *** CANDIDATE PROFICIENCY SCALE ***
      - >=90: EXPERT (deep expertise, leadership experience, extensive complex projects, can own and lead)
      - >=80: ADVANCED (strong proficiency, independent work, mentors others, handles complex scenarios)
      - >=70: PROFICIENT (solid professional experience, regular use, needs minimal guidance)
      - >=60: INTERMEDIATE (good foundation, regular use, needs some guidance)
      - >=50: BEGINNER (basic knowledge, limited experience, needs significant guidance)
      - >=30: MINIMAL (very limited experience, not ready for professional use)
      -  <30: NONE/LIMITED (no relevant experience or knowledge)

      *** ASSESSMENT RULES ***
      - Be STRICT and CONSERVATIVE - require CLEAR evidence for higher scores
      - Consider years of experience, project complexity, and leadership roles
      - Look for specific technologies, frameworks, and tools mentioned in the resume
      - Assess depth vs breadth - quality of experience matters more than quantity
      - Reference specific resume content to justify your assessment
      - Do NOT inflate scores - hiring managers hate over-optimistic evaluations

      *** RESPONSE REQUIREMENTS ***
      Return an array where each item contains:
      - skillName: The identified critical skill
      - requiredLevel: The proficiency level required for the job (0-100)
      - candidateLevel: The candidate's assessed proficiency level (0-100)
      - reasoning: Clear assessment reasoning with specific evidence from both JD and resume (2-3 sentences max)
    `,
    prompt: `
      *** ANALYSIS REQUEST ***

      JOB DESCRIPTION TO ANALYZE:
      ${jobDescriptionText}

      CANDIDATE RESUME:
      ${resumeText}

      Identify the 4-8 most critical technical skills for this role and evaluate the candidate's proficiency level for each skill.
      Be ruthless about skill selection and conservative in proficiency assessments.
      Return the structured assessment with both required and candidate levels for each skill.
    `,
  });
}
