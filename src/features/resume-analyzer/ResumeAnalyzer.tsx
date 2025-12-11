'use client';

import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ChangeEvent, useState } from 'react';

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
import { Textarea } from '@/core/components/ui/textarea';
import { useRadarChart } from '@/features/radar-chart/useRadarChart';
import { useAuditSkills } from '@/features/skill-audit/useAuditSkills';
import { useResumeStore } from '@/stores/resumeStore';

import SkillAudit from './components/SkillAudit';
import SkillsRadarChart from './components/SkillsRadarChart';

const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), { ssr: false });

export default function ResumeAnalyzer() {
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  // const {
  //   object,
  //   jobDescription,
  //   validationError,
  //   isLoading,
  //   error,
  //   handleJobDescriptionChange,
  //   handleSubmit,
  // } = useAnalyzeFit();

  const {
    object: radarChartData,
    submit: submitRadarChart,
    isLoading: isLoadingRadarChart,
    error: radarChartError,
  } = useRadarChart();
  const {
    object: skillAuditData,
    submit: submitSkillAudit,
    isLoading: isLoadingSkillAudit,
    error: skillAuditError,
  } = useAuditSkills();

  const isLoading = isLoadingRadarChart || isLoadingSkillAudit;
  const error = radarChartError || skillAuditError;

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescriptionText(e.target.value);
    setValidationError(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText) {
      setValidationError('Please upload a resume first');
      return;
    }

    if (!jobDescriptionText.trim()) {
      setValidationError('Please enter a job description');
      return;
    }

    setValidationError(null);
    submitRadarChart({ resumeText, jobDescriptionText });
    submitSkillAudit({ resumeText, jobDescriptionText });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
          <CardDescription>Upload your resume to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUploader />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Paste job posting URL or job description text here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              rows={10}
              placeholder="Paste job posting URL or job description text here"
              value={jobDescriptionText}
              onChange={handleJobDescriptionChange}
              className="field-sizing-fixed resize-none"
            />
          </div>
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Fit'}
          </Button>
        </CardContent>
      </Card>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {radarChartData && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsRadarChart data={radarChartData} />
          </CardContent>
        </Card>
      )}

      {skillAuditData && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Audit</CardTitle>
            <CardDescription>Detailed breakdown of skills match</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillAudit data={skillAuditData} />
          </CardContent>
        </Card>
      )}

      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(radarChartData, null, 2)}
        {JSON.stringify(skillAuditData, null, 2)}
      </pre>
    </div>
  );
}
