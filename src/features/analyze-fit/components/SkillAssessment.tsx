'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

import type { SkillAssessment as SkillAssessmentResult } from '@/ai/analyze-fit/nodes/assessSkills';
import { Badge } from '@/core/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/core/components/ui/hover-card';

type SkillItem = Partial<SkillAssessmentResult['skills'][number]>;

export type SkillAssessmentProps = {
  skills?: (SkillItem | undefined)[] | null;
};

// ... imports remain the same ...

export function SkillAssessment({ skills }: SkillAssessmentProps) {
  const items = (skills ?? []).filter((skill): skill is SkillItem => skill !== undefined);

  const groups = {
    verified: items.filter((s) => s.status === 'verified'),
    transferable: items.filter((s) => s.status === 'transferable'),
    missing: items.filter((s) => s.status === 'missing'),
    other: items.filter((s) => !['verified', 'transferable', 'missing'].includes(s.status || '')),
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verified Skills */}
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-400 font-bold uppercase tracking-wider">
              <CheckCircle2 className="size-4" /> Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groups.verified.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {groups.verified.map((skill, i) => (
                  <SkillBadge key={i} skill={skill} variant="verified" />
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No verified skills found.
              </span>
            )}
          </CardContent>
        </Card>

        {/* Transferable Skills */}
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-wider">
              <AlertTriangle className="size-4" /> Transferable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groups.transferable.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {groups.transferable.map((skill, i) => (
                  <SkillBadge key={i} skill={skill} variant="transferable" />
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No transferable skills found.
              </span>
            )}
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
              <XCircle className="size-4" /> Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groups.missing.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {groups.missing.map((skill, i) => (
                  <SkillBadge key={i} skill={skill} variant="missing" />
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">No missing skills found.</span>
            )}
          </CardContent>
        </Card>
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

function SkillBadge({
  skill,
  variant,
}: {
  skill: SkillItem;
  variant: 'verified' | 'transferable' | 'missing' | 'other';
}) {
  const styles = {
    verified: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
    transferable: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
    missing: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    other: 'bg-secondary/50 text-secondary-foreground border-secondary hover:bg-secondary/70',
  };

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className={`cursor-default px-3 py-1.5 text-sm transition-all border ${styles[variant]}`}
        >
          {skill.skillName}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 backdrop-blur-xl bg-black/80 border-white/10 text-white relative overflow-hidden">
        {/* Ambient background glow based on variant */}
        <div
          className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${
            variant === 'verified'
              ? 'from-green-500/30 to-emerald-500/10'
              : variant === 'transferable'
                ? 'from-yellow-500/30 to-orange-500/10'
                : variant === 'missing'
                  ? 'from-red-500/30 to-rose-500/10'
                  : 'from-white/10 to-transparent'
          }`}
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
