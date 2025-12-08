'use client';

import dynamic from 'next/dynamic';
import { ChangeEvent, useState } from 'react';

// Dynamically import ResumeUploader with SSR disabled
const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), {
  ssr: false,
});

export default function Home() {
  const [jobDescription, setJobDescription] = useState<string>('');

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Job description:', jobDescription);
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
        <button type="button" onClick={handleSubmit}>
          analyze
        </button>
      </div>
    </div>
  );
}
