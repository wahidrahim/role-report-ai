import { Prompt } from 'ai';

import { RadarChart } from '@/agents/schemas/radarChart.schema';
import { SkillAssessment } from '@/agents/schemas/skillAssessment.schema';
import { SuitabilityAssessment } from '@/agents/schemas/suitabilityAssessment.schema';

export const learningPrioritiesPrompt = (
  resumeText: string,
  jobDescriptionText: string,
  radarChart: RadarChart,
  skillAssessment: SkillAssessment,
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
    ${JSON.stringify(radarChart, null, 2)}

    SKILL ASSESSMENT:
    ${JSON.stringify(skillAssessment, null, 2)}

    SUITABILITY ASSESSMENT:
    ${suitabilityAssessment.suitabilityReasoning}
    `,
});
