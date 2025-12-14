import { Badge } from '@/core/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Spinner } from '@/core/components/ui/spinner';

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
};

const getPriorityValue = (priority: string) => {
  switch (priority?.toLowerCase()) {
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

export function AnalyzeResults({
  radarChart,
  skillAssessment,
  suitabilityAssessment,
  resumeOptimizations,
  learningPriorities,
  isLoading,
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
      {/* Fit Score */}
      {(isLoading || suitabilityAssessment?.suitabilityScore !== undefined) && (
        <div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent>
              <MatchScore
                matchScore={suitabilityAssessment?.suitabilityScore}
                verdict={suitabilityAssessment?.suitabilityReasoning}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Radar Chart */}
      {radarChart?.data && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Skills Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsRadarChart data={radarChart.data} />
            </CardContent>
          </Card>
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
                  {sortedResumeOptimizations.map((item: any, i: number) => (
                    <li
                      key={`opt-${i}`}
                      className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-primary-foreground text-sm">
                          {item.title}
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 capitalize ${getPriorityBadgeStyle(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </div>
                    </li>
                  ))}
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
                  {sortedLearningPriorities.map((item: any, i: number) => (
                    <li
                      key={`learning-${i}`}
                      className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-primary-foreground text-sm">
                          {item.title}
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 capitalize ${getPriorityBadgeStyle(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
