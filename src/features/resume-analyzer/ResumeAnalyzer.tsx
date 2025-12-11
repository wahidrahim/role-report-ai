'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ChangeEvent, useEffect, useState } from 'react';

import { AnalyzeSchema } from '@/app/api/analyze/AnalyzeSchema';
import { CategorizedSkillsSchema } from '@/app/api/categorize-skills/route';
import { RadarChartDataSchema } from '@/app/api/generate-radar-chart-data/route';
import { SuitabilityAssessmentSchema } from '@/app/api/suitability-assessment/route';
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
import { useResumeStore } from '@/stores/resumeStore';

import MatchScore from './components/MatchScore';
import { SkillAudit } from './components/SkillAudit';
import { SkillsRadarChart } from './components/SkillsRadarChart';

const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), { ssr: false });

export default function ResumeAnalyzer() {
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();
  const [isChartDataComplete, setIsChartDataComplete] = useState(false);
  const [isCategorizedSkillsComplete, setIsCategorizedSkillsComplete] = useState(false);
  const [isSuitabilityAssessmentSubmitted, setIsSuitabilityAssessmentSubmitted] = useState(false);

  const chartData = useObject({
    api: '/api/generate-radar-chart-data',
    schema: RadarChartDataSchema,
    onFinish: () => setIsChartDataComplete(true),
  });

  const categorizedSkills = useObject({
    api: '/api/categorize-skills',
    schema: CategorizedSkillsSchema,
    onFinish: () => setIsCategorizedSkillsComplete(true),
  });

  const suitabilityAssessment = useObject({
    api: '/api/suitability-assessment',
    schema: SuitabilityAssessmentSchema,
  });

  const isLoading =
    chartData.isLoading || categorizedSkills.isLoading || suitabilityAssessment.isLoading;
  const error = chartData.error || categorizedSkills.error || suitabilityAssessment.error;

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
    chartData.submit({ resumeText, jobDescriptionText });
    categorizedSkills.submit({ resumeText, jobDescriptionText });
  };

  // Submit suitability assessment after both analyses complete
  useEffect(() => {
    if (
      isChartDataComplete &&
      isCategorizedSkillsComplete &&
      suitabilityAssessment.isLoading === false &&
      suitabilityAssessment.object === undefined
    ) {
      suitabilityAssessment.submit({
        resumeText,
        jobDescriptionText,
        chartData: chartData.object,
        categorizedSkills: categorizedSkills.object,
      });
    }
  }, [
    categorizedSkills.object,
    chartData.object,
    isCategorizedSkillsComplete,
    isChartDataComplete,
    jobDescriptionText,
    resumeText,
    suitabilityAssessment,
  ]);

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

      {suitabilityAssessment.object?.suitabilityScore?.toString() &&
        suitabilityAssessment.object?.suitabilityReasoning && (
          <Card>
            <CardHeader>
              <CardTitle>Fit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchScore
                matchScore={suitabilityAssessment.object.suitabilityScore}
                verdict={suitabilityAssessment.object.suitabilityReasoning}
              />
            </CardContent>
          </Card>
        )}

      {chartData.object && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsRadarChart data={chartData.object.data} />
          </CardContent>
        </Card>
      )}

      {categorizedSkills.object && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Audit</CardTitle>
            <CardDescription>Detailed breakdown of skills match</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillAudit skills={categorizedSkills.object.skills} />
          </CardContent>
        </Card>
      )}

      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md overflow-auto">
        {JSON.stringify(chartData.object, null, 2)}
      </pre>
    </div>
  );
}
