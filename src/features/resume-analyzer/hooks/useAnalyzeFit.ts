'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, useState } from 'react';

import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';
import { useResumeStore } from '@/stores/resumeStore';

export function useAnalyzeFit() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  const { object, submit, isLoading, error } = useObject({
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
