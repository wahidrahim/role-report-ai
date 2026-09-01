'use client';

import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Clock,
  Download,
  Lightbulb,
  Minus,
  Plus,
  Target,
  Wrench,
  Zap,
} from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { SkillAssessment as SkillAssessmentResult } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { LearningPlan } from '@/ai/analyze-fit/nodes/learningPrioritiesPlan';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Spinner } from '@/core/components/ui/spinner';
import { cn } from '@/core/lib/utils';
import { getPriorityValue } from '@/features/analyze-fit/priority.util';

import { AnalysisErrorAlert } from './components/analysis-error-alert.component';
import { MatchScore } from './components/match-score.component';
import { SkillAssessment } from './components/skill-assessment.component';
import { SkillsRadarChart } from './components/skills-radar-chart.component';
import { usePDFExport } from './hooks/use-pdf-export.hook';

type AnalyzeResultsProps = {
  radarChart: RadarChart | null;
  skillAssessment: SkillAssessmentResult | null;
  suitabilityAssessment: SuitabilityAssessment | null;
  resumeOptimizations: ActionPlan | null;
  learningPriorities: LearningPlan | null;
  isLoading: boolean;
  error: Error | null;
};

type ResumeOptimization = ActionPlan['plan'][number];

const PRIORITY_BADGE_STYLES: Record<string, string> = {
  critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30',
  high: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
};

const DEFAULT_PRIORITY_BADGE_STYLE =
  'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';

const UNKNOWN_CATEGORY_STYLE = 'bg-gray-500/10 text-gray-400 border-gray-500/20';

const RESUME_CATEGORIES = {
  'keyword-optimization': {
    style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    label: 'Keywords',
  },
  quantification: {
    style: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    label: 'Metrics',
  },
  'experience-alignment': {
    style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    label: 'Experience',
  },
  'skills-section': { style: 'bg-teal-500/10 text-teal-400 border-teal-500/20', label: 'Skills' },
  'format-structure': {
    style: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    label: 'Format',
  },
};

const LEARNING_CATEGORIES = {
  'critical-gap': {
    style: 'bg-red-500/10 text-red-400 border-red-500/20',
    label: 'Critical Gap',
    icon: AlertTriangle,
  },
  'quick-win': {
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'Quick Win',
    icon: Zap,
  },
  'interview-prep': {
    style: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    label: 'Interview Prep',
    icon: Target,
  },
};

const EXAMPLE_VARIANTS = {
  addition: {
    icon: Plus,
    label: 'Add',
    box: 'bg-emerald-500/5 border-emerald-500/10',
    iconColor: 'text-emerald-400',
    labelColor: 'text-emerald-400/70',
    body: 'text-emerald-300',
  },
  removal: {
    icon: Minus,
    label: 'Remove',
    box: 'bg-red-500/5 border-red-500/10',
    iconColor: 'text-red-400',
    labelColor: 'text-red-400/70',
    body: 'text-red-300/80 line-through decoration-red-400/50',
  },
  structural: {
    icon: ArrowUpDown,
    label: 'Restructure',
    box: 'bg-blue-500/5 border-blue-500/10',
    iconColor: 'text-blue-400',
    labelColor: 'text-blue-400/70',
    body: 'text-blue-300',
  },
  general: {
    icon: Lightbulb,
    label: 'Tip',
    box: 'bg-amber-500/5 border-amber-500/10',
    iconColor: 'text-amber-400',
    labelColor: 'text-amber-400/70',
    body: 'text-amber-300',
  },
};

const getPriorityBadgeStyle = (priority: string) =>
  PRIORITY_BADGE_STYLES[priority?.toLowerCase()] ?? DEFAULT_PRIORITY_BADGE_STYLE;

// Highest priority first; Array.sort is stable, so equal priorities keep the model's order.
const sortByPriority = <T extends { priority: string }>(plan: T[] | undefined) =>
  plan
    ? [...plan].sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority))
    : null;

function TimeEstimateBadge(props: { time: string; variant: 'effort' | 'learning' }) {
  const { time, variant } = props;

  const icon = variant === 'effort' ? <Wrench className="size-3" /> : <Clock className="size-3" />;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
      {icon}
      {time}
    </span>
  );
}

function ExampleRenderer(props: { example: ResumeOptimization['example'] }) {
  const { example } = props;

  if (!example?.type) return null;

  // A replacement is the only example that renders two boxes.
  if (example.type === 'replacement') {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 p-2 bg-red-500/5 rounded border border-red-500/10">
          <span className="text-[10px] uppercase tracking-wider text-red-400/70 shrink-0">
            Before
          </span>
          <span className="text-xs text-red-300/80">{example.before}</span>
        </div>
        <div className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded border border-emerald-500/10">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 shrink-0">
            After
          </span>
          <span className="text-xs text-emerald-300">{example.after}</span>
        </div>
      </div>
    );
  }

  const variant = EXAMPLE_VARIANTS[example.type];

  if (!variant) return null;

  const Icon = variant.icon;
  const body =
    example.type === 'structural' || example.type === 'general'
      ? example.suggestion
      : example.content;

  return (
    <div className="space-y-1">
      <div className={cn('flex items-start gap-2 p-2 rounded border', variant.box)}>
        <Icon className={cn('size-3 shrink-0 mt-0.5', variant.iconColor)} />
        <div className="space-y-1">
          <span className={cn('text-[10px] uppercase tracking-wider', variant.labelColor)}>
            {variant.label}
          </span>
          <p className={cn('text-xs', variant.body)}>{body}</p>
        </div>
      </div>

      {example.type === 'addition' && example.location && (
        <p className="text-xs text-muted-foreground/70">Location: {example.location}</p>
      )}
    </div>
  );
}

