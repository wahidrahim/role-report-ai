'use server';

import { createStreamableUI, createStreamableValue } from 'ai/rsc';

import { generateRadarChart } from '@/features/radar-chart/generateRadarChart';
import SkillAudit from '@/features/skill-audit/SkillAudit';
import { auditSkills } from '@/features/skill-audit/auditSkills';

export async function analyzeWithStreamableUI(resumeText: string, jobDescriptionText: string) {
  const auditUI = createStreamableUI(<SkillAudit data={[]} />);
  const radarData = createStreamableValue({ skills: [] });

  // Start auditing skills
  (async () => {
    try {
      const { partialObjectStream } = await auditSkills({
        resumeText,
        jobDescriptionText,
      });

      for await (const partialObject of partialObjectStream) {
        auditUI.update(<SkillAudit data={partialObject as any} />);
      }

      auditUI.done();
    } catch (error) {
      console.error('Error in audit skills stream:', error);
      auditUI.error(error);
    }
  })();

  // Start generating radar chart
  (async () => {
    try {
      const { partialObjectStream } = await generateRadarChart({
        resumeText,
        jobDescriptionText,
      });

      for await (const partialObject of partialObjectStream) {
        radarData.update(partialObject as any);
      }

      radarData.done();
    } catch (error) {
      console.error('Error in radar chart stream:', error);
      radarData.error(error);
    }
  })();

  return {
    audit: auditUI.value,
    radar: radarData.value,
  };
}

