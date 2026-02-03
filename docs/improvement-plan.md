# Analyze-Fit Improvement Plan

This document outlines the execution order for improving the analyze-fit feature's output quality.

## Issues Overview

### Todo (High Priority)
| Issue | Title |
|-------|-------|
| [#5](https://github.com/wahidrahim/role-report-ai/issues/5) | Model routing with Anthropic models (Haiku/Sonnet/Opus) |
| [#6](https://github.com/wahidrahim/role-report-ai/issues/6) | Rewrite resumeOptimizationPlans prompt and schema |
| [#7](https://github.com/wahidrahim/role-report-ai/issues/7) | Rewrite learningPrioritiesPlan prompt and schema |
| [#8](https://github.com/wahidrahim/role-report-ai/issues/8) | Expand suitabilityAssessment schema with criteria breakdown |
| [#9](https://github.com/wahidrahim/role-report-ai/issues/9) | Enhance assessSkills prompt with transferability guidelines |

### Icebox (Nice-to-Have)
| Issue | Title |
|-------|-------|
| [#1](https://github.com/wahidrahim/role-report-ai/issues/1) | Allow users to select LLM provider in settings |
| [#3](https://github.com/wahidrahim/role-report-ai/issues/3) | Implement Anthropic prompt caching for cost reduction |
| [#10](https://github.com/wahidrahim/role-report-ai/issues/10) | Update UI to display action plan categories and examples |
| [#11](https://github.com/wahidrahim/role-report-ai/issues/11) | Update UI to display suitability criteria breakdown |
| [#12](https://github.com/wahidrahim/role-report-ai/issues/12) | Add ATS keyword match score |
| [#13](https://github.com/wahidrahim/role-report-ai/issues/13) | Add interview questions prediction node |

---

## Execution Order

### Phase 1: Foundation

| Order | Issue | Rationale |
|-------|-------|-----------|
| 1 | #5 - Model routing | Everything depends on this. Establishes Anthropic SDK integration and tiered model config (Haiku/Sonnet/Opus) that all nodes will use. |

### Phase 2: Upstream Quality (Data Producers)

| Order | Issue | Rationale |
|-------|-------|-----------|
| 2 | #9 - Assess skills enhancement | Skill assessment feeds into suitability. Better skill data leads to better suitability scores and better action plans. |
| 3 | #8 - Suitability schema expansion | Suitability feeds into both action plan nodes. The `criteriaBreakdown`, `keyStrengths`, and `criticalGaps` provide richer context for recommendations. |

### Phase 3: Downstream Quality (User-Facing Output)

| Order | Issue | Rationale |
|-------|-------|-----------|
| 4 | #6 - Resume optimization | Now has rich upstream data from #8 to generate targeted recommendations. Opus model from #5 maximizes quality. |
| 5 | #7 - Learning priorities | Same rationale. Can be done in parallel with #6 since they're independent. |

### Phase 4: UI Updates (Icebox)

| Order | Issue | Rationale |
|-------|-------|-----------|
| 6 | #10 - UI for action plans | Depends on #6, #7 schemas being finalized. |
| 7 | #11 - UI for suitability breakdown | Depends on #8 schema being finalized. |

### Phase 5: Optimizations & New Features (Icebox)

| Order | Issue | Rationale |
|-------|-------|-----------|
| 8 | #3 - Prompt caching | Cost optimization. Do after prompts are stable (changes invalidate cache). |
| 9 | #12 - ATS keyword score | New feature, independent of above. |
| 10 | #13 - Interview questions | New feature, uses skill assessment data. |
| 11 | #1 - User LLM selection | Nice-to-have, do after core experience is polished. |

---

## Dependency Graph

```
#5 Model Routing (foundation)
 |
 +---> #9 Assess Skills ---> #8 Suitability Schema
 |                               |
 |                               +---> #6 Resume Optimization ---> #10 UI
 |                               |
 |                               +---> #7 Learning Priorities ---> #10 UI
 |
 |                          #8 ---> #11 UI (suitability breakdown)
 |
 +---> #3 Prompt Caching (after prompts stabilize)

Independent (anytime after #5):
 #12 ATS Score
 #13 Interview Questions
 #1 User LLM Selection
```

---

## Critical Path

**#5 → #9 → #8 → #6/#7**

Data flows downstream: skills → suitability → action plans. Improving upstream nodes first means downstream nodes have better input to work with, compounding quality improvements.

---

## Model Routing Strategy

| Tier | Model | Nodes | Rationale |
|------|-------|-------|-----------|
| `fast` | Haiku | `validateInputs` | Simple binary classification |
| `balanced` | Sonnet | `plotRadarChart`, `assessSkills`, `assessSuitability` | Analysis and scoring |
| `powerful` | Opus | `resumeOptimizationPlans`, `learningPrioritiesPlan` | Highest quality recommendations |
