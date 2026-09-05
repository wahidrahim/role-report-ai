'use client';

import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';

import type { SkillAssessment as SkillAssessmentResult } from '@/ai/analyze-fit/nodes/assessSkills';
import { Badge } from '@/core/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/core/components/ui/hover-card';
import { cn } from '@/core/lib/utils';

type SkillItem = Partial<SkillAssessmentResult['skills'][number]>;

type SkillAssessmentProps = {
  skills?: (SkillItem | undefined)[] | null;
};

type SkillVariant = 'verified' | 'transferable' | 'missing' | 'other';

const STATUS_GROUPS = [
  {
    status: 'verified',
    label: 'Verified',
    icon: CheckCircle2,
    card: 'bg-green-500/5 border-green-500/20',
    title: 'text-green-400',
  },
  {
    status: 'transferable',
    label: 'Transferable',
    icon: AlertTriangle,
    card: 'bg-yellow-500/5 border-yellow-500/20',
    title: 'text-yellow-400',
  },
  {
    status: 'missing',
    label: 'Missing',
    icon: XCircle,
    card: 'bg-red-500/5 border-red-500/20',
    title: 'text-red-400',
  },
] as const;

const BADGE_STYLES: Record<SkillVariant, string> = {
  verified: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
  transferable: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
  missing: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
  other: 'bg-secondary/50 text-secondary-foreground border-secondary hover:bg-secondary/70',
};

// Ambient background glow behind the hover card, tinted per status.
const GLOW_STYLES: Record<SkillVariant, string> = {
  verified: 'from-green-500/30 to-emerald-500/10',
  transferable: 'from-yellow-500/30 to-orange-500/10',
  missing: 'from-red-500/30 to-rose-500/10',
  other: 'from-white/10 to-transparent',
};

export function SkillAssessment(props: SkillAssessmentProps) {
  const { skills } = props;

  // The skill list is rebuilt on every stream frame, so the grouping is memoized on it.
  const groups = useMemo(() => {
    const items = (skills ?? []).filter((skill): skill is SkillItem => skill !== undefined);

    return {
      items,
      verified: items.filter((skill) => skill.status === 'verified'),
      transferable: items.filter((skill) => skill.status === 'transferable'),
      missing: items.filter((skill) => skill.status === 'missing'),
      other: items.filter(
        (skill) => skill.status && !STATUS_GROUPS.some((group) => group.status === skill.status),
      ),
    };
  }, [skills]);

  if (groups.items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_GROUPS.map((group) => {
          const Icon = group.icon;
          const groupItems = groups[group.status];

          return (
            <Card key={group.status} className={group.card}>
              <CardHeader className="pb-3">
                <CardTitle
                  className={cn(
                    'text-base flex items-center gap-2 font-bold uppercase tracking-wider',
                    group.title,
                  )}
                >
                  <Icon className="size-4" /> {group.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupItems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {groupItems.map((skill, i) => (
                      <SkillBadge key={i} skill={skill} variant={group.status} />
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    No {group.label.toLowerCase()} skills found.
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Other Skills */}
      {groups.other.length > 0 && (
        <Card className="bg-secondary/5 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-wider">
              <HelpCircle className="size-4" /> Other
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {groups.other.map((skill, i) => (
                <SkillBadge key={i} skill={skill} variant="other" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SkillBadge(props: { skill: SkillItem; variant: SkillVariant }) {
  const { skill, variant } = props;

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            'cursor-default px-3 py-1.5 text-sm transition-all border max-w-full shrink',
            BADGE_STYLES[variant],
          )}
        >
          <span className="truncate">{skill.skillName}</span>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 backdrop-blur-xl bg-black/80 border-white/10 text-white relative overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br',
            GLOW_STYLES[variant],
          )}
        />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-base">{skill.skillName}</h5>
            {skill.importance === 'critical' && (
              <Badge
                variant="destructive"
                className="text-[10px] px-1.5 h-5 bg-red-500/20 text-red-300 border-red-500/30"
              >
                CRITICAL
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {skill.reasoning || 'No detailed reasoning provided.'}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