export function AnalyzeResults(props: AnalyzeResultsProps) {
  const {
    radarChart,
    skillAssessment,
    suitabilityAssessment,
    resumeOptimizations,
    learningPriorities,
    isLoading,
    error,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);

  const { generatePDF, isGenerating } = usePDFExport({
    suitabilityAssessment: suitabilityAssessment ?? undefined,
    skillAssessment: skillAssessment ?? undefined,
    resumeOptimizations: resumeOptimizations ?? undefined,
    learningPriorities: learningPriorities ?? undefined,
  });

  const sortedResumeOptimizations = useMemo(
    () => sortByPriority(resumeOptimizations?.plan),
    [resumeOptimizations],
  );

  const sortedLearningPriorities = useMemo(
    () => sortByPriority(learningPriorities?.plan),
    [learningPriorities],
  );

  const hasResults = suitabilityAssessment?.suitabilityScore !== undefined;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && <AnalysisErrorAlert title="Analysis Failed" message={error.message} />}

      {/* Fit Score */}
      {(isLoading || suitabilityAssessment?.suitabilityScore !== undefined) && (
        <div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent>
              <MatchScore suitabilityAssessment={suitabilityAssessment} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Radar Chart */}
      {radarChart?.data && (
        <div className="flex justify-center py-6">
          <SkillsRadarChart ref={chartRef} data={radarChart.data} />
        </div>
      )}

      {/* Skill Assessment */}
      {skillAssessment?.skills && (
        <div>
          <SkillAssessment skills={skillAssessment.skills} />
        </div>
      )}

      {/* Resume Optimizations & Learning Priorities */}
      {(sortedResumeOptimizations || sortedLearningPriorities) && (
        <div className="grid md:grid-cols-2 gap-6">
          {sortedResumeOptimizations && (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Resume Optimizations</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {sortedResumeOptimizations.map((item, i) => {
                    const category = RESUME_CATEGORIES[item.category];

                    return (
                      <li
                        key={`opt-${i}`}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 hover:bg-white/[0.07] transition-colors"
                      >
                        {/* Header Row: Priority + Category + Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'shrink-0 capitalize',
                              getPriorityBadgeStyle(item.priority),
                            )}
                          >
                            {item.priority}
                          </Badge>
                          {item.category && (
                            <Badge
                              variant="outline"
                              className={category?.style ?? UNKNOWN_CATEGORY_STYLE}
                            >
                              {category?.label ?? item.category}
                            </Badge>
                          )}
                          {item.estimatedEffort && (
                            <TimeEstimateBadge time={item.estimatedEffort} variant="effort" />
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-primary-foreground text-sm leading-tight">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>

                        {/* Example */}
                        {item.example && <ExampleRenderer example={item.example} />}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {sortedLearningPriorities && (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Learning Priorities</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {sortedLearningPriorities.map((item, i) => {
                    const category = LEARNING_CATEGORIES[item.category];
                    const CategoryIcon = category?.icon;

                    return (
                      <li
                        key={`learning-${i}`}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 hover:bg-white/[0.07] transition-colors"
                      >
                        {/* Header Row: Priority + Category + Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'shrink-0 capitalize',
                              getPriorityBadgeStyle(item.priority),
                            )}
                          >
                            {item.priority}
                          </Badge>
                          {item.category && (
                            <Badge
                              variant="outline"
                              className={cn(
                                category?.style ?? UNKNOWN_CATEGORY_STYLE,
                                'inline-flex items-center gap-1',
                              )}
                            >
                              {CategoryIcon && <CategoryIcon className="size-3" />}
                              {category?.label ?? item.category}
                            </Badge>
                          )}
                          {item.estimatedTime && (
                            <TimeEstimateBadge time={item.estimatedTime} variant="learning" />
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-primary-foreground text-sm leading-tight">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>

                        {/* Resource */}
                        {item.resource && (
                          <div className="flex items-start gap-2 p-2 bg-blue-500/5 rounded border border-blue-500/10">
                            <BookOpen className="size-4 text-blue-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-blue-300">{item.resource}</span>
                          </div>
                        )}

                        {/* Outcome */}
                        {item.outcome && (
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                              After completing:
                            </span>
                            <p className="text-xs text-emerald-400/90 mt-1 italic">
                              &ldquo;{item.outcome}&rdquo;
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Download Button */}
      {hasResults && !isLoading && (
        <div className="flex">
          <Button
            variant="outline"
            onClick={() => generatePDF(chartRef)}
            disabled={isGenerating}
            className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            {isGenerating ? <Spinner /> : <Download className="size-4" />}
            {isGenerating ? 'Generating...' : 'Download Analysis'}
          </Button>
        </div>
      )}
    </div>
  );
}
