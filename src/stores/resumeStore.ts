'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ResumeState = {
  resumeText: string;
  resumeFileName: string;
  setResumeText: (text: string) => void;
  setResumeFileName: (fileName: string) => void;
  clearResumeText: () => void;
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumeText: '',
      resumeFileName: '',

      setResumeText: (text: string) => set({ resumeText: text }),
      setResumeFileName: (fileName: string) => set({ resumeFileName: fileName }),
      clearResumeText: () => set({ resumeText: '', resumeFileName: '' }),
    }),
    {
      name: 'resume-storage', // unique name for localStorage key
    },
  ),
);
