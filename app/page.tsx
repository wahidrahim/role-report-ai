'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import dynamic from 'next/dynamic';
import { ChangeEvent, useState } from 'react';

import { analysisSchema } from '@/schemas/analysisSchema';
import { useResumeStore } from '@/stores/resumeStore';

const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), { ssr: false });

export default function Home() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  const { object, submit, isLoading, error } = useObject({
    api: '/api/analyze-fit',
    schema: analysisSchema,
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

  return (
    <div>
      <div>
        <ResumeUploader />
      </div>
      <div>
        <textarea
          rows={10}
          cols={50}
          placeholder="Paste job posting URL or job description text here"
          value={jobDescription}
          onChange={handleJobDescriptionChange}
        ></textarea>
      </div>
      <div>
        <button type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Fit'}
        </button>
      </div>
      {validationError && <div style={{ color: 'red', marginTop: '10px' }}>{validationError}</div>}
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </div>
      )}
      {object && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
          <h3>Analysis Results:</h3>
          <div>{JSON.stringify(object, null, 2)}</div>
        </div>
      )}
    </div>
  );
}
