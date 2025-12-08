'use client';

import dynamic from 'next/dynamic';
import { ChangeEvent, useState } from 'react';

import { useResumeStore } from '@/stores/resumeStore';

const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), { ssr: false });

export default function Home() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!resumeText) {
      setError('Please upload a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCompletion('');

    try {
      const response = await fetch('/api/analyze-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to analyze fit' }));
        throw new Error(errorData.error || 'Failed to analyze fit');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        setCompletion((prev) => prev + chunk);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      {completion && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
          <h3>Analysis Results:</h3>
          <div>{completion}</div>
        </div>
      )}
    </div>
  );
}
