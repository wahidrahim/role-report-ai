import { z } from 'zod';

const RadarPoint = z.object({
  axis: z
    .string()
    .describe("Technical skill or competency (e.g. 'System Design', 'React Ecosystem')"),
  requiredLevel: z.number().min(0).max(100).describe('Required competency level (0-100)'),
  candidateLevel: z.number().min(0).max(100).describe("Candidate's competency level (0-100)"),
  reasoning: z.string().describe('Brief justification for this score'),
});

const SkillItem = z.object({
  skill: z.string().describe('The requirement from the job description'),
  status: z
    .enum(['verified', 'transferable', 'missing'])
    .describe(
      '"verified" if explicit evidence found. "transferable" if a strong proxy/competing tech exists. "missing" if neither.',
    ),
  importance: z
    .enum(['critical', 'nice-to-have'])
    .describe('The importance of this skill based on the job description.'),
  resumeMatch: z
    .string()
    .describe('If Verified/Transferable: the specific skill found in resume. If Missing: "None".'),
  reasoning: z.string().describe('Brief evidence or mapping logic.'),
});

const ActionItem = z.object({
  title: z.string(),
  description: z.string().describe('Specific, actionable advice. No generic fluff.'),
  priority: z.enum(['high', 'medium']),
});

const ActionPlan = z.object({
  resumeOptimizations: z
    .array(ActionItem)
    .describe(
      'Immediate edits to the resume text (keywords, re-phrasing) to pass the initial screen.',
    ),
  learningPriorities: z
    .array(ActionItem)
    .describe(
      'High-yield technical topics or concepts the candidate must review immediately to handle a screening call.',
    ),
});

export const AnalysisSchema = z.object({
  // STEP 1: SCRATCHPAD (Hidden from user, used for AI reasoning)
  thoughtProcess: z
    .array(z.string())
    .describe(
      "Bullet points analyzing the 'vibe' and major gaps before committing to structured data.",
    ),

  // STEP 2: EVIDENCE GATHERING (The Audit)
  skillAudit: z.array(SkillItem).describe('Comprehensive breakdown of technical fit.'),

  // STEP 3: SYNTHESIS (The Chart)
  radarChart: z
    .array(RadarPoint)
    .min(3)
    .max(8)
    .describe('Extract the top 3-8 most critical technical dimensions.'),

  // STEP 4: STRATEGY (The Advice)
  actionPlan: ActionPlan.describe('Strategic advice to close the identified gaps.'),

  // STEP 5: FINAL VERDICT (The Score)
  // This comes LAST so it includes all previous context.
  matchScore: z.number().min(0).max(100).describe('Final rating on a 0-100 scale.'),
  verdict: z.string().describe("A brutal, 1-sentence summary of the candidate's fit."),
});
