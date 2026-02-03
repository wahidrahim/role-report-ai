export const models = {
  fast: 'anthropic/claude-3.5-haiku',
  balanced: 'anthropic/claude-sonnet-4.5',
  powerful: 'anthropic/claude-opus-4.5',
} as const;

export type ModelTier = keyof typeof models;

/** @deprecated Use `models.balanced` instead. Kept for backwards compatibility with deep-research nodes. */
export const model = models.balanced;
