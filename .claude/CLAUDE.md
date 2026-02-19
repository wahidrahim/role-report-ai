# role-report-ai

Next.js 16 + React 19 + TypeScript application that generates AI-powered role fit reports. It provides two AI workflows — Fit Analysis and Deep Research — built with LangGraph, Vercel AI SDK, and Anthropic Claude. The app uses streaming SSE architecture, PDF export, and Tavily web search.

## Commands

```
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
```

- Package manager: **pnpm** (not npm/yarn)
- No test framework configured

## Project Structure

```
src/
  app/            — Next.js App Router (layout, page, API routes)
  ai/             — LangGraph workflows and nodes (analyze-fit, deep-research)
  features/       — Feature-specific components, hooks, PDF exports
  core/           — Shared UI components (shadcn/ui), hooks, utilities
docs/             — Project documentation
```

## Architecture

- **Path alias:** `@/*` → `./src/*`
- **API routes** stream SSE via `ReadableStream` (`/api/analyze`, `/api/deep-research`)
- **LangGraph workflows** live in `src/ai/*/workflow.ts` with nodes in `src/ai/*/nodes/`
- **Client hooks** parse SSE streams (`useAnalysis`, `useDeepResearch`)
- **Three-tier model config** in `src/ai/config.ts` (fast / balanced / powerful)
- **UI components** from shadcn/ui in `src/core/components/ui/`
- **Feature flags** via env vars checked in `src/core/featureFlags.ts`
- **PDF export** uses `@react-pdf/renderer` + `html-to-image`

## Key Patterns

- **Streaming pipeline:** workflows emit typed events → API route streams SSE → client hook parses events → React state updates
- **Structured output:** AI nodes use `streamObject()` from Vercel AI SDK with Zod schemas
- **Prompt caching:** enabled with `cacheControl: { type: 'ephemeral' }`
- **Stateless:** no database — fully session-based
- **Import rule:** no relative parent imports (`../`) — use `@/` alias instead

## Environment Variables

- `ANTHROPIC_API_KEY` — Claude API access
- `TAVILY_API_KEY` — Web search for deep research
- `FEATURE_DEEP_RESEARCH` — Feature flag (true/false)
- `AI_GATEWAY_API_KEY` — AI gateway access

## TypeScript Rules

- Use `type` instead of `interface` for object shapes
- Never use `enum` — use `const` objects with `as const` + derived type
- Use `import type` for type-only imports (e.g., `import type { AnalyzeFitState } from '@/ai/analyze-fit/state'`)

```typescript
// Correct
export const SkillStatus = {
  VERIFIED: 'verified',
  TRANSFERABLE: 'transferable',
  MISSING: 'missing',
} as const;
export type SkillStatus = (typeof SkillStatus)[keyof typeof SkillStatus];

// Wrong - never use enum
enum SkillStatus { VERIFIED = 'verified' }
```

## Naming Conventions

| Element    | Convention                  | Example                                  |
| ---------- | --------------------------- | ---------------------------------------- |
| Files      | kebab-case with type suffix | `fetch-analysis.hook.ts`                 |
| Components | PascalCase (export)         | `export function SkillAssessment()`      |
| Pages      | PascalCase with Page suffix | `export function DashboardPage()`        |
| Hooks      | camelCase with `use`        | `export function useFetchAnalysis()`     |
| Functions  | camelCase                   | `assessSuitability`                      |
| Constants  | SCREAMING_SNAKE_CASE        | `CRITERIA_WEIGHTS`, `MIN_TEXT_LENGTH`    |

**File type suffixes:**

| File Type  | Suffix           | Example                            |
| ---------- | ---------------- | ---------------------------------- |
| Pages      | `.page.tsx`      | `dashboard.page.tsx`               |
| Components | `.component.tsx` | `skill-assessment.component.tsx`   |
| Hooks      | `.hook.ts`       | `fetch-analysis.hook.ts`           |
| Services   | `.service.ts`    | `deep-research.service.ts`         |
| Utilities  | `.util.ts`       | `score-color.util.ts`              |

**Exceptions:**

- **Next.js entry files** keep required names: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`
- **shadcn/ui components** in `src/core/components/ui/` keep their generated names (e.g., `button.tsx`, `alert-dialog.tsx`)

**Hook action verbs:** `fetch-`, `save-`, `delete-`, `create-`, `start-`, `complete-`, `cancel-`, `compute-`

**Component naming:** Keep descriptive, findable names — `skill-assessment.component.tsx` not `assessment.component.tsx`.

## Coding Style

- Blank line before `return` statements
- Guard clauses: blank lines before and after. No braces unless line exceeds 100 chars or the return value spans multiple lines. Applies to `return`, `throw`, `continue`, `break`
- Separate conditional blocks with blank lines
- Blank line after variable declaration(s) before the next statement

```typescript
// Correct - guard clauses without braces (under 100 chars).
function getScoreColor(score: number | null) {
  if (!score) return 'text-muted';

  const normalized = score / 10;

  if (normalized >= 0.8) return 'text-green-500';

  const isWarning = normalized >= 0.5;

  return isWarning ? 'text-yellow-500' : 'text-red-500';
}
```

```typescript
// Correct - guard clause with throw.
function validateResumeText(text: string | null) {
  if (!text) throw new Error('Resume text is required');

  return text.trim();
}

// Wrong - unnecessary braces on short guard clauses.
function validateResumeText(text: string | null) {
  if (!text) {
    throw new Error('Resume text is required');
  }
  // ...
}
```

## React Component Rules

1. **Named exports only** — no default exports. Exception: Next.js entry files (`page.tsx`, `layout.tsx`, `route.ts`) require default exports
2. **Function declarations** for components — not arrow functions
3. **Props:** Never destructure in signature. Destructure as first line of body:

```typescript
type MatchScoreProps = {
  score: number;
  breakdown: Record<string, number>;
};

export function MatchScore(props: MatchScoreProps) {
  const { score, breakdown } = props;

  return (
    <div>
      <h2>{score}</h2>
      <CriteriaBreakdown breakdown={breakdown} />
    </div>
  );
}
```

4. **Composition over configuration** — avoid prop soup, use children/compound components
5. **Accessibility:** Use semantic HTML elements and ARIA attributes (`aria-label`, `aria-role`, `aria-describedby`). Ensure min 44x44px interactive targets
6. **No premature memoization** — profile first before `memo`, `useMemo`, `useCallback`
7. **Client components:** Mark explicitly with `'use client'` directive at top of file

## Commenting Rules

1. Full sentences with correct punctuation (single-line comments end with period)
2. Use `/** */` for multiline, `//` for single-line
3. Explain WHY, not just WHAT
4. Max 100 characters per line
5. Conditional block comments: place above the conditional block, not inside it

```typescript
// Correct - comment above the conditional.
if (!resumeText) return null;

// Wrong - comment inside the block.
if (!resumeText) {
  // No resume provided.
  return null;
}
```

```typescript
// Skip when no results found.
if (searchResults.length === 0) {
  return null;
}
// Flag incomplete results for re-search.
else if (searchResults.some((r) => r.quality === 'low')) {
  return 're-search';
}
// Proceed with sufficient results.
else {
  return 'continue';
}
```

## Conventional Commits

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ops`, `chore`, `perf`

Rules:

- Imperative tense: "add feature" not "added feature"
- Lowercase description, no period at end
- Under 50 chars preferred, max 72
- Breaking changes: `feat!: break api`

```
feat: add PDF export for deep research report
fix(analysis): handle empty resume text in validation
refactor: simplify suitability score calculation
```
