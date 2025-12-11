import { streamObject } from 'ai';
import { ollama } from 'ollama-ai-provider-v2';

import { SkillAuditSchema } from './schema';

export interface GenerateRadarChartParams {
  resumeText: string;
  jobDescriptionText: string;
}

export function auditSkills({ resumeText, jobDescriptionText }: GenerateRadarChartParams) {
  return streamObject({
    model: ollama('qwen3-coder:30b'),
    temperature: 0.1,
    schema: SkillAuditSchema,
    system: `
      You are an expert Technical Recruiter performing systematic skill gap analysis. Think like a detective investigating evidence.

      *** CORE PRINCIPLES ***
      1. NO HALLUCINATION: Only "verified" if explicit evidence found. No assumptions.
      2. TRANSFERABLE: Strong competing tech (AWS↔Azure, React↔Vue, Django↔Rails) or demonstrated related skills.
      3. COMPREHENSIVE: Include hard technical skills AND soft skills (leadership, communication, problem-solving).
      4. EVIDENCE-BASED: Every skill assessment must cite specific text from resume or logical mapping.

      *** SKILL CATEGORIZATION FRAMEWORK ***
      VERIFIED: Explicit evidence in resume. Skill named directly or demonstrated through projects/experience.
      TRANSFERABLE: No direct evidence but strong proxy skills exist (different tech stack, same concepts).
      MISSING: No evidence found and no reasonable transferable alternatives.

      *** SKILL SCOPE ***
      - HARD SKILLS: Programming languages, frameworks, tools, databases, cloud platforms, methodologies
      - SOFT SKILLS: Leadership, communication, problem-solving, collaboration, adaptability, project management
      - TECHNICAL CONCEPTS: System design, algorithms, security, performance optimization, testing

      *** IMPORTANCE ASSESSMENT ***
      CRITICAL: Deal-breakers mentioned as "required", "must have", or core job responsibilities.
      NICE-TO-HAVE: Beneficial but not essential, mentioned as "preferred", "plus", or secondary requirements.

      *** ANALYSIS PROTOCOL ***
      1. Extract ALL skills from job description (both explicit and implicit requirements)
      2. For each skill, search resume for exact matches or transferable evidence
      3. Categorize based on evidence strength using the framework above
      4. Determine importance level from job description context
      5. Provide specific evidence or mapping logic in reasoning

      *** EVIDENCE STANDARDS ***
      - VERIFIED: Cite exact text/phrase from resume
      - TRANSFERABLE: Explain the skill mapping (e.g., "React web experience transfers to React Native")
      - MISSING: Confirm absence after thorough search
    `,
    prompt: `
      *** SKILL ANALYSIS EXAMPLES ***

      VERIFIED EXAMPLES:
      [skill:"React.js", status:"verified", importance:"critical", resumeMatch:"React.js, Next.js, Redux", reasoning:"Explicitly listed in skills section and used in 3+ projects"]

      [skill:"Leadership", status:"verified", importance:"nice-to-have", resumeMatch:"Led team of 5 developers", reasoning:"Direct evidence of leading development teams"]

      TRANSFERABLE EXAMPLES:
      [skill:"React Native", status:"transferable", importance:"critical", resumeMatch:"React.js, Next.js", reasoning:"React web experience transfers directly to Native (90% pattern overlap, mobile APIs learnable)"]

      [skill:"Azure", status:"transferable", importance:"nice-to-have", resumeMatch:"AWS, GCP", reasoning:"Multi-cloud experience demonstrates cloud architecture skills transferable to Azure"]

      [skill:"Conflict Resolution", status:"transferable", importance:"nice-to-have", resumeMatch:"Facilitated cross-team collaboration", reasoning:"Demonstrated ability to navigate team dynamics and resolve disagreements"]

      MISSING EXAMPLES:
      [skill:"Kubernetes", status:"missing", importance:"critical", resumeMatch:"none", reasoning:"No container orchestration experience found, no Docker/K8s equivalents mentioned"]

      [skill:"Public Speaking", status:"missing", importance:"nice-to-have", resumeMatch:"none", reasoning:"No presentation, conference, or speaking experience mentioned"]

      *** SKILL AUDIT REQUEST ***

      RESUME: ${resumeText}

      JOB DESCRIPTION: ${jobDescriptionText}

      Analyze every relevant skill from the job description. Include both technical and soft skills. For each skill, provide:
      1. Exact skill name from job description
      2. Status based on evidence (verified/transferable/missing)
      3. Importance level (critical/nice-to-have)
      4. Specific resume match or "none"
      5. Clear reasoning with evidence or mapping logic

      Focus on skills that would impact job performance. Return comprehensive analysis.
    `,
  });
}
