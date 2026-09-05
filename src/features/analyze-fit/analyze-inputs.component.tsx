import type { ChangeEvent } from 'react';

import dynamic from 'next/dynamic';

import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Label } from '@/core/components/ui/label';
import { Spinner } from '@/core/components/ui/spinner';
import { Textarea } from '@/core/components/ui/textarea';

import { AnalysisErrorAlert } from './components/analysis-error-alert.component';

const ResumeUploader = dynamic(
  () =>
    import('./components/resume-uploader.component').then((mod) => ({ default: mod.ResumeUploader })),
  { ssr: false },
);

type AnalyzeInputsProps = {
  jobDescriptionText: string;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  validationError: string | null;
  error: Error | null;
  resumeFileName: string;
  onResumeChange: (text: string, fileName: string) => void;
  onResumeClear: () => void;
};

export function AnalyzeInputs(props: AnalyzeInputsProps) {
  const {
    jobDescriptionText,
    onJobDescriptionChange,
    onAnalyze,
    isLoading,
    validationError,
    error,
    resumeFileName,
    onResumeChange,
    onResumeClear,
  } = props;

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onJobDescriptionChange(e.target.value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
          <CardDescription>Upload your PDF or DOCX resume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUploader
            resumeFileName={resumeFileName}
            onResumeChange={onResumeChange}
            onClear={onResumeClear}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Paste the job details here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-description">Role Details</Label>
            <Textarea
              id="job-description"
              rows={8}
              placeholder="Paste job posting URL or job description text here..."
              value={jobDescriptionText}
              onChange={handleJobDescriptionChange}
              className="resize-none"
            />
          </div>
          <Button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            {isLoading ? <Spinner /> : 'Analyze'}
          </Button>
        </CardContent>
      </Card>

      {validationError && <AnalysisErrorAlert title="Validation Error" message={validationError} />}

      {error && <AnalysisErrorAlert title="Error" message={error.message} />}
    </div>
  );
}
