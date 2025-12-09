import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';

type AnalysisSchemaType = z.infer<typeof AnalysisSchema>;
type SkillAuditData = AnalysisSchemaType['skillAudit'];
type VerifiedItemType = SkillAuditData['verified'][number];
type MissingItemType = SkillAuditData['missing'][number];
type TransferableItemType = SkillAuditData['transferable'][number];

export type SkillAuditProps = {
  audit: SkillAuditData;
};

function VerifiedItem({ item }: { item: VerifiedItemType }) {
  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">{item.skill}</h4>
      {item.evidence && <p className="text-sm text-muted-foreground mt-1">{item.evidence}</p>}
    </div>
  );
}

function MissingItem({ item }: { item: MissingItemType }) {
  const importanceVariant = item.importance === 'critical' ? 'destructive' : 'secondary';
  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">
        {item.skill}
        <Badge variant={importanceVariant}>{item.importance}</Badge>
      </h4>
    </div>
  );
}

function TransferableItem({ item }: { item: TransferableItemType }) {
  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">{item.missingSkill}</h4>
      <p className="text-sm font-medium mt-1">
        Bridge: <span className="text-foreground">{item.candidateSkill}</span>
      </p>
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
  if (!audit) {
    return null;
  }

  const { verified, transferable, missing } = audit;

  const hasVerified = verified && verified.length > 0;
  const hasTransferable = transferable && transferable.length > 0;
  const hasMissing = missing && missing.length > 0;

  return (
    <div className="space-y-6">
      {hasVerified && (
        <SkillSection
          title="Verified Skills"
          items={verified}
          renderItem={(item) => <VerifiedItem item={item} />}
        />
      )}

      {hasVerified && hasMissing && <Separator />}

      {hasMissing && (
        <SkillSection
          title="Missing Requirements"
          items={missing}
          renderItem={(item) => <MissingItem item={item} />}
        />
      )}

      {hasMissing && hasTransferable && <Separator />}

      {hasTransferable && (
        <SkillSection
          title="Transferable Skills"
          items={transferable}
          renderItem={(item) => <TransferableItem item={item} />}
        />
      )}
    </div>
  );
}
