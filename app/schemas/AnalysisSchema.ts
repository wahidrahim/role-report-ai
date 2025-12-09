import { z } from 'zod';

const RadarPoint = z.object({
  axis: z
    .string()
    .describe("Technical skill or competency (e.g. 'System Design', 'React Ecosystem')"),
  value: z.number().min(0).max(10).describe("Candidate's competency level (0-100)"),
  reasoning: z.string().describe('Brief justification for this score'),
});

const SkillAuditItem = z.object({
  skill: z.string().describe('The specific requirement from the JD'),
  status: z
    .enum(['verified', 'transferable', 'missing'])
    .describe("Verdict on the candidate's proficiency"),
  evidence: z
    .string()
    .optional()
    .describe('Direct quote from resume (if verified) or reasoning (if transferable/missing)'),
  importance: z.enum(['critical', 'niceToHave']),
});

const ActionItem = z.object({
  title: z.string(),
  description: z.string().describe('Specific, actionable advice. No generic fluff.'),
  priority: z.enum(['high', 'medium']),
});

export const AnalysisSchema = z.object({
  // STEP 1: SCRATCHPAD (Hidden from user, used for AI reasoning)
  thoughtProcess: z
    .array(z.string())
    .describe(
      "3-5 bullet points analyzing the 'vibe' and major gaps before committing to structured data.",
    ),

  // STEP 2: EVIDENCE GATHERING (The Audit)
  skillAudit: z
    .array(SkillAuditItem)
    .describe('A comprehensive extraction of every technical requirement and its status.'),

  // STEP 3: SYNTHESIS (The Chart)
  radarChart: z
    .array(RadarPoint)
    .min(3)
    .max(8)
    .describe('Extract the top 3-8 most critical technical dimensions.'),

  // STEP 4: STRATEGY (The Advice)
  actionPlan: z.array(ActionItem).describe('Strategic advice to close the identified gaps.'),

  // STEP 5: FINAL VERDICT (The Score)
  // This comes LAST so it includes all previous context.
  matchScore: z.number().min(0).max(100).describe('Final rating on a 0-100 scale.'),
  verdict: z.string().describe("A brutal, 1-sentence summary of the candidate's fit."),
});
