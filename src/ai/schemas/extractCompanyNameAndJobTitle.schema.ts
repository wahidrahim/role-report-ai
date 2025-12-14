import { z } from 'zod';

export const extractCompanyNameAndJobTitleSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  unableToExtract: z.boolean(),
});

export type ExtractCompanyNameAndJobTitle = z.infer<typeof extractCompanyNameAndJobTitleSchema>;
