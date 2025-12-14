import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
    <motion.div className="space-y-6" layout>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-primary animate-pulse"
        >
          <Spinner className="size-4" />
          Streaming analysis data...
        </motion.div>
      )}

      {/* Fit Score */}
      {suitabilityAssessment?.suitabilityScore !== undefined && (
        <motion.div layout>
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
        </motion.div>
      )}

      {/* Radar Chart */}
      {radarChart?.data && (
        <motion.div layout>
          <Card>
            <CardHeader>
              <CardTitle>Skills Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsRadarChart data={radarChart.data} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Skill Assessment */}
      {skillAssessment?.skills && (
        <motion.div layout>
          <SkillAssessment skills={skillAssessment.skills} />
        </motion.div>
      )}

      {/* Resume Optimizations */}
      {resumeOptimizations?.plan && (
        <motion.div layout>
          <Card>
            <CardHeader>
              <CardTitle>Resume Optimizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {resumeOptimizations.plan.map((item: any) => (
                  <li
                    key={`opt-${item.title}`}
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
        </motion.div>
      )}
    </motion.div>
  );
}
