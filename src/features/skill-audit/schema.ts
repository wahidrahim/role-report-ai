import { z } from 'zod';

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

export const SkillAuditSchema = z
  .array(SkillItem)
  .describe('Comprehensive breakdown of technical fit.');
