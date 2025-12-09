import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SkillAuditItem } from '@/features/resume-analyzer/types';

export type SkillAuditProps = {
  skillItems: SkillAuditItem[];
};

type SkillItemProps = {
  item: SkillAuditItem;
};

function SkillItem({ item }: SkillItemProps) {
  const importanceVariant = item.importance === 'critical' ? 'destructive' : 'secondary';

  return (
    <div className="mt-4">
      <div>
        <h4 className="text-sm font-bold">{item.skill}</h4>
        <Badge variant={importanceVariant}>{item.importance}</Badge>
      </div>
      {item.evidence && <p>{item.evidence}</p>}
    </div>
  );
}

type SkillSectionProps = {
  title: string;
  items: SkillAuditItem[];
};

function SkillSection({ title, items }: SkillSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-bold">{title}</h3>
      <div>
        {items.map((item, index) => (
          <SkillItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function SkillAudit(props: SkillAuditProps) {
  const { skillItems } = props;
  const verified = skillItems.filter((item) => item.status === 'verified');
  const transferable = skillItems.filter((item) => item.status === 'transferable');
  const missing = skillItems.filter((item) => item.status === 'missing');

  const sections = [
    { title: 'Verified', items: verified },
    { title: 'Transferable', items: transferable },
    { title: 'Missing', items: missing },
  ].filter((section) => section.items.length > 0);

  return (
    <div>
      {sections.map((section, index) => (
        <div key={section.title}>
          {index > 0 && <Separator className="my-6" />}
          <SkillSection title={section.title} items={section.items} />
        </div>
      ))}
    </div>
  );
}
