import { z } from 'zod';

import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';

type AnalysisSchemaType = z.infer<typeof AnalysisSchema>;
type SkillAuditData = AnalysisSchemaType['skillAudit'];
type SkillItemType = SkillAuditData[number];

export type SkillAuditProps = {
  audit: SkillAuditData;
};

function VerifiedItem({ item }: { item: SkillItemType }) {
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

function MissingItem({ item }: { item: SkillItemType }) {
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

function TransferableItem({ item }: { item: SkillItemType }) {
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

export default function SkillAudit({ audit }: SkillAuditProps) {
  if (!audit || audit.length === 0) {
    return null;
  }

  const verified = audit.filter((item): item is SkillItemType => item.status === 'verified');
  const missing = audit.filter((item): item is SkillItemType => item.status === 'missing');
  const transferable = audit.filter(
    (item): item is SkillItemType => item.status === 'transferable',
  );

  const hasVerified = verified.length > 0;
  const hasTransferable = transferable.length > 0;
  const hasMissing = missing.length > 0;

  return (
    <div className="space-y-6">
      {hasVerified && (
        <SkillSection<SkillItemType>
          title="Verified Skills"
          items={verified}
          renderItem={(item) => <VerifiedItem item={item} />}
        />
      )}

      {hasVerified && hasTransferable && <Separator />}

      {hasTransferable && (
        <SkillSection<SkillItemType>
          title="Transferable Skills"
          items={transferable}
          renderItem={(item) => <TransferableItem item={item} />}
        />
      )}

      {hasTransferable && hasMissing && <Separator />}

      {hasMissing && (
        <SkillSection<SkillItemType>
          title="Missing Requirements"
          items={missing}
          renderItem={(item) => <MissingItem item={item} />}
        />
      )}
    </div>
  );
}
