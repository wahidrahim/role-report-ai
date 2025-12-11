import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider-v2';

import { AnalyzeSchema } from '@/app/api/analyze/AnalyzeSchema';

export async function POST(request: NextRequest) {
  const { resumeText, jobDescriptionText } = await request.json();

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  try {
    return streamObject({
      model: ollama('qwen3:30b'),
      temperature: 0.1,
      schema: AnalyzeSchema,
      system: `
        You are an expert technical recruiter analyzing resume-job fit. Focus on quantifiable technical skills and absolute requirements.

        RADAR CHART: Top 4-8 critical technical skills (languages, frameworks, tools, databases only - no soft skills).
        - requiredLevel: 0-100 (90-100=Expert, 80-89=Senior, 70-79=Proficient, 60-69=Intermediate, 50-59=Familiar, 30-49=Entry, 0-29=Nice-to-have)
        - candidateLevel: 0-100 based on resume evidence (conservative, no inflation)
        - reasoning: Cite specific resume evidence (max 300 chars)

        SKILL AUDIT: Quantifiable technical skills or absolute musts only. Exclude general soft skills. Each skill appears in ONLY ONE category (verified, transferable, or missing) - no duplicates.

        VERIFIED SKILLS: Direct matches where job requires skill X and candidate possesses X.
        - skillName: Required skill name
        - importance: "critical" (deal-breaker) or "nice-to-have"
        - reasoning: How skill appears in both JD and resume with exact mentions (max 300 chars)

        TRANSFERABLE SKILLS: Direct transferable skills only - no speculative assumptions. Candidate must have demonstrable experience with the skill (e.g., Vue.js→React, PostgreSQL→MySQL, but NOT Nuxt.js→Webpack).
        - skillName: Candidate's skill (e.g., "Vue.js", "PostgreSQL")
        - importance: "critical" (addresses core requirement) or "nice-to-have"
        - reasoning: How job requires skill X and candidate demonstrates actual Y experience as direct transferable alternative (max 300 chars)

        MISSING SKILLS: Job-required skills with no candidate mention or proxies.
        - skillName: Required skill name
        - importance: "critical" (deal-breaker) or "nice-to-have"
        - reasoning: How job requires skill (cite JD) and confirm no resume mention or alternatives (max 300 chars)

        FIT SCORE: 0-100 synthesizing radar chart and skill audit findings. Consider verified vs missing critical skills.

        VERDICT: Brief score explanation highlighting key strengths and concerns (max 300 chars).

        Be objective and cite specific evidence from both resume and job description.
      `,
      prompt: `
        JOB DESCRIPTION:
        ${jobDescriptionText}

        CANDIDATE RESUME:
        ${resumeText}
      `,
    }).toTextStreamResponse();
  } catch (error) {
    console.error('Error in analysis generation:', error);
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
  }
}
