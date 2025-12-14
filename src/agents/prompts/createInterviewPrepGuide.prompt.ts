import { SkillAssessment } from '@/agents/schemas/skillAssessment.schema';
import { SuitabilityAssessment } from '@/agents/schemas/suitabilityAssessment.schema';

type CreateInterviewPrepGuidePromptArgs = {
  companyName: string;
  jobTitle: string;
  skillAssessment: SkillAssessment;
  suitabilityAssessment: SuitabilityAssessment;
  searchResults: string[];
};

export const createInterviewPrepGuidePrompt = (args: CreateInterviewPrepGuidePromptArgs) => {
  const { companyName, jobTitle, skillAssessment, suitabilityAssessment, searchResults } = args;
  const gapsList = skillAssessment.skills.filter(
    (skill) => skill.status === 'missing' || skill.status === 'transferable',
  );

  return {
    system: `
      You are a specialized Technical Interview Coach. 
      Your goal is to prepare a candidate for a ${jobTitle} role at ${companyName}.

      *** INPUT CONTEXT ***
      CANDIDATE WEAKNESSES: ${gapsList}
      SUITABILITY ASSESSMENT: ${suitabilityAssessment.suitabilityReasoning}

      DEEP RESEARCH INTEL (Raw Search Data):
      ${searchResults.join('\n\n')} 

      *** INSTRUCTION PROTOCOL ***
      1. ANALYZE INTERVIEW STYLE: 
         - Scan the research for keywords like "HackerRank", "Take-home", "Whiteboard", "System Design".
         - Predict the most likely format.

      2. BRIDGE THE GAPS (CRITICAL):
         - For every candidate weakness, check the research to see how the company implements that technology.
         - IF data is found: Create a specific "Crash Course" connecting the missing skill to their specific stack.
         - IF data is missing: Provide a general "Best Practice" tip relevant to their industry scale.
         - Example: If User lacks "Redis" and Company is "Twitter", explain "Redis Clusters for Caching at Scale".

      3. GENERATE THE "SILVER BULLET":
         - Find a specific engineering challenge they blogged about (e.g. "We migrated to Rust").
         - Write a question that makes the candidate look like they read the engineering blog religiously.
    `,
    prompt: `Generate the personalized interview prep guide.`,
  };
};
