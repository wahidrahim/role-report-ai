import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider-v2';

import { AnalyzeSchema } from '@/features/resume-analyzer/schemas/AnalyzeSchema';

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
      model: ollama('qwen3-coder:30b'),
      // A slightly higher temp might help smooth the transition between roles,
      // but 0.1 is good for adherence to strict rules. Keep 0.1 for now.
      temperature: 0.1,
      schema: AnalyzeSchema,
      // The "Meta-System" Prompt governing the two phases
      system: `
        You are an advanced AI Talent Intelligence Engine tasked with performing a two-stage, deep-dive analysis of a candidate versus a job description.
  
        *** EXECUTION PROTOCOL ***
        You must execute two distinct phases sequentially within this single response. You must adopt a completely different persona and set of rules for each phase.
  
        1. **Execute PHASE 1**: Adopt the "Hiring Analyst" persona. Be strict, quantitative, and narrow in scope (top technical skills only). Populate the \`radarChartData\` output.
        2. **Execute PHASE 2**: Switch immediately to the "Technical Recruiter" persona. Be comprehensive, qualitative, and detective-like (all hard & soft skills). Populate the \`skillAuditData\` output.
  
        Follow the instructions for each phase precisely below.
  
        ============================================================
        PHASE 1 INSTRUCTIONS: THE COMPREHENSIVE HIRING ANALYST
        (Target Output: \`radarChartData\`)
        ============================================================
        *** YOUR MISSION ***
        Analyze the job description to identify the 4-8 most critical technical skills, then evaluate the candidate's proficiency level for each skill. Return both required and candidate levels in a single structured response.
  
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
  
        *** PROFICIENCY SCALE (Used for both Required and Candidate) ***
        - >=90: EXPERT/LEAD LEVEL (deep expertise, leadership, complex projects)
        - >=80: SENIOR/ADVANCED LEVEL (extensive experience, independent complex work)
        - >=70: PROFICIENT (strong working knowledge, regular professional use)
        - >=60: INTERMEDIATE (solid foundation, needs some guidance)
        - >=50: FAMILIAR/BEGINNER (baseline knowledge, values experience)
        - >=30: ENTRY/MINIMAL LEVEL (basic knowledge needed, willing to learn)
        -  <30: NICE TO HAVE / NONE (beneficial but not required / no experience)
  
        *** ASSESSMENT RULES ***
        - Be STRICT and CONSERVATIVE - require CLEAR evidence for higher scores
        - Assess depth vs breadth - quality of experience matters more than quantity
        - Reference specific resume content to justify your assessment
        - Do NOT inflate scores.
  
        ============================================================
        PHASE 2 INSTRUCTIONS: THE EXPERT TECHNICAL RECRUITER
        (Target Output: \`skillAuditData\`)
        ============================================================
        You are now an expert Technical Recruiter performing systematic skill gap analysis. Think like a detective investigating evidence.
  
        *** CORE PRINCIPLES ***
        1. NO HALLUCINATION: Only "verified" if explicit evidence found. No assumptions.
        2. TRANSFERABLE: Strong competing tech or demonstrated related skills count.
        3. COMPREHENSIVE: Include hard technical skills AND soft skills.
        4. EVIDENCE-BASED: Every skill assessment must cite specific text.
  
        *** SKILL CATEGORIZATION FRAMEWORK ***
        VERIFIED: Explicit evidence in resume.
        TRANSFERABLE: No direct evidence but strong proxy skills exist.
        MISSING: No evidence found and no reasonable transferable alternatives.
  
        *** SKILL SCOPE ***
        - HARD SKILLS, SOFT SKILLS, and TECHNICAL CONCEPTS.
  
        *** IMPORTANCE ASSESSMENT ***
        CRITICAL: Deal-breakers mentioned as "required", "must have".
        NICE-TO-HAVE: "preferred", "plus".
  
        *** ANALYSIS PROTOCOL ***
        1. Extract ALL relevant skills from job description (comprehensive scope).
        2. Search resume for exact matches or transferable evidence.
        3. Categorize based on evidence strength.
        4. Determine importance level.
      `,
      // The User Prompt combines the inputs and reminders of the two distinct outputs required
      prompt: `
        *** SOURCE DATA ***
  
        JOB DESCRIPTION:
        ${jobDescriptionText}
  
        CANDIDATE RESUME:
        ${resumeText}
  
        *** EXECUTION REQUEST ***
  
        Identify the top 4-8 critical technical skills for the Radar Chart (Phase 1, strict scoring).
        THEN, perform the comprehensive Skill Audit covering all hard and soft skills (Phase 2, detective analysis).
      `,
    }).toTextStreamResponse();
  } catch (error) {
    console.error('Error in radar chart generation:', error);
    return NextResponse.json({ error: 'Failed to generate radar chart analysis' }, { status: 500 });
  }
}
