export const models = {
  fast: 'anthropic/claude-3.5-haiku',
  balanced: 'anthropic/claude-sonnet-4.5',
  powerful: 'anthropic/claude-opus-4.5',
} as const;

export type ModelTier = keyof typeof models;
