'use client';

import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';

export type SkillAuditProps = {
  data?:
    | (
        | Partial<{
            skill: string;
            status: 'verified' | 'transferable' | 'missing';
            importance: 'critical' | 'nice-to-have';
            resumeMatch: string;
            reasoning: string;
          }>
        | undefined
      )[]
    | null;
};

type SkillAuditDataItem = NonNullable<NonNullable<SkillAuditProps['data']>[number]>;

type ProcessedAuditItem = {
  skill: string;
  status: 'verified' | 'transferable' | 'missing';
  importance: 'critical' | 'nice-to-have';
  resumeMatch: string;
  reasoning: string;
};

function VerifiedItem({ item }: { item: ProcessedAuditItem }) {
  const importanceVariant = item.importance === 'critical' ? 'destructive' : 'secondary';
  const importanceLabel = item.importance === 'nice-to-have' ? 'nice to have' : item.importance;

  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">
        {item.skill}
        <Badge variant={importanceVariant}>{importanceLabel}</Badge>
      </h4>
      {item.resumeMatch && item.resumeMatch !== 'None' && (
        <p className="text-sm font-medium mt-1">
          Found: <span className="text-foreground">{item.resumeMatch}</span>
        </p>
      )}
      {item.reasoning && <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>}
    </div>
  );
}

function MissingItem({ item }: { item: ProcessedAuditItem }) {
  const importanceVariant = item.importance === 'critical' ? 'destructive' : 'secondary';
  const importanceLabel = item.importance === 'nice-to-have' ? 'nice to have' : item.importance;

  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">
        {item.skill}
        <Badge variant={importanceVariant}>{importanceLabel}</Badge>
      </h4>
      {item.reasoning && <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>}
    </div>
  );
}

function TransferableItem({ item }: { item: ProcessedAuditItem }) {
  const importanceVariant = item.importance === 'critical' ? 'destructive' : 'secondary';
  const importanceLabel = item.importance === 'nice-to-have' ? 'nice to have' : item.importance;

  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">
        {item.skill}
        <Badge variant={importanceVariant}>{importanceLabel}</Badge>
      </h4>
      {item.resumeMatch && item.resumeMatch !== 'None' && (
        <p className="text-sm font-medium mt-1">
          Bridge: <span className="text-foreground">{item.resumeMatch}</span>
        </p>
      )}
      {item.reasoning && <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>}
    </div>
  );
}

type SkillSectionProps<T> = {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

function SkillSection<T>({ title, items, renderItem }: SkillSectionProps<T>) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-bold">{title}</h3>
      <ul className="space-y-4 mt-2">
        {items.map((item, index) => (
          <li key={index}>{renderItem(item, index)}</li>
        ))}
      </ul>
    </div>
  );
}

export default function SkillAudit(props: SkillAuditProps) {
  const { data } = props;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
        No skill audit data available
      </div>
    );
  }

  const auditData: ProcessedAuditItem[] = data
    .filter((item): item is SkillAuditDataItem => item !== undefined)
    .map((item) => ({
      skill: item.skill || '',
      status: (item.status || 'missing') as 'verified' | 'transferable' | 'missing',
      importance: (item.importance || 'nice-to-have') as 'critical' | 'nice-to-have',
      resumeMatch: item.resumeMatch || '',
      reasoning: item.reasoning || '',
    }));

  const verified = auditData.filter(
    (item): item is ProcessedAuditItem & { status: 'verified' } => item.status === 'verified',
  );
  const missing = auditData.filter(
    (item): item is ProcessedAuditItem & { status: 'missing' } => item.status === 'missing',
  );
  const transferable = auditData.filter(
    (item): item is ProcessedAuditItem & { status: 'transferable' } =>
      item.status === 'transferable',
  );

  const hasVerified = verified.length > 0;
  const hasTransferable = transferable.length > 0;
  const hasMissing = missing.length > 0;

  return (
    <div className="space-y-6">
      {hasVerified && (
        <SkillSection<ProcessedAuditItem>
          title="Verified Skills"
          items={verified}
          renderItem={(item) => <VerifiedItem item={item} />}
        />
      )}

      {hasVerified && hasTransferable && <Separator />}

      {hasTransferable && (
        <SkillSection<ProcessedAuditItem>
          title="Transferable Skills"
          items={transferable}
          renderItem={(item) => <TransferableItem item={item} />}
        />
      )}

      {hasTransferable && hasMissing && <Separator />}

      {hasMissing && (
        <SkillSection<ProcessedAuditItem>
          title="Missing Requirements"
          items={missing}
          renderItem={(item) => <MissingItem item={item} />}
        />
      )}
    </div>
  );
}
