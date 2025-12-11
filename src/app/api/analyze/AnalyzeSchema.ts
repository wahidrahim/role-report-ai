import { z } from 'zod';

export const AnalyzeSchema = z.object({
  radarChartData: z
    .array(
      z.object({
        skillName: z
          .string()
          .min(1)
          .max(50)
          .describe(
            'The specific hard skill name, grouped where related (e.g. "React & Frontend").',
          ),
        requiredLevel: z
          .number()
          .min(0)
          .max(100)
          .describe(
            '0-100 percentage based on job requirements. 90-100=Expert/Lead, 80-89=Senior, 70-79=Proficient, 60-69=Intermediate, 50-59=Familiar, 30-49=Entry, 0-29=Nice-to-have.',
          ),
        candidateLevel: z
          .number()
          .min(0)
          .max(100)
          .describe(
            '0-100 percentage based on resume EVIDENCE. Be conservative. 90-100=Deep Expertise, 70-79=Strong Working Knowledge, 50-59=Baseline. Do not inflate.',
          ),
        reasoning: z
          .string()
          .min(10)
          .max(300)
          .describe(
            'Brief, concise justification citing specific evidence from the resume. MAX 300 CHARACTERS. Keep it punchy.',
          ),
      }),
    )
    .min(4)
    .max(8)
    .describe(
      'PHASE 1 OUTPUT: 4-8 most critical QUANTIFIABLE TECHNICAL hard skills (programming languages, frameworks, tools, databases). STRICTLY quantitative and objective. EXCLUDE soft skills or subjective traits.',
    ),
  skillAuditData: z.object({
    verified: z
      .array(
        z.object({
          skillName: z
            .string()
            .min(1)
            .max(50)
            .describe(
              'The skill name (hard OR soft) exactly as it appears in the Job Description.',
            ),
          importance: z
            .enum(['critical', 'nice-to-have'])
            .describe(
              'critical = "required"/"must have" deal-breakers. nice-to-have = "preferred"/"plus".',
            ),
          reasoning: z
            .string()
            .min(15)
            .max(300)
            .describe('Cite specific text/evidence from resume. MAX 300 CHARS. Be concise.'),
        }),
      )
      .describe(
        'PHASE 2 OUTPUT: [DIRECT MATCHES] Skills required by the JD where the candidate has this EXACT skill explicitly listed in their resume.',
      ),
    transferable: z
      .array(
        z.object({
          skillName: z
            .string()
            .min(1)
            .max(50)
            .describe(
              'The skill name from the Job Description that the candidate can address via a related skill.',
            ),
          importance: z
            .enum(['critical', 'nice-to-have'])
            .describe('critical = addresses a core requirement. nice-to-have = adds value.'),
          reasoning: z
            .string()
            .min(15)
            .max(300)
            .describe(
              'Explain the logical connection or transferability concisely. MAX 300 CHARS.',
            ),
        }),
      )
      .describe(
        'PHASE 2 OUTPUT: [INDIRECT MATCHES] Skills required by the JD that the candidate does NOT have directly, but has a different skill that is a strong proxy or transferable alternative.',
      ),
    missing: z
      .array(
        z.object({
          skillName: z
            .string()
            .min(1)
            .max(50)
            .describe('The skill name from the Job Description that is completely absent.'),
          importance: z
            .enum(['critical', 'nice-to-have'])
            .describe(
              'critical = missing this is a potential deal-breaker. nice-to-have = missing is acceptable.',
            ),
          reasoning: z
            .string()
            .min(15)
            .max(300)
            .describe('Explain why this gap matters concisely. MAX 300 CHARS.'),
        }),
      )
      .describe(
        'PHASE 2 OUTPUT: [NO MATCHES] Skills required by the JD with NO evidence in the resume and NO reasonable transferable alternative.',
      ),
  }),
});
