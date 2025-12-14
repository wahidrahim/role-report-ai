'use client';

import { createParser } from 'eventsource-parser';
import { useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { useResumeStore } from '@/stores/resumeStore';

type StreamEvent = {
  id: string;
  event: 'NODE_START' | 'NODE_END';
  data?: Partial<{
    node?: string;
    message?: string;
    data?: Record<string, unknown>;
  }>;
};

type DeepResearchProps = {
  jobDescriptionText: string;
};

export function DeepResearch({ jobDescriptionText }: DeepResearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const { resumeText, skillAssessment, suitabilityAssessment } = useResumeStore();

  const handleDeepResearch = async () => {
    setIsLoading(true);

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
            event: event.event as 'NODE_START' | 'NODE_END',
            data: parsedData,
          };

          setStreamEvents((prev) => [...prev, newStreamEvent]);
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
    </>
  );
}
