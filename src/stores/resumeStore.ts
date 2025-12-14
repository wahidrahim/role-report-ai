'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SkillAssessment } from '@/agents/schemas/skillAssessment.schema';
import { SuitabilityAssessment } from '@/agents/schemas/suitabilityAssessment.schema';

type ResumeState = {
  resumeText: string;
  resumeFileName: string;
  skillAssessment: SkillAssessment | null;
  suitabilityAssessment: SuitabilityAssessment | null;
  setResumeText: (text: string) => void;
  setResumeFileName: (fileName: string) => void;
  setSkillAssessment: (assessment: SkillAssessment | null) => void;
  setSuitabilityAssessment: (assessment: SuitabilityAssessment | null) => void;
  clearResumeText: () => void;
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumeText: '',
      resumeFileName: '',
      skillAssessment: null,
      suitabilityAssessment: null,

      setResumeText: (text: string) => set({ resumeText: text }),
      setResumeFileName: (fileName: string) => set({ resumeFileName: fileName }),
      setSkillAssessment: (assessment: SkillAssessment | null) =>
        set({ skillAssessment: assessment }),
      setSuitabilityAssessment: (assessment: SuitabilityAssessment | null) =>
        set({ suitabilityAssessment: assessment }),
      clearResumeText: () =>
        set({
          resumeText: '',
          resumeFileName: '',
          skillAssessment: null,
          suitabilityAssessment: null,
        }),
    }),
    {
      name: 'resume-storage', // unique name for localStorage key
    },
  ),
);
