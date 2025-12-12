import { LanguageModel, streamObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider-v2';

import {
  ActionPlanSchema,
  CategorizedSkillsSchema,
  RadarChartDataSchema,
  SuitabilityAssessmentSchema,
} from './schemas';

// const model = ollama('qwen3:30b');
const model: LanguageModel = 'openai/gpt-4o';

export async function POST(request: NextRequest) {
  const { resumeText, jobDescriptionText } = await request.json();

  if (!resumeText || !jobDescriptionText) {
    return NextResponse.json(
      { error: 'Both resume text and job description are required' },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Helper to send SSE-formatted data
        const sendData = (type: string, data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
        };

        // 1. Start both independent streams in parallel
        const radarResult = streamObject({
          model,
          schema: RadarChartDataSchema,
          system: `
            You are a STRICT HIRING MANAGER for the company described in the job description. Your evaluations must be evidence-based, and derived solely from the provided resume and job description. Do not assume external knowledge or add unmentioned details.

            Your task is to generate data for a radar chart comparing the candidate's skills to the job's requirements. Follow these steps exactly:

            1. **Identify Skills:** Extract and list up to 8 of the MOST IMPORTANT SKILLS explicitly or implicitly required by the JOB DESCRIPTION. Do not consider the resume at all when identifying skills—base selection solely on the job description to ensure focus on what is required and most critical for the role. Aim to select as many skills as reasonably possible up to the limit of 8, preferring more over fewer when skills are comparably important. Prioritize core technical, soft, or domain-specific skills that are central to the role (e.g., programming languages, tools, methodologies, or competencies like "leadership" if mentioned). Use concise, standardized names for \`skillName\` (e.g., "JavaScript Programming" instead of vague terms). Do not exceed 8 skills; if fewer are prominent, use only those.

            2. **Evaluate Required Level:** For each skill, assess the PROFICIENCY LEVEL THE JOB DEMANDS (\`requiredLevel\`) on the 0-100 scale below. Infer from the job description's language (e.g., "expert in X" implies 80+, "familiar with Y" implies 40-50, "lead Z projects" implies 70+). Base this solely on the job text — do not inflate or assume.

            3. **Evaluate Candidate Level:** For each skill, assess the CANDIDATE'S PROFICIENCY LEVEL (\`candidateLevel\`) on the same 0-100 scale. Base this solely on evidence from the resume (e.g., years of experience, projects, certifications). If no evidence, rate 0. Be conservative: require demonstrated proof, not assumptions or inference.

            4. **Provide Reasoning:** For each skill, write a concise \`reasoning\` string (2-4 sentences) that JUSTIFIES BOTH the \`requiredLevel\` (citing job description evidence) and the \`candidateLevel\` (citing resume evidence). Be specific, factual, and neutral — e.g., "Job requires expert-level due to 'lead complex projects'; candidate shows 5+ years and multiple leads, indicating proficient practitioner."

            Proficiency Scale (use any integer from 0 to 100 for ratings; interpolate between levels as needed for precision, e.g., 21, 37, 59, 83, 97, etc.):
            - 0: Complete Incompetence. No awareness or exposure. Never heard of it and couldn't attempt.
            - 10: Minimal Awareness. Heard of it but zero hands-on experience. Attempts are random failures.
            - 20: Novice Beginner. Brief exposure (e.g., one tutorial). Simple tasks with heavy guidance; frequent errors.
            - 30: Basic Learner. Understands basics; executes fundamentals inconsistently. Needs constant supervision; low-quality output.
            - 40: Developing Competence. Grasps principles; handles routines somewhat independently. Common errors but occasional self-correction.
            - 50: Intermediate Proficiency. Solid foundations; reliable on standard tasks without guidance. Adapts to minor variations; struggles with complexity.
            - 60: Advanced Intermediate. Deeper understanding; independent on moderate complexity. Consistent; teaches beginners.
            - 70: Proficient Practitioner. Strong command; solves varied problems efficiently. Minor innovations; mentors intermediates.
            - 80: Expert Level. Deep expertise; anticipates issues, optimizes, excels under pressure. Contributes to advancements.
            - 90: Near-Mastery. Elite; significant innovations, leads domain, flawless on edge cases. Recognized authority.
            - 100: Absolute Mastery. Pinnacle; invents methods, pushes boundaries, perfect consistency. Rare (e.g., pioneers).

            Output ONLY valid JSON matching this schema exactly:
            {
              "data": [
                {
                  "skillName": "string",
                  "requiredLevel": number (0-100),
                  "candidateLevel": number (0-100),
                  "reasoning": "string"
                },
                ...
              ]
            }
            No additional text, explanations, or wrappers.
          `,
          prompt: `
            RESUME:
            ${resumeText}

            JOB DESCRIPTION:
            ${jobDescriptionText}
          `,
        });

        const skillsResult = streamObject({
          model,
          schema: CategorizedSkillsSchema,
          system: `
          You are a SKILLS ASSESSMENT SPECIALIST evaluating candidate-job fit. You must be evidence-based and derive all conclusions solely from the provided resume and job description text.

          SKILL SPECIFICITY REQUIREMENTS:
          - Focus on CONCRETE TECHNOLOGIES and tools, NOT vague or abstract concepts
          - Include specific frameworks, languages, platforms, and discrete technical skills
          - Examples of CONCRETE TECHNOLOGIES: "React", "PostgreSQL", "Docker", "AWS Lambda", "GraphQL", "Kubernetes"
          - Examples to AVOID: "async programming", "npm/yarn", "version control", "agile methodology", "problem solving"

          CATEGORIZATION RULES:

          VERIFIED SKILLS:
          - Specific technologies explicitly required in job description AND directly evidenced in resume
          - Must show clear, hands-on experience with the exact technology
          - Examples: "React" job requirement + "Built React applications with hooks and context API" = verified

          TRANSFERABLE SKILLS:
          - Related technologies the candidate has that could reasonably substitute for job requirements
          - Must be specific, comparable technologies with similar complexity and use cases
          - Examples: Job requires "React" + candidate has "Vue.js" experience = transferable

          MISSING SKILLS:
          - Specific technologies explicitly stated as required/preferred in job description but absent from resume
          - Focus on concrete tools/platforms mentioned, not general concepts

          IMPORTANCE LEVELS:
          - CRITICAL: Essential technologies for core job functions, mentioned as "required" or "must have"
          - NICE-TO-HAVE: Beneficial technologies that enhance performance, mentioned as "preferred" or "plus"

          CONSTRAINTS:
          - Each skill appears in exactly ONE category
          - Use specific, normalized technology names (e.g., "React" not "React.js", "PostgreSQL" not "SQL databases")
          - Only include skills that are specific, discrete technologies mentioned in job description requirements
          - Provide specific evidence from both texts in reasoning
          - Prioritize concrete tools over abstract concepts
        `,
          prompt: `
          STEP-BY-STEP ANALYSIS:

          1. EXTRACT JOB REQUIREMENTS:
             - Identify SPECIFIC TECHNOLOGIES explicitly mentioned as requirements in the job description
             - FILTER: Only include concrete, high-value tools/platforms (React, PostgreSQL, Docker, AWS, etc.)
             - EXCLUDE: Vague concepts like "async programming", "version control", "agile", "npm/yarn"
             - Note whether each technology is presented as "required", "preferred", or "nice-to-have"

          2. EXTRACT CANDIDATE SKILLS:
             - List SPECIFIC TECHNOLOGIES evidenced in the resume with concrete experience details
             - FILTER: Focus on actual tools/platforms used, not general concepts
             - Look for hands-on experience mentions, not just familiarity

          3. CATEGORIZE SYSTEMATICALLY:
             For each specific technology from job requirements:
             - If DIRECT MATCH with concrete evidence → VERIFIED
             - If RELATED SPECIFIC TOOL with transferable potential → TRANSFERABLE
             - If NO EVIDENCE of the specific technology → MISSING

          4. OUTPUT: Return only concrete, discrete technology skills with importance levels and evidence-based reasoning

          RESUME TEXT:
          ${resumeText}

          JOB DESCRIPTION TEXT:
          ${jobDescriptionText}
        `,
        });

        // 2. Stream both to client in parallel (tagged by type)
        const streamRadar = (async () => {
          for await (const partial of radarResult.partialObjectStream) {
            sendData('radarChart', partial);
          }
        })();

        const streamSkills = (async () => {
          for await (const partial of skillsResult.partialObjectStream) {
            sendData('categorizedSkills', partial);
          }
        })();

        // 3. Wait for BOTH to complete
        await Promise.all([streamRadar, streamSkills]);

        // 4. Get final validated objects
        const [radarChartData, categorizedSkills] = await Promise.all([
          radarResult.object,
          skillsResult.object,
        ]);

        // 5. NOW start the dependent suitability assessment
        const suitabilityResult = streamObject({
          model,
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
          ${JSON.stringify(radarChartData, null, 2)}

          ---
          ## CATEGORIZED SKILLS ANALYSIS
          ${JSON.stringify(categorizedSkills, null, 2)}`,
        });

        for await (const partial of suitabilityResult.partialObjectStream) {
          sendData('suitabilityAssessment', partial);
        }

        const suitabilityAssessment = await suitabilityResult.object;

        const resumeOptimizationsResult = streamObject({
          model,
          schema: ActionPlanSchema,
          system: `
            You are a season career coach providing actionable advice to improve a candidate's resume.
            
            Your recommendations should be based on comparing the candidate's resume to the job description.

            Your priority is to help the candidate pass the initial screen.

            Ground your recommendations on the candidate's particular skills and experience, and a pre-determined suitability assessment.
          `,
          prompt: `
          RESUME:
          ${resumeText}

          JOB DESCRIPTION:
          ${jobDescriptionText}

          SKILLS RADAR CHART DATA:
          ${JSON.stringify(radarChartData, null, 2)}

          CATEGORIZED SKILLS ANALYSIS:
          ${JSON.stringify(categorizedSkills, null, 2)}
          
          SUITABILITY ASSESSMENT:
          ${suitabilityAssessment.suitabilityReasoning}
          `,
        });

        const learningPrioritiesResult = streamObject({
          model,
          schema: ActionPlanSchema,
          system: `
            You are an seasoned career coach helping a candidate prepare for a screening call and potential interview.

            Your task is to generate a list of learning priorities for the candidate.

            Ground your recommendations based on the candidate's resume, their skills, and the job description.
          `,
          prompt: `
            RESUME:
            ${resumeText}

            JOB DESCRIPTION:
            ${jobDescriptionText}

            SKILLS RADAR CHART DATA:
            ${JSON.stringify(radarChartData, null, 2)}

            CATEGORIZED SKILLS ANALYSIS:
            ${JSON.stringify(categorizedSkills, null, 2)}

            SUITABILITY ASSESSMENT:
            ${suitabilityAssessment.suitabilityReasoning}
            `,
        });

        const streamResumeOptimizations = (async () => {
          for await (const partial of resumeOptimizationsResult.partialObjectStream) {
            sendData('resumeOptimizations', partial);
          }
        })();

        const streamLearningPriorities = (async () => {
          for await (const partial of learningPrioritiesResult.partialObjectStream) {
            sendData('learningPriorities', partial);
          }
        })();

        await Promise.all([streamResumeOptimizations, streamLearningPriorities]);

        // Signal completion
        sendData('done', null);
        controller.close();
      } catch (error) {
        console.error('Error in analysis generation:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', data: 'Failed to generate analysis' })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
