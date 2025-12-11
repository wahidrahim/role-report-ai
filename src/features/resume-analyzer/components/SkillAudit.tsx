'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

export type SkillAuditProps = {
  data?: Partial<{
    verified: (
      | Partial<{
          skillName: string;
          importance: 'critical' | 'nice-to-have';
          reasoning: string;
        }>
      | undefined
    )[];
    transferable: (
      | Partial<{
          skillName: string;
          importance: 'critical' | 'nice-to-have';
          reasoning: string;
        }>
      | undefined
    )[];
    missing: (
      | Partial<{
          skillName: string;
          importance: 'critical' | 'nice-to-have';
          reasoning: string;
        }>
      | undefined
    )[];
  }> | null;
};

export function SkillAudit(props: SkillAuditProps) {
  const { data } = props;
  const { verified = [], transferable = [], missing = [] } = data || {};

  const verifiedSkills = verified.filter(
    (
      skill,
    ): skill is Partial<{
      skillName: string;
      importance: 'critical' | 'nice-to-have';
      reasoning: string;
    }> => skill !== undefined,
  );
  const transferableSkills = transferable.filter(
    (
      skill,
    ): skill is Partial<{
      skillName: string;
      importance: 'critical' | 'nice-to-have';
      reasoning: string;
    }> => skill !== undefined,
  );
  const missingSkills = missing.filter(
    (
      skill,
    ): skill is Partial<{
      skillName: string;
      importance: 'critical' | 'nice-to-have';
      reasoning: string;
    }> => skill !== undefined,
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
              <li key={index}>
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
              <li key={index}>
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
              <li key={index}>
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
    </div>
  );
}
