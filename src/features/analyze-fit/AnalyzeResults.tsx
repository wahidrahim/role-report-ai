'use client';

import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Clock,
  Target,
  Wrench,
  Zap,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/core/components/ui/alert';
import { Badge } from '@/core/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

import MatchScore from './components/MatchScore';
import { SkillAssessment } from './components/SkillAssessment';
import { SkillsRadarChart } from './components/SkillsRadarChart';

type AnalyzeResultsProps = {
  radarChart: any;
  skillAssessment: any;
  suitabilityAssessment: any;
  resumeOptimizations: any;
  learningPriorities: any;
  isLoading: boolean;
  error: Error | null;
};

const getPriorityValue = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
};

const getPriorityBadgeStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30';
    case 'high':
      return 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
  }
};

const getResumeCategoryStyle = (category: string) => {
  switch (category) {
    case 'keyword-optimization':
      return { style: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Keywords' };
    case 'quantification':
      return { style: 'bg-violet-500/10 text-violet-400 border-violet-500/20', label: 'Metrics' };
    case 'experience-alignment':
      return { style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', label: 'Experience' };
    case 'skills-section':
      return { style: 'bg-teal-500/10 text-teal-400 border-teal-500/20', label: 'Skills' };
    case 'format-structure':
      return { style: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Format' };
    default:
      return { style: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: category };
  }
};

const getLearningCategoryStyle = (category: string) => {
  switch (category) {
    case 'critical-gap':
      return {
        style: 'bg-red-500/10 text-red-400 border-red-500/20',
        label: 'Critical Gap',
        icon: AlertTriangle,
      };
    case 'quick-win':
      return {
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        label: 'Quick Win',
        icon: Zap,
      };
    case 'interview-prep':
      return {
        style: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        label: 'Interview Prep',
        icon: Target,
      };
    default:
      return {
        style: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        label: category,
        icon: null,
      };
  }
};

const TimeEstimateBadge = ({
  time,
  variant,
}: {
  time: string;
  variant: 'effort' | 'learning';
}) => {
  const icon =
    variant === 'effort' ? <Wrench className="size-3" /> : <Clock className="size-3" />;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
      {icon}
      {time}
    </span>
  );
};

export function AnalyzeResults({
  radarChart,
  skillAssessment,
  suitabilityAssessment,
  resumeOptimizations,
  learningPriorities,
  isLoading,
  error,
}: AnalyzeResultsProps) {
  const sortedResumeOptimizations = resumeOptimizations?.plan
    ? [...resumeOptimizations.plan].sort(
        (a: any, b: any) => getPriorityValue(b.priority) - getPriorityValue(a.priority),
      )
    : null;

  const sortedLearningPriorities = learningPriorities?.plan
    ? [...learningPriorities.plan].sort(
        (a: any, b: any) => getPriorityValue(b.priority) - getPriorityValue(a.priority),
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Fit Score */}
      {(isLoading || suitabilityAssessment?.suitabilityScore !== undefined) && (
        <div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent>
              <MatchScore
                suitabilityAssessment={suitabilityAssessment}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Radar Chart */}
      {radarChart?.data && (
        <div className="flex justify-center py-6">
          <SkillsRadarChart data={radarChart.data} />
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
                  {sortedResumeOptimizations.map((item: any, i: number) => {
                    const categoryInfo = getResumeCategoryStyle(item.category);
                    return (
                      <li
                        key={`opt-${i}`}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 hover:bg-white/[0.07] transition-colors"
                      >
                        {/* Header Row: Priority + Category + Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`shrink-0 capitalize ${getPriorityBadgeStyle(item.priority)}`}
                          >
                            {item.priority}
                          </Badge>
                          {item.category && (
                            <Badge variant="outline" className={categoryInfo.style}>
                              {categoryInfo.label}
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

                        {/* Before/After Example */}
                        {item.example && (
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 p-2 bg-red-500/5 rounded border border-red-500/10">
                              <span className="text-[10px] uppercase tracking-wider text-red-400/70 shrink-0">
                                Before
                              </span>
                              <span className="text-xs text-red-300/80">
                                {item.example.before}
                              </span>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded border border-emerald-500/10">
                              <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 shrink-0">
                                After
                              </span>
                              <span className="text-xs text-emerald-300">
                                {item.example.after}
                              </span>
                            </div>
                          </div>
                        )}
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
                  {sortedLearningPriorities.map((item: any, i: number) => {
                    const categoryInfo = getLearningCategoryStyle(item.category);
                    const CategoryIcon = categoryInfo.icon;
                    return (
                      <li
                        key={`learning-${i}`}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 hover:bg-white/[0.07] transition-colors"
                      >
                        {/* Header Row: Priority + Category + Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`shrink-0 capitalize ${getPriorityBadgeStyle(item.priority)}`}
                          >
                            {item.priority}
                          </Badge>
                          {item.category && (
                            <Badge
                              variant="outline"
                              className={`${categoryInfo.style} inline-flex items-center gap-1`}
                            >
                              {CategoryIcon && <CategoryIcon className="size-3" />}
                              {categoryInfo.label}
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
    </div>
  );
}
