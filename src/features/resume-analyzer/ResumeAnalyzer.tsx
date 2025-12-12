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
import { Spinner } from '@/core/components/ui/spinner';
import { Textarea } from '@/core/components/ui/textarea';
import { useResumeStore } from '@/stores/resumeStore';

import MatchScore from './components/MatchScore';
import { SkillAudit } from './components/SkillAudit';
import { SkillsRadarChart } from './components/SkillsRadarChart';
import { useAnalysis } from './hooks/useAnalysis';

const ResumeUploader = dynamic(() => import('./components/ResumeUploader'), { ssr: false });

export default function ResumeAnalyzer() {
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resumeText } = useResumeStore();

  const {
    radarChart,
    categorizedSkills,
    suitabilityAssessment,
    resumeOptimizations,
    learningPriorities,
    isLoading,
    error,
    analyze,
  } = useAnalysis();

  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescriptionText(e.target.value);
    setValidationError(null);
  };

  const handleAnalyze = () => {
    if (!resumeText) {
      setValidationError('Please upload a resume first');
      return;
    }

    if (!jobDescriptionText.trim()) {
      setValidationError('Please enter a job description');
      return;
    }

    setValidationError(null);
    analyze(resumeText, jobDescriptionText);
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
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        {suitabilityAssessment?.suitabilityScore !== undefined &&
          suitabilityAssessment?.suitabilityReasoning && (
            <>
              <CardHeader>
                <CardTitle>Fit Score</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchScore
                  matchScore={suitabilityAssessment?.suitabilityScore}
                  verdict={suitabilityAssessment?.suitabilityReasoning}
                />
              </CardContent>
            </>
          )}
        {isLoading && (
          <CardContent>
            <Spinner />
          </CardContent>
        )}
      </Card>

      {radarChart?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsRadarChart data={radarChart.data} />
          </CardContent>
        </Card>
      )}

      {categorizedSkills?.skills && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Audit</CardTitle>
            <CardDescription>Detailed breakdown of skills match</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillAudit skills={categorizedSkills.skills} />
          </CardContent>
        </Card>
      )}

      {resumeOptimizations?.plan && (
        <Card>
          <CardHeader>
            <CardTitle>Resume Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {resumeOptimizations.plan.map((item) => (
                <li key={`resume-optimization-${item.title}`}>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.priority}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {learningPriorities?.plan && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {learningPriorities.plan.map((item) => (
                <li key={`learning-priority-${item.title}`}>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.priority}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
