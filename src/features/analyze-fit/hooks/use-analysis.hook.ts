'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import type { AnalysisData, AnalysisUIMessage } from '@/ai/analyze-fit/events';

const transport = new DefaultChatTransport<AnalysisUIMessage>({ api: '/api/analyze' });
const THROTTLE_MS = 50;

/**
 * The transport surfaces a non-2xx response body verbatim and the route answers those with
 * `{ error }` JSON, so unwrap that shape the way use-deep-research.hook.ts already does. Errors
 * streamed as chunks are plain text already and pass through untouched.
 */
const unwrapError = (error: Error) => {
  try {
    const body = JSON.parse(error.message) as { error?: unknown };

    return typeof body.error === 'string' ? new Error(body.error) : error;
  } catch {
    return error;
  }
};

export function useAnalysis() {
  // Each partial frame would otherwise re-render the whole dashboard; batch them per THROTTLE_MS.
  const { messages, status, error, sendMessage, setMessages } = useChat({
    transport,
    throttle: THROTTLE_MS,
  });

  const analyze = (resumeText: string, jobDescriptionText: string) => {
    // Every analysis is a fresh run, so drop the previous one instead of appending to it.
    setMessages([]);
    sendMessage({ text: 'analyze' }, { body: { resumeText, jobDescriptionText } });
  };

  const parts = messages.find((message) => message.role === 'assistant')?.parts ?? [];

  const slice = <K extends keyof AnalysisData>(key: K) => {
    const part = parts.find((candidate) => candidate.type === `data-${key}`);

    return part && 'data' in part ? (part.data as AnalysisData[K]) : null;
  };

  return {
    radarChart: slice('radarChart'),
    skillAssessment: slice('skillAssessment'),
    suitabilityAssessment: slice('suitabilityAssessment'),
    resumeOptimizations: slice('resumeOptimizations'),
    learningPriorities: slice('learningPriorities'),
    isLoading: status === 'submitted' || status === 'streaming',
    error: error ? unwrapError(error) : null,
    analyze,
  };
}
