'use client';

import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import MatchScore from './components/MatchScore';
import SkillAudit, { SkillAuditProps } from './components/SkillAudit';
import SkillsRadarChart from './components/SkillsRadarChart';
import { useAnalyzeFit } from './hooks/useAnalyzeFit';
import { SkillChartItem } from './types';

const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), { ssr: false });

export default function ResumeAnalyzer() {
  const {
    object,
    jobDescription,
    validationError,
    isLoading,
    error,
    handleJobDescriptionChange,
    handleSubmit,
  } = useAnalyzeFit();

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
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              className="field-sizing-fixed resize-none"
            />
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
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

      {object && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {object?.matchScore && object?.verdict && (
              <MatchScore matchScore={object.matchScore} verdict={object.verdict} />
            )}

            {object.radarChart && (
              <SkillsRadarChart skills={object.radarChart as SkillChartItem[]} />
            )}

            {object.skillAudit && (
              <SkillAudit audit={object.skillAudit as SkillAuditProps['audit']} />
            )}
          </CardContent>
        </Card>
      )}
      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(object, null, 2)}
      </pre>
    </div>
  );
}
