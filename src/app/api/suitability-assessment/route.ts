import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider-v2';
import * as z from 'zod';

export const SuitabilityAssessmentSchema = z.object({
  suitabilityScore: z.number().min(0).max(10),
  suitabilityReasoning: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescriptionText, chartData, categorizedSkills } = body;

    if (!resumeText || !jobDescriptionText) {
      return NextResponse.json(
        { error: 'Both resume text and job description text are required' },
        { status: 400 },
      );
    }

    return streamObject({
      model: ollama('qwen3-coder:30b'),
      schema: SuitabilityAssessmentSchema,
      system: `
        You are an expert technical recruiter conducting a candidate suitability assessment. Your evaluations are fair, evidence-based, and concise.

        ## Input Data
        You will receive:
        1. **Resume** - The candidate's background and qualifications
        2. **Job Description** - Role requirements and responsibilities
        3. **Skills Radar Chart Data** - Required vs. candidate proficiency levels for key skills
        4. **Categorized Skills** - Skills classified as relevant, transferable, or missing

        ## Assessment Criteria (Weight each appropriately)
        - **Core Skills Match (35%)**: Alignment with must-have requirements
        - **Experience Relevance (25%)**: Relevant work history and accomplishments
        - **Skill Gaps & Severity (20%)**: Critical missing skills and learnability
        - **Transferable Skills (10%)**: Existing skills that bridge gaps
        - **Overall Potential (10%)**: Growth trajectory and adaptability

        ## Scoring Guide (0-10 scale, use one decimal place as needed)
        - **9.0-10**: Exceptional fit. Exceeds requirements, minimal gaps.
        - **8.0-8.9**: Strong fit. Meets core requirements, minor gaps.
        - **7.0-7.9**: Good fit. Solid foundation, some training needed.
        - **6.0-6.9**: Moderate fit. Relevant experience but notable gaps.
        - **5.0-5.9**: Weak fit. Transferable skills present but significant gaps.
        - **4.0-4.9**: Poor fit. Major skill misalignment.
        - **Below 4.0**: Not suitable. Fundamental mismatch.

        ## Reasoning Guidelines
        Be CONCISE. Write 2-4 sentences maximum:
        - State the key strength(s) or concern(s)
        - Note the most significant skill match or gap
        - Give a brief bottom-line recommendation

        Keep it direct and professional. No fluff or filler phrases.`,
      prompt: `
        Assess this candidate's suitability for the role. Provide a score (0-10, one decimal place) and a concise reasoning (2-4 sentences).

        ---
        ## CANDIDATE RESUME
        ${resumeText}

        ---
        ## JOB DESCRIPTION
        ${jobDescriptionText}

        ---
        ## SKILLS RADAR CHART DATA
        ${chartData ? JSON.stringify(chartData, null, 2) : 'Not available'}

        ---
        ## CATEGORIZED SKILLS ANALYSIS
        ${categorizedSkills ? JSON.stringify(categorizedSkills, null, 2) : 'Not available'}`,
    }).toTextStreamResponse();
  } catch (error) {
    console.error('Error in suitability assessment:', error);
    return NextResponse.json({ error: 'Failed to assess suitability' }, { status: 500 });
  }
}
