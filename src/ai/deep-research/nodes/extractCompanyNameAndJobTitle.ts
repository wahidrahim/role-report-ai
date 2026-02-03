import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { z } from 'zod';

import { models } from '@/ai/config';
import { emitNodeEnd, emitNodeStart } from '@/ai/deep-research/events';
import type { DeepResearchState } from '@/ai/deep-research/state';

export const extractCompanyNameAndJobTitleSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  unableToExtract: z.boolean(),
});

export type ExtractCompanyNameAndJobTitle = z.infer<typeof extractCompanyNameAndJobTitleSchema>;

export const extractCompanyNameAndJobTitle = async (
  state: DeepResearchState,
  config: LangGraphRunnableConfig,
) => {
  console.log('[NODE] extracting company name and job title');
  emitNodeStart(config, {
    node: 'EXTRACT_COMPANY_NAME_AND_JOB_TITLE',
    message: 'Extracting company name and job title...',
  });

  const { jobDescription } = state;
  const { object } = await generateObject({
    model: models.balanced,
    schema: extractCompanyNameAndJobTitleSchema,
    abortSignal: config.signal,
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' },
      },
    },
    system: `
    You extract the hiring company name and the job title from a job description.

    Your outputs are used downstream for research, so accuracy and specificity matter more than always returning something.

    OUTPUT (STRICT):
    - Return VALID JSON that matches the provided schema exactly.
    - Always return all 3 keys: companyName, jobTitle, unableToExtract (no extra keys).

    OUTPUT FIELDS:
    - companyName: the full hiring company name (as written in the posting)
    - jobTitle: the most specific, canonical title for the role
    - unableToExtract: true if either field cannot be determined with high confidence

    EXTRACT FIRST (preferred):
    - If the job description explicitly contains a company name and/or job title, copy them exactly (do not paraphrase).

    COMPANY NAME RULES:
    - Use the hiring company (not a staffing/agency name) when the posting distinguishes them (e.g., "Our client, X" => X).
    - Include suffixes if present (Inc., Ltd., LLC, GmbH, etc.).
    - Do not guess the company from vague hints (e.g., "Fortune 100", "leading fintech").
    - If multiple companies appear and the hiring company is ambiguous, set unableToExtract to true.

    JOB TITLE RULES (be maximally specific and accurate):
    - Use the exact title from the posting when present.
    - If the posting does not state a title but the role is clearly implied, extract a title using only evidence in the text.
    - The title should include seniority/level and specialization when supported (e.g., "Senior Machine Learning Engineer, Recommender Systems", not "Engineer" or "ML Role").
    - Do NOT include company name, location, remote/hybrid, contract type, or compensation in the title.
    - Prefer the primary role if multiple levels/titles are listed (choose the best match for the described responsibilities).

    FAILURE CONDITIONS:
    - If you cannot confidently determine BOTH a companyName and jobTitle, set unableToExtract to true and return empty strings for companyName and jobTitle.
  `,
    prompt: `
    Extract the hiring company name and job title from the job description below.

    JOB DESCRIPTION:
    ${jobDescription}
  `,
  });

  if (object.unableToExtract) {
    return {
      companyName: null,
      jobTitle: null,
    };
  }

  emitNodeEnd(config, {
    node: 'EXTRACT_COMPANY_NAME_AND_JOB_TITLE',
    message: `Company: ${object.companyName}, Job Title: ${object.jobTitle}`,
    data: {
      companyName: object.companyName,
      jobTitle: object.jobTitle,
    },
  });

  return {
    companyName: object.companyName,
    jobTitle: object.jobTitle,
  };
};
