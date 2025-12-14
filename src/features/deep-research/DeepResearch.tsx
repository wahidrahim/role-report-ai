'use client';

import { createParser } from 'eventsource-parser';
import { useEffect, useRef, useState } from 'react';

import { InterviewPrepGuide } from '@/agents/schemas/interviewPrepGuide.schema';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { useResumeStore } from '@/stores/resumeStore';

type StreamEvent = {
  id: string;
  event: 'NODE_START' | 'NODE_END' | 'INTERVIEW_PREP_GUIDE_CREATED';
  data?: Partial<{
    node?: string;
    message?: string;
    data?: Record<string, unknown>;
    interviewPrepGuide?: InterviewPrepGuide;
  }>;
};

type DeepResearchProps = {
  jobDescriptionText: string;
};

export function DeepResearch({ jobDescriptionText }: DeepResearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [interviewPrepGuide, setInterviewPrepGuide] = useState<InterviewPrepGuide | null>(null);
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
    setInterviewPrepGuide(null);

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
            event: event.event as 'NODE_START' | 'NODE_END' | 'INTERVIEW_PREP_GUIDE_CREATED',
            data: parsedData,
          };

          setStreamEvents((prev) => [...prev, newStreamEvent]);

          // Extract interview prep guide if present
          if (event.event === 'INTERVIEW_PREP_GUIDE_CREATED' && parsedData.interviewPrepGuide) {
            setInterviewPrepGuide(parsedData.interviewPrepGuide);
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
      {interviewPrepGuide && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Prep Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Interview Format</h3>
              <p className="text-sm font-medium mb-1">
                {interviewPrepGuide.interviewFormat.format}
              </p>
              <p className="text-sm text-muted-foreground">
                {interviewPrepGuide.interviewFormat.rationale}
              </p>
            </div>

            {interviewPrepGuide.skillGapCrashCourses.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Skill Gap Crash Courses</h3>
                <div className="space-y-4">
                  {interviewPrepGuide.skillGapCrashCourses.map((course, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{course.topic}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Company Context
                          </div>
                          <p className="text-sm">{course.companyContext}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Study Tip
                          </div>
                          <p className="text-sm">{course.studyTip}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {interviewPrepGuide.strategicQuestions &&
              interviewPrepGuide.strategicQuestions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Strategic Questions</h3>
                  <ul className="space-y-3">
                    {interviewPrepGuide.strategicQuestions.map((question, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium text-muted-foreground">{index + 1}.</span>{' '}
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
