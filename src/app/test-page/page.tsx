'use client';

import { useChat, experimental_useObject as useObject } from '@ai-sdk/react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/core/components/ui/button';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
import { useResumeStore } from '@/stores/resumeStore';

export default function TestPage() {
  const [textareaValue, setTextareaValue] = useState('');

  const { resumeText } = useResumeStore();

  const deepResearch = useObject({
    api: '/api/deep-research',
    schema: z.object({
      companyIntel: z.object({
        recentNews: z.array(z.string()),
        interviewTips: z.array(z.string()),
        techStack: z.array(z.string()),
      }),
      studyPlan: z.array(
        z.object({
          topic: z.string(),
          priority: z.enum(['critical', 'high', 'medium']),
          resources: z.array(z.string()),
        }),
      ),
    }),
  });

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    deepResearch.submit({
      resumeText,
      jobDescriptionText: textareaValue,
    });
  };

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
        <Button type="submit" disabled={deepResearch.isLoading} className="w-full sm:w-auto">
          {deepResearch.isLoading ? 'Loading...' : 'Deep Research'}
        </Button>
      </form>
      {deepResearch.object && (
        <div className="mt-4">
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(deepResearch.object, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
