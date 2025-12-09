import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    // Validate required fields
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Both resume text and job description are required' },
        { status: 400 },
      );
    }

    const result = streamObject({
      model: 'gpt-4o-mini',
      schema: AnalysisSchema,
      temperature: 0.2, // Low temp = high consistency/strictness
      system: `
        You are an expert Technical Recruiter & Engineering Lead.
        Your goal is to perform a rigorous "Gap Analysis" between a candidate and a job description.
  
        *** CONSTITUTIONAL GUIDELINES (DO NOT VIOLATE) ***
        1. NO HALLUCINATION: If a skill is not explicitly evidenced in the text, mark it "missing". Do not assume "Java" implies "Spring Boot".
        2. STRICT SCORING: 
           - A "Verified" match requires explicit proof in the resume.
           - A "Transferable" match requires a competing technology (e.g., AWS vs Azure).
           - "Missing" means no evidence found.
        3. CHRONOLOGICAL REASONING: Follow the schema steps strictly in order:
           - STEP 1 (thoughtProcess): Analyze high-level gaps.
           - STEP 2 (skillAudit): Detailed evidence gathering.
           - STEP 3 (radarChart): Synthesis of audit into 6 dimensions.
           - STEP 4 (actionPlan): Strategic advice.
           - STEP 5 (matchScore and verdict): Final calculation based on all prior steps.
        
        *** SCORING RUBRIC ***
        - 90-100: Perfect Match. Meets all Critical + Nice-to-haves.
        - 75-89: Strong Match. Has Criticals, missing minor Nice-to-haves.
        - 60-74: Transferable Match. Has fundamental skills but different stack (e.g., Python dev applying for Ruby role).
        - <60: Weak Match. Missing Critical requirements.

        *** RADAR CHART INSTRUCTIONS ***
        - Select 4 to 8 distinct technical axes.
        - Fewer is better. Only add an axis if it is a major distinct requirement.
        - For every axis (e.g., "Cloud Infrastructure"), you must generate TWO scores:
            A. [Required Level] (The Bar):
              - 90-100: "Expert/Architect" (Primary focus of job)
              - 70-80: "Senior/Proficient" (Daily usage required)
              - 40-60: "Familiarity" (Occasional usage)
              
            B. [Candidate Level] (The Candidate):
              - 90-100: "Mastery" (Led projects, complex metrics shown)
              - 70-80: "Strong" (Action verbs: Built, Deployed, Implemented)
              - 40-60: "Competent" (Listed in skills, minor usage)
              - 10-30: "Concept Only" (Theoretical knowledge, no hands-on)
              - 0: "No Evidence"
      `,
      prompt: `
        *** FEW-SHOT EXAMPLE (HOW TO THINK) ***
        [JD Requirement]: "Expert in React Native"
        [Resume Snippet]: "5 years experience building React web apps with Next.js"
        [Correct Analysis]: 
        {
          "skill": "React Native",
          "status": "transferable", 
          "evidence": "Candidate has deep React (Web) experience, which transfers easily to Native, but lacks specific mobile API knowledge.",
          "importance": "critical"
        }
        (Note: It is NOT "verified" because Web != Native. It is NOT "missing" because the core concept is present.)

        *** FEW-SHOT EXAMPLE: TRANSFERABILITY ***
        [JD Requirement]: "Looking for a Python/Django developer."
        [Resume Snippet]: "Senior Ruby on Rails Developer with 5 years experience."
        [Correct Analysis]:
        {
          "missingSkill": "Django",
          "candidateSkill": "Ruby on Rails",
          "reasoning": "Both are MVC frameworks with similar ORMs (ActiveRecord vs Django ORM). Patterns transfer 90%."
        }
  
        *** ACTUAL DATA ***
        RESUME CONTENT:
        ${resumeText}
  
        JOB DESCRIPTION:
        ${jobDescription}
      `,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error analyzing fit:', error);
    return NextResponse.json(
      { error: 'Failed to analyze fit. Please try again.' },
      { status: 500 },
    );
  }
}
