'use client';

import { createParser } from 'eventsource-parser';
import { useEffect, useRef, useState } from 'react';

import { ResearchReport } from '@/agents/schemas/researchReport.schema';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { useResumeStore } from '@/stores/resumeStore';

type StreamEvent = {
  id: string;
  event: 'NODE_START' | 'NODE_END' | 'RESEARCH_REPORT_CREATED' | 'RESEARCH_REPORT_STREAM_PARTIAL';
  data?: Partial<{
    node?: string;
    message?: string;
    data?: Record<string, unknown>;
    researchReport?: Partial<ResearchReport>;
  }>;
};

type DeepResearchProps = {
  jobDescriptionText: string;
};

export function DeepResearch({ jobDescriptionText }: DeepResearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [researchReport, setResearchReport] = useState<Partial<ResearchReport> | null>(null);
  const {
    resumeText,
    skillAssessment,
    suitabilityAssessment,
    setSkillAssessment,
    setSuitabilityAssessment,
  } = useResumeStore();
  const prevJobDescriptionRef = useRef<string>(jobDescriptionText);

  // Clear skill data when job description changes
  useEffect(() => {
    if (
      prevJobDescriptionRef.current !== jobDescriptionText &&
      prevJobDescriptionRef.current !== ''
    ) {
      setSkillAssessment(null);
      setSuitabilityAssessment(null);
    }
    prevJobDescriptionRef.current = jobDescriptionText;
  }, [jobDescriptionText, setSkillAssessment, setSuitabilityAssessment]);

  const handleDeepResearch = async () => {
    setIsLoading(true);
    setStreamEvents([]);
    setResearchReport(null);

    try {
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
          skillAssessment,
          suitabilityAssessment,
        }),
      });

      if (!response.ok) {
        throw new Error('Deep research failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const parser = createParser({
        onEvent: (event) => {
          const parsedData = JSON.parse(event.data);
          const newStreamEvent = {
            id: event.id as string,
            event: event.event as
              | 'NODE_START'
              | 'NODE_END'
              | 'RESEARCH_REPORT_CREATED'
              | 'RESEARCH_REPORT_STREAM_PARTIAL',
            data: parsedData,
          };

          setStreamEvents((prev) => [...prev, newStreamEvent]);

          // Update research report from streaming or final event
          if (parsedData.researchReport) {
            setResearchReport(parsedData.researchReport);
          }
        },
      });

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        parser.feed(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error('Deep research error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleDeepResearch}
        disabled={isLoading || !resumeText || !jobDescriptionText}
        className="w-full sm:w-auto"
      >
        {isLoading ? 'Researching...' : 'Deep Research'}
      </Button>
      <div>
        {streamEvents.map((event) => (
          <div key={event.id}>{event.data?.message}</div>
        ))}
      </div>
      {researchReport && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              Research Report
              {isLoading && (
                <Badge variant="secondary" className="ml-2">
                  Streaming...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {researchReport.companyHealth && (
              <div>
                <h3 className="font-semibold mb-2">Company Health</h3>
                {researchReport.companyHealth.status && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        researchReport.companyHealth.status === 'Stable/Growing'
                          ? 'default'
                          : researchReport.companyHealth.status === 'Risky/Layoffs'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {researchReport.companyHealth.status}
                    </Badge>
                  </div>
                )}
                {researchReport.companyHealth.summary && (
                  <p className="text-sm mb-3">{researchReport.companyHealth.summary}</p>
                )}
                {researchReport.companyHealth.redFlags &&
                  researchReport.companyHealth.redFlags.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Red Flags
                      </div>
                      <ul className="space-y-1">
                        {researchReport.companyHealth.redFlags.map((flag, index) => (
                          <li key={index} className="text-sm text-destructive">
                            • {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {researchReport.cultureIntel && (
              <div>
                <h3 className="font-semibold mb-3">Culture Intelligence</h3>
                {researchReport.cultureIntel.keywords &&
                  researchReport.cultureIntel.keywords.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Cultural Values
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {researchReport.cultureIntel.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                {researchReport.cultureIntel.managerVibe && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Manager Vibe
                    </div>
                    <p className="text-sm">{researchReport.cultureIntel.managerVibe}</p>
                  </div>
                )}
                {researchReport.cultureIntel.engineeringCulture && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Engineering Culture
                    </div>
                    <p className="text-sm">{researchReport.cultureIntel.engineeringCulture}</p>
                  </div>
                )}
              </div>
            )}

            {researchReport.interviewPrepGuide && (
              <div>
                <h3 className="font-semibold mb-3">Interview Prep Guide</h3>
                {researchReport.interviewPrepGuide.interviewFormat?.format && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Interview Format</h4>
                    <p className="text-sm font-medium mb-1">
                      {researchReport.interviewPrepGuide.interviewFormat.format}
                    </p>
                    {researchReport.interviewPrepGuide.interviewFormat.rationale && (
                      <p className="text-sm text-muted-foreground">
                        {researchReport.interviewPrepGuide.interviewFormat.rationale}
                      </p>
                    )}
                  </div>
                )}

                {researchReport.interviewPrepGuide.skillGapCrashCourses &&
                  researchReport.interviewPrepGuide.skillGapCrashCourses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-3">Skill Gap Crash Courses</h4>
                      <div className="space-y-4">
                        {researchReport.interviewPrepGuide.skillGapCrashCourses.map(
                          (course, index) => (
                            <Card key={index}>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  {course?.topic || 'Loading...'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {course?.companyContext && (
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-1">
                                      Company Context
                                    </div>
                                    <p className="text-sm">{course.companyContext}</p>
                                  </div>
                                )}
                                {course?.studyTip && (
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-1">
                                      Study Tip
                                    </div>
                                    <p className="text-sm">{course.studyTip}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {researchReport.interviewPrepGuide.strategicQuestions &&
                  researchReport.interviewPrepGuide.strategicQuestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Strategic Questions</h4>
                      <ul className="space-y-3">
                        {researchReport.interviewPrepGuide.strategicQuestions.map(
                          (question, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium text-muted-foreground">
                                {index + 1}.
                              </span>{' '}
                              {question || 'Loading...'}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                {isLoading &&
                  (!researchReport.interviewPrepGuide.strategicQuestions ||
                    researchReport.interviewPrepGuide.strategicQuestions.length === 0) && (
                    <div className="text-sm text-muted-foreground italic">
                      Generating strategic questions...
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
