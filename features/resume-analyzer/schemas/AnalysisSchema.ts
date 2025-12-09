import { z } from 'zod';

const RadarPoint = z.object({
  axis: z
    .string()
    .describe("Technical skill or competency (e.g. 'System Design', 'React Ecosystem')"),
  requiredLevel: z.number().min(0).max(100).describe('Required competency level (0-100)'),
  userLevel: z.number().min(0).max(100).describe("Candidate's competency level (0-100)"),
  reasoning: z.string().describe('Brief justification for this score'),
});

const SkillAudit = z.object({
  verified: z
    .array(
      z.object({
        skill: z.string(),
        evidence: z.string().describe('Quote or metric from resume proving this.'),
      }),
    )
    .describe('Direct matches found in the resume.'),
  missing: z
    .array(
      z.object({
        skill: z.string(),
        importance: z.enum(['critical', 'niceToHave']),
      }),
    )
    .describe('Requirements with zero evidence in resume.'),
  transferable: z
    .array(
      z.object({
        missingSkill: z.string().describe('The job requirement the candidate lacks (e.g., React)'),
        candidateSkill: z
          .string()
          .describe('The skill the candidate has that bridges the gap (e.g., Vue)'),
        reasoning: z.string().describe('Why these are equivalent (e.g., "Both use Virtual DOM")'),
      }),
    )
    .describe('Skills that are not direct matches but show capability.'),
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
      "Bullet points analyzing the 'vibe' and major gaps before committing to structured data.",
    ),

  // STEP 2: EVIDENCE GATHERING (The Audit)
  skillAudit: SkillAudit.describe('Comprehensive breakdown of technical fit.'),

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
