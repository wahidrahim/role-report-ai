'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, useState } from 'react';

import { RadarChartDataSchema } from '@/features/radar-chart/schema';
import { useResumeStore } from '@/stores/resumeStore';

export function useRadarChart() {
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate-radar-chart',
    schema: RadarChartDataSchema,
  });

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescriptionText(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    console.log({ resumeText, jobDescriptionText });

    // Validate inputs
    if (!resumeText) {
      setValidationError('Please upload a resume first');
      return;
    }

    if (!jobDescriptionText.trim()) {
      setValidationError('Please enter a job description');
      return;
    }

    setValidationError(null);
    submit({
      resumeText,
      jobDescriptionText,
    });
  };

  return {
    object,
    jobDescriptionText,
    setJobDescriptionText,
    validationError,
    isLoading,
    error,
    handleJobDescriptionChange,
    handleSubmit,
  };
}
