'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import type { AnalysisData, AnalysisUIMessage } from '@/ai/analyze-fit/events';

const transport = new DefaultChatTransport<AnalysisUIMessage>({ api: '/api/analyze' });

export function useAnalysis() {
  const { messages, status, error, sendMessage, setMessages } = useChat({ transport });

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
    error: error ?? null,
    analyze,
  };
}
