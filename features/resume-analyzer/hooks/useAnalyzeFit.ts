'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, useState } from 'react';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';
import { useResumeStore } from '@/stores/resumeStore';

const testObject = {
  thoughtProcess: [
    'The candidate has strong experience in TypeScript and Vue.js but lacks direct experience with React, which is a critical requirement for the role.',
    "The job description emphasizes GraphQL expertise, which is not evidenced in the candidate's resume.",
    'The candidate has experience with state management using Vuex but does not mention Redux or similar tools, which is a requirement.',
    "The candidate's experience with clean code principles is implied but not explicitly stated in relation to SOLID principles, which are critical for this role.",
    'Overall, the candidate has a solid foundation but misses key requirements, particularly in React and GraphQL.',
  ],
  skillAudit: [
    {
      skill: 'TypeScript',
      status: 'verified',
      evidence:
        'Strong experience with TypeScript in multiple projects, including Nuxt.js and Vue.js applications.',
      importance: 'critical',
    },
    {
      skill: 'Vue.js or React',
      status: 'verified',
      evidence: 'Solid hands-on experience in Vue.js as evidenced by multiple projects and roles.',
      importance: 'critical',
    },
    {
      skill: 'GraphQL',
      status: 'missing',
      evidence: 'No mention of GraphQL experience in the resume.',
      importance: 'critical',
    },
    {
      skill: 'State Management Solutions (Redux, Vuex, etc.)',
      status: 'verified',
      evidence: 'Experience with Vuex for state management in Vue.js applications.',
      importance: 'critical',
    },
    {
      skill: 'Agile Environment',
      status: 'verified',
      evidence: 'Worked within Agile teams and participated in scrums.',
      importance: 'niceToHave',
    },
    {
      skill: 'Clean Code Principles (SOLID)',
      status: 'missing',
      evidence: 'No explicit mention of SOLID principles in the resume.',
      importance: 'critical',
    },
    {
      skill: 'Frontend Security Best Practices',
      status: 'missing',
      evidence: 'No mention of awareness or experience with frontend security issues.',
      importance: 'niceToHave',
    },
  ],
  radarChart: [
    {
      axis: 'TypeScript',
      value: 90,
      reasoning: 'Strong experience with TypeScript in various projects.',
    },
    {
      axis: 'Vue.js',
      value: 85,
      reasoning: 'Extensive hands-on experience with Vue.js in multiple roles.',
    },
    {
      axis: 'GraphQL',
      value: 0,
      reasoning: 'No evidence of experience with GraphQL.',
    },
    {
      axis: 'State Management',
      value: 80,
      reasoning: 'Experience with Vuex, but lacks knowledge of Redux.',
    },
    {
      axis: 'Agile Methodologies',
      value: 75,
      reasoning: 'Experience in Agile teams, but no leadership roles mentioned.',
    },
    {
      axis: 'Clean Code Principles',
      value: 50,
      reasoning:
        'Implied understanding of clean code, but no explicit mention of SOLID principles.',
    },
  ],
  actionPlan: [
    {
      title: 'Gain Experience with React',
      description:
        'Engage in projects or courses that focus on React to build a solid foundation and practical experience.',
      priority: 'high',
    },
    {
      title: 'Learn GraphQL',
      description:
        'Take online courses or work on projects that involve GraphQL to meet the job requirements.',
      priority: 'high',
    },
    {
      title: 'Study SOLID Principles',
      description:
        "Review and practice SOLID principles in coding to align with the job's clean coding expectations.",
      priority: 'medium',
    },
    {
      title: 'Familiarize with Frontend Security Best Practices',
      description:
        'Research common web security issues and how to mitigate them in frontend development.',
      priority: 'medium',
    },
  ],
  matchScore: 60,
  verdict:
    'The candidate has a solid foundation in TypeScript and Vue.js but lacks critical experience in React and GraphQL, making them a weak match for the role.',
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
