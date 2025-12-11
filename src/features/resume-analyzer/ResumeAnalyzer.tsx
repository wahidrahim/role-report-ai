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
import { useResumeStore } from '@/stores/resumeStore';

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

  const { object: radarChartData, submit, isLoading, error } = useRadarChart();

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescriptionText(e.target.value);
    setValidationError(null);
  };

  const handleAnalyze = async () => {
    submit({
      resumeText,
      jobDescriptionText,
    });
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

      {
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>{radarChartData && <SkillsRadarChart data={radarChartData} />}</CardContent>
        </Card>
      }

      {/* {object && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {object.matchScore && object.verdict && (
              <MatchScore matchScore={object.matchScore} verdict={object.verdict} />
            )}

            {object.radarChart && (
              <SkillsRadarChart skills={object.radarChart as SkillChartItem[]} />
            )}

            {object.radarChart && object.skillAudit && <Separator className="my-4" />}

            {object.skillAudit && (
              <SkillAudit audit={object.skillAudit as SkillAuditProps['audit']} />
            )}

            {object.skillAudit && object.actionPlan && <Separator className="my-4" />}

            {object.actionPlan && (
              <ActionPlan actionPlan={object.actionPlan as ActionPlanProps['actionPlan']} />
            )}
          </CardContent>
        </Card>
      )} */}
      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(radarChartData, null, 2)}
      </pre>
    </div>
  );
}
