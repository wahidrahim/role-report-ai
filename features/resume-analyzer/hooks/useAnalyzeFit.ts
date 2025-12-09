'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, useState } from 'react';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';
import { useResumeStore } from '@/stores/resumeStore';

const testObject = {
  thoughtProcess: [
    'The candidate has strong experience in TypeScript and Vue.js, which aligns well with the job requirements.',
    'The job description emphasizes a transition to Next.js, which the candidate has not explicitly mentioned experience with, but has related experience in Vue.js and Nuxt.js.',
    "GraphQL knowledge is a critical requirement, but the candidate's resume does not provide evidence of experience with GraphQL, marking it as a gap.",
    'The candidate has experience with state management using Vuex, which is relevant but does not cover the full range of state management tools mentioned in the job description.',
    "The candidate's experience in agile environments is a plus, but there is no mention of specific security best practices, which is a nice-to-have in the job description.",
  ],
  skillAudit: [
    {
      skill: 'TypeScript',
      status: 'verified',
      evidence:
        'Strong experience with TypeScript in multiple projects, including frontend applications.',
      importance: 'critical',
    },
    {
      skill: 'Vue.js or React',
      status: 'verified',
      evidence: 'Solid hands-on experience in Vue.js, with multiple projects listed.',
      importance: 'critical',
    },
    {
      skill: 'GraphQL',
      status: 'missing',
      evidence: 'No evidence of experience with GraphQL in the resume.',
      importance: 'critical',
    },
    {
      skill: 'State Management Solutions',
      status: 'verified',
      evidence: 'Experience with Vuex for state management in applications.',
      importance: 'critical',
    },
    {
      skill: 'Next.js',
      status: 'missing',
      evidence: 'No mention of Next.js experience, only Nuxt.js which is a different framework.',
      importance: 'critical',
    },
    {
      skill: 'Web Security Best Practices',
      status: 'missing',
      evidence: 'No specific mention of awareness or experience with frontend security issues.',
      importance: 'niceToHave',
    },
    {
      skill: 'Agile Environment',
      status: 'verified',
      evidence:
        'Worked within an Agile engineering team, participated in scrums, and conducted code reviews.',
      importance: 'critical',
    },
    {
      skill: 'UI/UX Design',
      status: 'verified',
      evidence: 'Experience in optimizing UI/UX for applications and collaborating with designers.',
      importance: 'niceToHave',
    },
  ],
  radarChart: [
    {
      axis: 'TypeScript',
      requiredLevel: 70,
      userLevel: 80,
      reasoning: 'Candidate has strong experience with TypeScript in multiple projects.',
    },
    {
      axis: 'Vue.js',
      requiredLevel: 70,
      userLevel: 80,
      reasoning: 'Solid hands-on experience in Vue.js, with multiple projects listed.',
    },
    {
      axis: 'State Management',
      requiredLevel: 70,
      userLevel: 80,
      reasoning: 'Experience with Vuex for state management.',
    },
    {
      axis: 'GraphQL',
      requiredLevel: 70,
      userLevel: 0,
      reasoning: 'No evidence of experience with GraphQL.',
    },
    {
      axis: 'Next.js',
      requiredLevel: 70,
      userLevel: 0,
      reasoning: 'No mention of Next.js experience.',
    },
    {
      axis: 'Agile Environment',
      requiredLevel: 70,
      userLevel: 80,
      reasoning: 'Worked within an Agile engineering team.',
    },
  ],
  actionPlan: [
    {
      title: 'Gain Experience with GraphQL',
      description:
        'Engage in projects or courses that focus on GraphQL to build expertise, as it is a critical requirement for the role.',
      priority: 'high',
    },
    {
      title: 'Learn Next.js',
      description:
        'Start a personal project or take a course on Next.js to gain familiarity with the framework, which is essential for the job.',
      priority: 'high',
    },
    {
      title: 'Enhance Knowledge of Web Security Best Practices',
      description:
        'Study common web security issues and best practices to ensure a strong understanding of security in frontend development.',
      priority: 'medium',
    },
  ],
  matchScore: 65,
  verdict:
    'The candidate has strong TypeScript and Vue.js skills but lacks critical experience in GraphQL and Next.js, making them a weak match for the role.',
};

export function useAnalyzeFit() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  const {
    object = testObject,
    submit,
    isLoading,
    error,
  } = useObject({
    api: '/api/analyze-fit',
    schema: AnalysisSchema,
  });

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!resumeText) {
      setValidationError('Please upload a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      setValidationError('Please enter a job description');
      return;
    }

    setValidationError(null);
    submit({
      resumeText,
      jobDescription,
    });
  };

  return {
    object,
    jobDescription,
    setJobDescription,
    validationError,
    isLoading,
    error,
    handleJobDescriptionChange,
    handleSubmit,
  };
}
