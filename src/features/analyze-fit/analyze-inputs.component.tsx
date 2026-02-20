import type { ChangeEvent } from 'react';

import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Alert, AlertDescription, AlertTitle } from '@/core/components/ui/alert';
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

      {validationError && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
