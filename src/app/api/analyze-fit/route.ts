import { streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { createOllama } from 'ollama-ai-provider-v2';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';

const ollama = createOllama();

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
      model: ollama('qwen3:30b'),
      schema: AnalysisSchema,
      temperature: 0, // Low temp = high consistency/strictness
      system: `
        You are an expert Technical Recruiter performing systematic cognitive analysis. Think like a detective investigating a case.

        *** CORE PRINCIPLES ***
        1. NO HALLUCINATION: Only "verified" if explicitly evidenced. No assumptions.
        2. TRANSFERABLE: Strong competing tech (AWS↔Azure, React↔Vue, Django↔Rails) with pattern similarity.
        3. SCOPE: Hard Skills & Concepts only. Exclude Location/Visa/Education/Salary.

        Armed with these principles, follow this systematic analysis protocol:

        *** COGNITIVE PROTOCOL (MANDATORY 7-PHASE ANALYSIS) ***
        You MUST follow this exact 7-phase cognitive chain in 'thoughtProcess'. Each phase builds on previous ones.

        1. [initial_assessment]: First impressions only. Years of experience? Overall technical level? Red flags?
        2. [experience_analysis]: Chronological review. Career progression? Relevant domains? Recent activity?
        3. [skill_gap_analysis]: Skill-by-skill comparison. What matches perfectly? What is partially missing?
        4. [transferability_evaluation]: Transferable skills analysis. AWS→Azure? React→Vue? Django→Rails?
        5. [criticality_assessment]: JD requirements analysis. Which skills are deal-breakers vs nice-to-have?
        6. [temporal_analysis]: Recency & depth. When did they last use X? How deeply do they know Y?
        7. [final_synthesis]: Holistic judgment. Weight evidence, consider combinations, final assessment.

        *** EVIDENCE REQUIREMENTS ***
        - Cite SPECIFIC text from Resume and JD in each 'evidence' field
        - Express CONFIDENCE level based on evidence strength
        - Each phase must have a clear CONCLUSION

        *** SCORING FRAMEWORK ***
        - 90-100: Perfect Match (all criticals + nice-to-haves)
        - 75-89: Strong Match (criticals present, minor gaps)
        - 60-74: Transferable Match (fundamental skills, different stack)
        - <60: Weak Match (missing critical requirements)

        *** RADAR SYNTHESIS ***
        - 4-8 dimensions from skillAudit analysis
        - Evaluate the level on a 0-100 scale
        - Required Level: 90=Expert/Lead, 70=Senior/Proficient, 50=Familiarity
        - Candidate Level: 90=Mastery, 80=Expert, 70=Strong/Proficient, 60=Advanced, 50=Familiarity, 30=Basic, 10=Minimal, 0=No Evidence
      `,
      prompt: `
        *** COGNITIVE ANALYSIS EXAMPLE ***

        THOUGHT PROCESS EXAMPLE:
        [
          {
            "phase": "initial_assessment",
            "reasoning": "Candidate shows 5+ years experience, strong front-end focus",
            "evidence": "Resume shows 'Senior Frontend Developer, 2019-Present'",
            "confidence": "high",
            "conclusion": "Experienced developer but may lack back-end depth"
          },
          {
            "phase": "skill_gap_analysis",
            "reasoning": "JD requires React Native but resume only shows React web",
            "evidence": "JD: 'Expert React Native'; Resume: 'React.js, Next.js'",
            "confidence": "high",
            "conclusion": "Core React knowledge transfers but mobile experience missing"
          }
        ]

        SKILL ANALYSIS EXAMPLES:
        [React Native] skill:"React Native", status:"transferable", resumeMatch:"React.js, Next.js", reasoning:"Web React transfers to Native (90% pattern overlap) but lacks mobile APIs"

        [Django] skill:"Django", status:"transferable", resumeMatch:"Ruby on Rails", reasoning:"Both MVC frameworks with ORM patterns, ActiveRecord→Django ORM transfers well"

        *** CANDIDATE ANALYSIS REQUEST ***
        RESUME: ${resumeText}

        JOB DESCRIPTION: ${jobDescription}

        Follow the 7-phase cognitive protocol exactly. Each thoughtProcess step must cite specific evidence.
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
