import { Prompt } from 'ai';

import {
  CategorizedSkills,
  RadarChartData,
  SuitabilityAssessment,
} from '@/app/api/analyze/schemas';

export const learningPrioritiesPrompt = (
  resumeText: string,
  jobDescriptionText: string,
  radarChartData: RadarChartData,
  categorizedSkills: CategorizedSkills,
  suitabilityAssessment: SuitabilityAssessment,
): Prompt => ({
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
