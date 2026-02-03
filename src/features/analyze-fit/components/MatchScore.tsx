import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/core/components/ui/hover-card';

type MatchScoreProps = {
  suitabilityAssessment?: Partial<SuitabilityAssessment>;
  isLoading?: boolean;
};

const CRITERIA_CONFIG = [
  { key: 'coreSkillsMatch', label: 'Core Skills Match', weight: '35%' },
  { key: 'experienceRelevance', label: 'Experience Relevance', weight: '25%' },
  { key: 'skillGapsSeverity', label: 'Skill Gaps Severity', weight: '20%' },
  { key: 'transferableSkills', label: 'Transferable Skills', weight: '10%' },
  { key: 'overallPotential', label: 'Overall Potential', weight: '10%' },
] as const;

const getScoreColor = (score: number) => {
  // Custom curve points: [score, hue]
  // Design goals:
  // - 0-4: Red to Orange
  // - 5-6: distinct Amber/Gold (prevent premature green)
  // - 7-8: transitioning to Green
  // - 9-10: deep Emerald
  const points = [
    [0, 0], // Red
    [4, 25], // Orange
    [6, 45], // Amber/Gold
    [8, 100], // Green
    [10, 150], // Emerald
  ];

  // Find the segment
  let lower = points[0];
  let upper = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (score >= points[i][0] && score <= points[i + 1][0]) {
      lower = points[i];
      upper = points[i + 1];
      break;
    }
  }

  const range = upper[0] - lower[0];
  const progress = range === 0 ? 0 : (score - lower[0]) / range;
  const hue = lower[1] + (upper[1] - lower[1]) * progress;

  // Lightness curve: Brighter for lower scores (alert), slightly deeper for high scores (richness)
  // 60% -> 50%
  const lightness = 60 - (score / 10) * 10;

  return `hsl(${hue}, 95%, ${lightness}%)`;
};

export default function MatchScore({ suitabilityAssessment, isLoading }: MatchScoreProps) {
  const matchScore = suitabilityAssessment?.suitabilityScore;

  // Only show loading state if we're loading AND we don't have a score yet
  if (isLoading && matchScore === undefined) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in duration-500">
        <style jsx>{`
          @keyframes scan {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
          .animate-scan {
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.5) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: scan 3s linear infinite;
          }
        `}</style>

        <div className="relative">
          {/* Base subtext */}
          <p className="text-xs font-mono text-primary/40 text-center uppercase tracking-[0.2em] relative z-0">
            Processing Data Streams...
          </p>
          {/* Overlay bright shimmer subtext */}
          <div className="absolute inset-0 overflow-hidden z-10 w-full text-center">
            <p className="text-xs font-mono text-center uppercase tracking-[0.2em] animate-scan">
              Processing Data Streams...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { keyStrengths, criticalGaps, bottomLine, criteriaBreakdown } = suitabilityAssessment ?? {};

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <div className="flex flex-col items-start space-y-4">
        <div
          className="text-8xl font-black tracking-tight text-primary flex items-baseline gap-1"
          style={{
            color: matchScore !== undefined ? getScoreColor(matchScore) : undefined,
          }}
        >
          {matchScore}
          <span className="text-4xl font-medium text-muted-foreground/40">/10</span>
        </div>
        {bottomLine && (
          <div className="text-muted-foreground text-lg leading-relaxed">{bottomLine}</div>
        )}
      </div>

      {/* Strengths & Gaps Row */}
      {(keyStrengths?.length || criticalGaps?.length) && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Key Strengths */}
          {keyStrengths && keyStrengths.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-emerald-400/70 flex items-center gap-2">
                <CheckCircle2 className="size-3.5" />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {keyStrengths.map((strength, i) => (
                  <li
                    key={i}
                    className="text-sm text-emerald-300/90 pl-3 border-l-2 border-emerald-500/40"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Gaps */}
          {criticalGaps && criticalGaps.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-rose-400/70 flex items-center gap-2">
                <AlertTriangle className="size-3.5" />
                Critical Gaps
              </h4>
              <ul className="space-y-2">
                {criticalGaps.map((gap, i) => (
                  <li
                    key={i}
                    className="text-sm text-rose-300/90 pl-3 border-l-2 border-rose-500/40"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Criteria Breakdown */}
      {criteriaBreakdown && (
        <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
            Assessment Breakdown
          </h4>
          {CRITERIA_CONFIG.map(({ key, label, weight }, index) => {
            const criteria = criteriaBreakdown[key as keyof typeof criteriaBreakdown];
            if (!criteria || criteria.score === undefined) return null;

            const score = criteria.score;
            const reasoning = criteria.reasoning;
            const barWidth = `${(score / 10) * 100}%`;

            return (
              <HoverCard key={key} openDelay={200}>
                <HoverCardTrigger asChild>
                  <div
                    className="grid grid-cols-[1fr_auto_2fr_auto] items-center gap-3 cursor-help group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Label */}
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                      {label}
                    </span>

                    {/* Weight Badge */}
                    <span className="text-[10px] font-mono text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded">
                      {weight}
                    </span>

                    {/* Score Bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: barWidth,
                          backgroundColor: getScoreColor(score),
                        }}
                      />
                    </div>

                    {/* Score Number */}
                    <span
                      className="text-sm font-semibold tabular-nums min-w-[2.5rem] text-right"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score.toFixed(1)}
                    </span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  side="top"
                  className="w-80 text-sm leading-relaxed bg-card/95 backdrop-blur-xl"
                >
                  <p className="text-muted-foreground">{reasoning}</p>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
