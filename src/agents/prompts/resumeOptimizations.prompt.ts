import { Prompt } from 'ai';

import {
  CategorizedSkills,
  RadarChartData,
  SuitabilityAssessment,
} from '@/app/api/analyze/schemas';

export const resumeOptimizationsPrompt = (
  resumeText: string,
  jobDescriptionText: string,
  radarChartData: RadarChartData,
  categorizedSkills: CategorizedSkills,
  suitabilityAssessment: SuitabilityAssessment,
): Prompt => ({
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
