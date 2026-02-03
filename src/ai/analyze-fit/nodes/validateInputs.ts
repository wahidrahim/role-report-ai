import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { z } from 'zod';

import { models } from '@/ai/config';

export const inputValidationSchema = z.object({
  resumeIsValid: z.boolean().describe('True if the text appears to be an actual resume'),
  resumeReason: z.string().describe('Brief explanation of why the resume is valid or invalid'),
  jobDescriptionIsValid: z
    .boolean()
    .describe('True if the text appears to be an actual job posting'),
  jobDescriptionReason: z
    .string()
    .describe('Brief explanation of why the job description is valid or invalid'),
});

export type InputValidation = z.infer<typeof inputValidationSchema>;

type ValidateInputsState = {
  resumeText: string;
  jobDescriptionText: string;
};

export const validateInputs = async (
  state: ValidateInputsState,
  config: LangGraphRunnableConfig,
) => {
  const { resumeText, jobDescriptionText } = state;

  const { object } = await generateObject({
    model: models.fast,
    schema: inputValidationSchema,
    abortSignal: config.signal,
    system: `You are an input validator. Determine if the provided texts are actually a resume and a job description.

RESUME VALIDATION:
- Valid: Contains professional info (work experience, education, skills, contact info)
- Invalid: Random text, articles, code, or unrelated content

JOB DESCRIPTION VALIDATION:
- Valid: Describes a job opening (title, responsibilities, requirements, qualifications)
- Invalid: Random text, a resume, articles, code, or unrelated content

Provide brief reasons (1-2 sentences) for each validation result.`,
    prompt: `RESUME TEXT:
${resumeText}

JOB DESCRIPTION TEXT:
${jobDescriptionText}`,
  });

  if (!object.resumeIsValid && !object.jobDescriptionIsValid) {
    throw new Error(
      `Invalid inputs: Resume - ${object.resumeReason}. Job Description - ${object.jobDescriptionReason}`,
    );
  }

  if (!object.resumeIsValid) {
    throw new Error(`Invalid resume: ${object.resumeReason}`);
  }

  if (!object.jobDescriptionIsValid) {
    throw new Error(`Invalid job description: ${object.jobDescriptionReason}`);
  }

  return {};
};
