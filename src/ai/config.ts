import { ollama } from 'ollama-ai-provider-v2';

export const model =
  process.env.NODE_ENV === 'development' ? ollama('qwen3:30b') : 'openai/gpt-4o-mini';
