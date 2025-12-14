import { streamObject } from 'ai';
import * as z from 'zod';

import { model } from '@/ai/config';

export const radarChartSchema = z.object({
  data: z
    .array(
      z.object({
        skillName: z.string(),
        requiredLevel: z.number().min(0).max(100),
        candidateLevel: z.number().min(0).max(100),
        reasoning: z.string(),
      }),
    )
    .max(8),
});

export type RadarChart = z.infer<typeof radarChartSchema>;

export const skillAssessmentSchema = z.object({
  skills: z.array(
    z.object({
      skillName: z.string(),
      status: z.enum(['verified', 'transferable', 'missing']),
      importance: z.enum(['critical', 'nice-to-have']),
      reasoning: z.string(),
    }),
  ),
});

export type SkillAssessment = z.infer<typeof skillAssessmentSchema>;

export const suitabilityAssessmentSchema = z.object({
  suitabilityScore: z.number().min(0).max(10),
  suitabilityReasoning: z.string(),
});

export type SuitabilityAssessment = z.infer<typeof suitabilityAssessmentSchema>;

export const actionPlanSchema = z.object({
  plan: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    }),
  ),
});

export type ActionPlan = z.infer<typeof actionPlanSchema>;

const encoder = new TextEncoder();

const sendDataFn =
  (controller: ReadableStreamDefaultController) => (type: string, data: unknown) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
  };

export const analyzeFitWorkflow = (
  resumeText: string,
  jobDescriptionText: string,
  abortSignal?: AbortSignal,
) =>
  new ReadableStream({
    start: async (controller) => {
      try {
        // Check if already aborted before starting
        if (abortSignal?.aborted) {
          controller.close();
          return;
        }

        const sendData = sendDataFn(controller);

        const radarChartStream = streamObject({
          model,
          schema: radarChartSchema,
          abortSignal,
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

        const skillAssessmentStream = streamObject({
          model,
          schema: skillAssessmentSchema,
          abortSignal,
          system: `
            You are a SKILLS ASSESSMENT SPECIALIST. Analyze the candidate's fit for a role based solely on evidence from the resume and job description.

            OUTPUT FORMAT: Return a JSON object with a single field \`skills\`, which is a flat array of skill objects. Each skill appears exactly once with its assessed status.

            SKILL OBJECT FIELDS:
            - skillName: Normalized technology name (e.g., "React" not "React.js", "PostgreSQL" not "Postgres")
            - status: "verified" | "transferable" | "missing"
            - importance: "critical" | "nice-to-have"
            - reasoning: Brief evidence-based justification

            STATUS DEFINITIONS:
            - verified: Technology explicitly required AND directly evidenced with hands-on experience
            - transferable: Candidate has a comparable alternative technology (e.g., Vue.js for React requirement)
            - missing: Technology required but not evidenced in resume

            IMPORTANCE:
            - critical: Marked as "required" or "must have" in job description
            - nice-to-have: Marked as "preferred", "plus", or "bonus"

            RULES:
            - Only include CONCRETE TECHNOLOGIES (React, Docker, AWS, PostgreSQL, Kubernetes)
            - Exclude vague concepts (async programming, version control, agile, soft skills)
            - Each skill must have exactly ONE status
            - Provide specific evidence in reasoning
          `,
          prompt: `
            Analyze the job description against the candidate's resume. For each specific technology mentioned in the job description, output a skill object with its status and importance, wrapped in a JSON object under the key \`skills\`.

            RESUME TEXT:
            ${resumeText}

            JOB DESCRIPTION TEXT:
            ${jobDescriptionText}
          `,
        });

        const streamRadarChart = (async () => {
          for await (const partial of radarChartStream.partialObjectStream) {
            sendData('radarChart', partial);
          }
        })();

        const streamSkillAssessment = (async () => {
          for await (const partial of skillAssessmentStream.partialObjectStream) {
            sendData('skillAssessment', partial);
          }
        })();

        await Promise.all([streamRadarChart, streamSkillAssessment]);

        const [radarChart, skillAssessment] = await Promise.all([
          radarChartStream.object,
          skillAssessmentStream.object,
        ]);

        // Check if aborted before starting suitability assessment
        if (abortSignal?.aborted) {
          controller.close();
          return;
        }

        const suitabilityAssessmentStream = streamObject({
          model,
          schema: suitabilityAssessmentSchema,
          abortSignal,
          system: `
            You are an expert technical recruiter conducting a candidate suitability assessment. Your evaluations are fair, evidence-based, and concise.

            ## Input Data
            You will receive:
            1. **Resume** - The candidate's background and qualifications
            2. **Job Description** - Role requirements and responsibilities
            3. **Skills Radar Chart Data** - Required vs. candidate proficiency levels for key skills
            4. **Skill Assessment** - A list of skills with status (verified/transferable/missing), importance, and reasoning

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

            Keep it direct and professional. No fluff or filler phrases.
          `,
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
            ${JSON.stringify(radarChart, null, 2)}

            ---
            ## SKILL ASSESSMENT
            ${JSON.stringify(skillAssessment, null, 2)}
          `,
        });

        for await (const partial of suitabilityAssessmentStream.partialObjectStream) {
          sendData('suitabilityAssessment', partial);
        }

        const suitabilityAssessment = await suitabilityAssessmentStream.object;

        // Check if aborted before starting final streams
        if (abortSignal?.aborted) {
          controller.close();
          return;
        }

        const resumeOptimizationsStream = streamObject({
          model,
          schema: actionPlanSchema,
          abortSignal,
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
            ${JSON.stringify(radarChart, null, 2)}

            SKILL ASSESSMENT:
            ${JSON.stringify(skillAssessment, null, 2)}

            SUITABILITY ASSESSMENT:
            ${suitabilityAssessment.suitabilityReasoning}
          `,
        });
        const learningPrioritiesStream = streamObject({
          model,
          schema: actionPlanSchema,
          abortSignal,
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
            ${JSON.stringify(radarChart, null, 2)}

            SKILL ASSESSMENT:
            ${JSON.stringify(skillAssessment, null, 2)}

            SUITABILITY ASSESSMENT:
            ${suitabilityAssessment.suitabilityReasoning}
            `,
        });

        const streamResumeOptimizations = (async () => {
          for await (const partial of resumeOptimizationsStream.partialObjectStream) {
            sendData('resumeOptimizations', partial);
          }
        })();

        const streamLearningPriorities = (async () => {
          for await (const partial of learningPrioritiesStream.partialObjectStream) {
            sendData('learningPriorities', partial);
          }
        })();

        await Promise.all([streamResumeOptimizations, streamLearningPriorities]);

        sendData('done', null);
        controller.close();
      } catch (error) {
        // Handle abort errors gracefully - these are expected when user navigates away
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Analysis aborted by client');
          controller.close();
          return;
        }

        console.error('Error in analyzeFitWorkflow:', error);
        sendDataFn(controller)(
          'error',
          error instanceof Error ? error.message : 'Failed to generate analysis',
        );
        controller.close();
      }
    },
    cancel() {
      // This is called when the client disconnects
      console.log('Analysis stream cancelled by client');
    },
  });
