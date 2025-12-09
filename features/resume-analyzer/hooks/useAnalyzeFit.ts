'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, useState } from 'react';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';
import { useResumeStore } from '@/stores/resumeStore';

const testObject = {
  thoughtProcess: [
    'The candidate has strong experience in TypeScript and Vue.js, which aligns well with the job requirements.',
    'The job description emphasizes GraphQL expertise, which is not explicitly mentioned in the resume.',
    'The candidate has experience with state management using Vuex, but there is no evidence of experience with Redux or Zustand, which are also mentioned in the job description.',
    "The candidate has demonstrated clean coding practices and experience in an agile environment, which matches the job's expectations.",
    'The transition to Next.js is a critical requirement, and the candidate has experience with Nuxt.js, which may provide some transferable skills.',
  ],
  skillAudit: {
    verified: [
      {
        skill: 'TypeScript',
        evidence:
          'Initialized and architected new frontend platform using customized Nuxt.js configurations, JavaScript, TypeScript, SCSS, and Shell scripts.',
      },
      {
        skill: 'Vue.js',
        evidence:
          'Implemented client application features with pixel perfect accuracy from design specifications, using Nuxt.js, Vuex, JavaScript, and SCSS.',
      },
      {
        skill: 'Agile Environment',
        evidence:
          'Worked within an Agile engineering team, participated in scrums, and conducted code reviews.',
      },
    ],
    missing: [
      {
        skill: 'GraphQL',
        importance: 'critical',
      },
      {
        skill: 'Redux or Zustand',
        importance: 'niceToHave',
      },
      {
        skill: 'Next.js',
        importance: 'critical',
      },
      {
        skill: 'Web Security Awareness',
        importance: 'niceToHave',
      },
    ],
    transferable: [
      {
        missingSkill: 'GraphQL',
        candidateSkill: 'REST APIs',
        reasoning:
          'Both are used for data fetching in frontend applications, but GraphQL offers more flexibility in querying.',
      },
      {
        missingSkill: 'Next.js',
        candidateSkill: 'Nuxt.js',
        reasoning:
          'Both frameworks are built on top of React and Vue respectively and share similar concepts in server-side rendering.',
      },
    ],
  },
  radarChart: [
    {
      axis: 'TypeScript',
      requiredLevel: 90,
      userLevel: 80,
      reasoning: 'Strong experience in TypeScript, but not explicitly stated as a primary focus.',
    },
    {
      axis: 'Vue.js',
      requiredLevel: 80,
      userLevel: 90,
      reasoning: 'Extensive experience with Vue.js, exceeding the required level.',
    },
    {
      axis: 'GraphQL',
      requiredLevel: 80,
      userLevel: 0,
      reasoning: 'No evidence of experience with GraphQL.',
    },
    {
      axis: 'State Management',
      requiredLevel: 70,
      userLevel: 80,
      reasoning: 'Experience with Vuex, but no evidence of Redux or Zustand.',
    },
    {
      axis: 'Agile Practices',
      requiredLevel: 70,
      userLevel: 80,
      reasoning: 'Demonstrated experience in an Agile environment.',
    },
    {
      axis: 'Web Security Awareness',
      requiredLevel: 70,
      userLevel: 0,
      reasoning: 'No evidence of awareness of web security issues.',
    },
  ],
  actionPlan: [
    {
      title: 'Learn GraphQL',
      description:
        'Take an online course or tutorial focused on GraphQL to gain practical experience and understanding of its principles.',
      priority: 'high',
    },
    {
      title: 'Familiarize with Next.js',
      description:
        'Build a small project using Next.js to understand its features and differences from Nuxt.js.',
      priority: 'high',
    },
    {
      title: 'Explore Redux or Zustand',
      description:
        'Study state management libraries like Redux or Zustand to enhance knowledge and applicability in future projects.',
      priority: 'medium',
    },
    {
      title: 'Web Security Best Practices',
      description:
        'Research common web security issues and best practices to ensure secure coding practices.',
      priority: 'medium',
    },
  ],
  matchScore: 70,
  verdict:
    'The candidate has strong foundational skills but lacks critical experience with GraphQL and Next.js.',
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
