import { anthropic } from '@ai-sdk/anthropic';

/**
 * Model tiers ordered by capability (and cost):
 * - fast: Optimized for speed and cost efficiency
 * - balanced: Good balance of capability and cost
 * - powerful: Maximum capability for complex tasks
 */
export const models = {
  fast: anthropic('claude-3.5-haiku'),
  balanced: anthropic('claude-sonnet-4.5'),
  powerful: anthropic('claude-opus-4.5'),
} as const;

export type ModelTier = keyof typeof models;
