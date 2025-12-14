'use client';

import type { SkillAssessment as SkillAssessmentResult } from '@/ai/analyze-fit/nodes/assessSkills';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

type SkillItem = Partial<SkillAssessmentResult['skills'][number]>;

export type SkillAssessmentProps = {
  /**
   * Skill assessment results.
   * During streaming this may contain partial items or undefined entries.
   */
  skills?: (SkillItem | undefined)[] | null;
};

export function SkillAssessment(props: SkillAssessmentProps) {
  const items = (props.skills ?? []).filter((skill): skill is SkillItem => skill !== undefined);

  const verifiedSkills = items.filter((skill) => skill.status === 'verified');
  const transferableSkills = items.filter((skill) => skill.status === 'transferable');
  const missingSkills = items.filter((skill) => skill.status === 'missing');
  const unknownStatusSkills = items.filter(
    (skill) =>
      skill.status !== 'verified' && skill.status !== 'transferable' && skill.status !== 'missing',
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Verified Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {verifiedSkills.map((skill, index) => (
              <li key={`${skill.skillName ?? 'unknown'}-verified-${index}`}>
                <div className="font-medium">{skill.skillName || 'Unknown Skill'}</div>
                {skill.importance && (
                  <div className="text-xs text-muted-foreground">
                    {skill.importance === 'critical' ? 'Critical' : 'Nice-to-have'}
                  </div>
                )}
                {skill.reasoning && (
                  <div className="text-sm text-muted-foreground">{skill.reasoning}</div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transferable Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {transferableSkills.map((skill, index) => (
              <li key={`${skill.skillName ?? 'unknown'}-transferable-${index}`}>
                <div className="font-medium">{skill.skillName || 'Unknown Skill'}</div>
                {skill.importance && (
                  <div className="text-xs text-muted-foreground">
                    {skill.importance === 'critical' ? 'Critical' : 'Nice-to-have'}
                  </div>
                )}
                {skill.reasoning && (
                  <div className="text-sm text-muted-foreground">{skill.reasoning}</div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Missing Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {missingSkills.map((skill, index) => (
              <li key={`${skill.skillName ?? 'unknown'}-missing-${index}`}>
                <div className="font-medium">{skill.skillName || 'Unknown Skill'}</div>
                {skill.importance && (
                  <div className="text-xs text-muted-foreground">
                    {skill.importance === 'critical' ? 'Critical' : 'Nice-to-have'}
                  </div>
                )}
                {skill.reasoning && (
                  <div className="text-sm text-muted-foreground">{skill.reasoning}</div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {unknownStatusSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {unknownStatusSkills.map((skill, index) => (
                <li key={`${skill.skillName ?? 'unknown'}-other-${index}`}>
                  <div className="font-medium">{skill.skillName || 'Unknown Skill'}</div>
                  {skill.reasoning && (
                    <div className="text-sm text-muted-foreground">{skill.reasoning}</div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
