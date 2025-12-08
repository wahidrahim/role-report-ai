"use client";

import { ChangeEvent, useState } from "react";

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Resume file:", resumeFile);
    console.log("Job description:", jobDescription);
  };

  return (
    <div>
      <div>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
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
