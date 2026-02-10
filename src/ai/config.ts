import { anthropic } from '@ai-sdk/anthropic';
import { LanguageModel } from 'ai';

/**
 * Model tiers ordered by capability (and cost):
 * - fast: Optimized for speed and cost efficiency
 * - balanced: Good balance of capability and cost
 * - powerful: Maximum capability for complex tasks
 */
export type ModelTier = 'fast' | 'balanced' | 'powerful';

export const anthropicSdkModels: Record<ModelTier, LanguageModel> = {
  fast: anthropic('claude-haiku-4-5'),
  balanced: anthropic('claude-sonnet-4-5'),
  powerful: anthropic('claude-opus-4-5'),
} as const;

export const aiSdkModels: Record<ModelTier, LanguageModel> = {
  fast: 'anthropic/claude-haiku-4.5',
  balanced: 'anthropic/claude-sonnet-4.5',
  powerful: 'anthropic/claude-opus-4.5',
} as const;

// Switch between aiSdkModels, anthropicSdkModels, or others.
export const models = aiSdkModels;
