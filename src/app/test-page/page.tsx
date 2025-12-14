'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, readUIMessageStream } from 'ai';
import { UIMessage } from 'ai';
import { createParser } from 'eventsource-parser';
import merge from 'lodash/merge';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { DeepResearchUIMessage } from '@/app/api/deep-research/route';
import { Button } from '@/core/components/ui/button';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
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

export default function TestPage() {
  const [textareaValue, setTextareaValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);

  const { resumeText } = useResumeStore();

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/deep-research', {
      method: 'POST',
      body: JSON.stringify({
        resumeText,
        jobDescriptionText: textareaValue,
      }),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const parser = createParser({
      onEvent: (event) => {
        console.log({ event });
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

    setIsLoading(false);
  };

  useEffect(() => {
    console.log({ streamEvents });
  }, [streamEvents]);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="research-query">Research Query</Label>
          <Textarea
            id="research-query"
            rows={10}
            placeholder="Enter your research query here"
            value={textareaValue}
            onChange={handleTextareaChange}
            className="field-sizing-fixed resize-none"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Loading...' : 'Deep Research'}
        </Button>
      </form>
      <div>
        {streamEvents.map((event) => (
          <div key={event.id}>{event.data?.message}</div>
        ))}
      </div>
    </div>
  );
}
