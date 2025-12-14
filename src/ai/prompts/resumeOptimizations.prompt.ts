import { Prompt } from 'ai';

import { RadarChart } from '@/agents/schemas/radarChart.schema';
import { SkillAssessment } from '@/agents/schemas/skillAssessment.schema';
import { SuitabilityAssessment } from '@/agents/schemas/suitabilityAssessment.schema';

export const resumeOptimizationsPrompt = (
  resumeText: string,
  jobDescriptionText: string,
  radarChart: RadarChart,
  skillAssessment: SkillAssessment,
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
    ${JSON.stringify(radarChart, null, 2)}

    SKILL ASSESSMENT:
    ${JSON.stringify(skillAssessment, null, 2)}

    SUITABILITY ASSESSMENT:
    ${suitabilityAssessment.suitabilityReasoning}
  `,
});
