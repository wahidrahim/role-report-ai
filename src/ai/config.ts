export const models = {
  fast: 'anthropic/claude-3-5-haiku-20241022',
  balanced: 'anthropic/claude-sonnet-4-20250514',
  powerful: 'anthropic/claude-opus-4-20250514',
} as const;

export type ModelTier = keyof typeof models;
