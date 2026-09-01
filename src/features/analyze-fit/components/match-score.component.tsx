import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/core/components/ui/hover-card';
import { cn } from '@/core/lib/utils';

type MatchScoreProps = {
  suitabilityAssessment?: Partial<SuitabilityAssessment> | null;
  isLoading?: boolean;
};

type CriteriaKey = keyof NonNullable<SuitabilityAssessment['criteriaBreakdown']>;

const CRITERIA_CONFIG: readonly { key: CriteriaKey; label: string; weight: string }[] = [
  { key: 'coreSkillsMatch', label: 'Core Skills Match', weight: '35%' },
  { key: 'experienceRelevance', label: 'Experience Relevance', weight: '25%' },
  { key: 'skillGapsSeverity', label: 'Skill Gaps Severity', weight: '20%' },
  { key: 'transferableSkills', label: 'Transferable Skills', weight: '10%' },
  { key: 'overallPotential', label: 'Overall Potential', weight: '10%' },
];

const PANELS = [
  {
    key: 'keyStrengths',
    label: 'Key Strengths',
    icon: CheckCircle2,
    panel: 'bg-emerald-500/5 border-emerald-500/20',
    heading: 'text-emerald-400/70',
    entry: 'text-emerald-300/90 border-emerald-500/40',
  },
  {
    key: 'criticalGaps',
    label: 'Critical Gaps',
    icon: AlertTriangle,
    panel: 'bg-rose-500/5 border-rose-500/20',
    heading: 'text-rose-400/70',
    entry: 'text-rose-300/90 border-rose-500/40',
  },
] as const;

/**
 * Hue curve as [score, hue] points: red through orange below 4, a distinct amber/gold band at 5-6
 * so the colour cannot turn green prematurely, then green into deep emerald at 10.
 */
const HUE_POINTS = [
  [0, 0],
  [4, 25],
  [6, 45],
  [8, 100],
  [10, 150],
] as const;

const getScoreColor = (score: number) => {
  const upperIndex = HUE_POINTS.findIndex(
    ([bound], i) => i > 0 && score >= HUE_POINTS[i - 1][0] && score <= bound,
  );
  const [lowScore, lowHue] = upperIndex === -1 ? HUE_POINTS[0] : HUE_POINTS[upperIndex - 1];
  const [highScore, highHue] =
    upperIndex === -1 ? HUE_POINTS[HUE_POINTS.length - 1] : HUE_POINTS[upperIndex];
  const progress = (score - lowScore) / (highScore - lowScore);
  const hue = lowHue + (highHue - lowHue) * progress;

  // Brighter for low scores so they read as an alert, deeper for high scores so they read as rich.
  const lightness = 60 - (score / 10) * 10;

  return `hsl(${hue}, 95%, ${lightness}%)`;
};

export function MatchScore(props: MatchScoreProps) {
  const { suitabilityAssessment, isLoading } = props;

  const matchScore = suitabilityAssessment?.suitabilityScore;

  // Only show loading state if we're loading AND we don't have a score yet
  if (isLoading && matchScore === undefined) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in duration-500">
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
          {PANELS.map(({ key, label, icon: Icon, panel, heading, entry }) => {
            const entries = key === 'keyStrengths' ? keyStrengths : criticalGaps;

            if (!entries || entries.length === 0) return null;

            return (
              <div key={key} className={cn('p-4 rounded-xl space-y-3 border', panel)}>
                <h4
                  className={cn(
                    'text-xs font-mono uppercase tracking-widest flex items-center gap-2',
                    heading,
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </h4>
                <ul className="space-y-2">
                  {entries.map((value, i) => (
                    <li key={i} className={cn('text-sm pl-3 border-l-2', entry)}>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Criteria Breakdown */}
      {criteriaBreakdown && (
        <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
            Assessment Breakdown
          </h4>
          {CRITERIA_CONFIG.map(({ key, label, weight }) => {
            const criteria = criteriaBreakdown[key];
            if (!criteria || criteria.score === undefined) return null;

            const score = criteria.score;
            const reasoning = criteria.reasoning;
            const barWidth = `${(score / 10) * 100}%`;

            return (
              <HoverCard key={key} openDelay={200}>
                <HoverCardTrigger asChild>
                  <div className="grid grid-cols-[1fr_auto_2fr_auto] items-center gap-3 cursor-help group">
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
