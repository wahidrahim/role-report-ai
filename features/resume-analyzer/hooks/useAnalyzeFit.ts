'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, useState } from 'react';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';
import { useResumeStore } from '@/stores/resumeStore';

const testObject = {
  thoughtProcess: [
    'The candidate has strong front-end experience, particularly with Vue.js and JavaScript, but lacks direct experience with PHP and Laravel, which are critical for the role.',
    "The candidate's SQL experience is not explicitly mentioned, which is a gap given the job's requirements for solid SQL/RDBMS experience.",
    "The candidate has experience with Git and Agile methodologies, aligning with the job's collaborative environment, but testing fundamentals are not evidenced in the resume.",
    "Overall, the candidate's front-end skills are strong, but the lack of PHP and SQL experience presents significant gaps.",
  ],
  skillAudit: [
    {
      skill: 'PHP framework (Laravel/Symfony)',
      status: 'missing',
      importance: 'critical',
      resumeMatch: 'None',
      reasoning: 'No evidence of PHP or Laravel/Symfony experience in the resume.',
    },
    {
      skill: 'Front-end (Vue.js/React)',
      status: 'verified',
      importance: 'critical',
      resumeMatch: 'Vue.js, React.js',
      reasoning:
        'Candidate has extensive experience with Vue.js and React, meeting the requirement.',
    },
    {
      skill: 'SQL/RDBMS experience',
      status: 'missing',
      importance: 'critical',
      resumeMatch: 'None',
      reasoning: 'No explicit mention of SQL or RDBMS experience in the resume.',
    },
    {
      skill: 'Git workflow',
      status: 'verified',
      importance: 'nice-to-have',
      resumeMatch: 'Git',
      reasoning:
        'Candidate has experience working within an Agile environment, which typically includes Git.',
    },
    {
      skill: 'Testing fundamentals (PHPUnit/Pest, component tests)',
      status: 'missing',
      importance: 'nice-to-have',
      resumeMatch: 'None',
      reasoning: 'No evidence of testing experience or knowledge of PHPUnit/Pest in the resume.',
    },
  ],
  radarChart: [
    {
      axis: 'PHP Framework (Laravel/Symfony)',
      requiredLevel: 90,
      candidateLevel: 0,
      reasoning: 'Candidate has no experience with PHP frameworks.',
    },
    {
      axis: 'Front-end (Vue.js/React)',
      requiredLevel: 80,
      candidateLevel: 80,
      reasoning: 'Candidate has strong experience with Vue.js and React.',
    },
    {
      axis: 'SQL/RDBMS',
      requiredLevel: 70,
      candidateLevel: 0,
      reasoning: 'No evidence of SQL experience.',
    },
    {
      axis: 'Git Workflow',
      requiredLevel: 60,
      candidateLevel: 70,
      reasoning: 'Candidate has experience with Git in Agile environments.',
    },
    {
      axis: 'Testing Fundamentals',
      requiredLevel: 60,
      candidateLevel: 0,
      reasoning: 'No evidence of testing experience.',
    },
  ],
  actionPlan: {
    resumeOptimizations: [
      {
        title: 'Highlight PHP Experience',
        description:
          'If any PHP experience exists, even if minimal, it should be included in the resume to address the critical gap.',
        priority: 'high',
      },
      {
        title: 'Add SQL Experience',
        description:
          'If the candidate has any SQL experience, it should be explicitly mentioned to meet the job requirements.',
        priority: 'high',
      },
      {
        title: 'Include Testing Knowledge',
        description:
          'If the candidate has any knowledge or experience with testing frameworks, it should be added to the resume.',
        priority: 'medium',
      },
    ],
    learningPriorities: [
      {
        title: 'Learn PHP and Laravel',
        description:
          'Focus on gaining foundational knowledge in PHP and Laravel, as these are critical for the role.',
        priority: 'high',
      },
      {
        title: 'Review SQL Concepts',
        description:
          'Study SQL fundamentals, including migrations, indexing, and query tuning, to demonstrate competency in RDBMS.',
        priority: 'high',
      },
      {
        title: 'Familiarize with Testing Frameworks',
        description:
          'Learn about PHPUnit and Pest to understand testing fundamentals relevant to the job.',
        priority: 'medium',
      },
    ],
  },
  matchScore: 45,
  verdict:
    'The candidate has strong front-end skills but lacks critical PHP and SQL experience, making them a weak match for the role.',
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
