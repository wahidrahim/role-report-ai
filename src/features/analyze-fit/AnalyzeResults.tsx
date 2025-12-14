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

export function AnalyzeResults({
  radarChart,
  skillAssessment,
  suitabilityAssessment,
  resumeOptimizations,
  learningPriorities,
  isLoading,
}: AnalyzeResultsProps) {
  // Show loading state only if completely empty and loading
  if (isLoading && !suitabilityAssessment && !radarChart && !skillAssessment) {
    return (
      <div className="flex items-center justify-center p-12 h-64 border border-dashed border-primary/20 rounded-2xl bg-primary/5">
        <Spinner className="size-8 text-primary" />
        <span className="ml-3 text-muted-foreground animate-pulse">Initializing analysis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
          <Spinner className="size-4" />
          Streaming analysis data...
        </div>
      )}

      {/* Fit Score */}
      {suitabilityAssessment?.suitabilityScore !== undefined && (
        <div>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Fit Score</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchScore
                matchScore={suitabilityAssessment.suitabilityScore}
                verdict={suitabilityAssessment.suitabilityReasoning}
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

      {/* Resume Optimizations */}
      {resumeOptimizations?.plan && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resume Optimizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {resumeOptimizations.plan.map((item: any, i: number) => (
                  <li key={`opt-${i}`} className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="font-semibold text-primary-foreground">{item.title}</div>
                    <div className="text-xs text-primary uppercase tracking-wider mb-1 mt-1">
                      {item.priority}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learning Priorities */}
      {learningPriorities?.plan && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Learning Priorities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {learningPriorities.plan.map((item: any, i: number) => (
                  <li
                    key={`learning-${i}`}
                    className="p-3 bg-white/5 rounded-lg border border-white/5"
                  >
                    <div className="font-semibold text-primary-foreground">{item.title}</div>
                    <div className="text-xs text-primary uppercase tracking-wider mb-1 mt-1">
                      {item.priority}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
