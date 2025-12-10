import { z } from 'zod';

const RadarPoint = z.object({
  axis: z
    .string()
    .describe("The technical dimension (e.g. 'Cloud Infra'). EXCLUDE Location/Visa/Education."),
  requiredLevel: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Required competency level (0-100), 90=Expert/Lead, 70=Senior/Proficient, 50=Familiarity',
    ),
  candidateLevel: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Candidate's competency level (0-100), 90=Mastery, 70=Strong, 50=Familiarity, 0=No Evidence",
    ),
  reasoning: z.string().describe('Brief justification for this score'),
});

const SkillItem = z.object({
  skill: z
    .string()
    .describe(
      'The specific TECHNICAL skill, tool, or methodology (e.g. "React", "Agile", "System Design"). DO NOT include logistical requirements like Location, Citizenship, Degree, or Salary.',
    ),
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
    .describe(
      'If "verified"/"transferable": the exact skill/phrase found in resume. If "missing": use exactly "none".',
    ),
  reasoning: z.string().describe('Brief evidence or mapping logic.'),
});

const ThoughtStep = z.object({
  phase: z
    .enum([
      'initial_assessment',
      'experience_analysis',
      'skill_gap_analysis',
      'transferability_evaluation',
      'criticality_assessment',
      'temporal_analysis',
      'final_synthesis',
    ])
    .describe('The cognitive phase of this reasoning step.'),
  thought: z.string().describe('The specific thought or analysis performed in this phase.'),
  evidence: z.string().describe('Specific evidence from resume/JD that supports this reasoning.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level in this assessment.'),
  conclusion: z.string().describe('Key takeaway or decision from this step.'),
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
  // 1. THOUGHT PROCESS (The Cognitive Chain)
  thoughtProcess: z
    .array(ThoughtStep)
    .min(5)
    .describe(
      'Structured cognitive analysis following 7 phases: initial_assessment → experience_analysis → skill_gap_analysis → transferability_evaluation → criticality_assessment → temporal_analysis → final_synthesis.',
    ),

  // 2. SKILL AUDIT (The Evidence)
  skillAudit: z.array(SkillItem).describe('Comprehensive breakdown of technical fit.'),

  // 3. RADAR CHART (The Visual Shape)
  radarChart: z
    .array(RadarPoint)
    .min(4)
    .max(8)
    .describe('Extract 4-8 most critical technical dimensions for radar visualization.'),

  // 4. VERDICT (The Qualitative Judgment)
  verdict: z.string().describe("A brutal, 1-sentence summary of the candidate's fit."),

  // 5. MATCH SCORE (The Quantitative Judgment)
  matchScore: z.number().min(0).max(100).describe('Final rating on a 0-100 scale.'),

  // 6. ACTION PLAN (The Solution)
  actionPlan: ActionPlan.describe('Strategic advice to close the identified gaps.'),
});
