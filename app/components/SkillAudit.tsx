import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export type SkillAuditItem = {
  skill: string;
  status: 'verified' | 'transferable' | 'missing';
  evidence?: string;
  importance: 'critical' | 'niceToHave';
};

export type SkillAuditProps = {
  skillItems: SkillAuditItem[];
};

type SkillItemProps = {
  item: SkillAuditItem;
  isLast: boolean;
};

function SkillItem({ item, isLast }: SkillItemProps) {
  const statusVariant =
    item.status === 'verified'
      ? 'default'
      : item.status === 'transferable'
        ? 'secondary'
        : 'outline';
  const importanceVariant = item.importance === 'critical' ? 'destructive' : 'secondary';

  return (
    <div>
      <h2>{item.skill}</h2>
      <div>
        <Badge variant={statusVariant}>{item.status}</Badge>
        <Badge variant={importanceVariant}>{item.importance}</Badge>
      </div>
      {item.evidence && <p>{item.evidence}</p>}
      {!isLast && <Separator className="my-4" />}
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
      <h3>{title}</h3>
      <div>
        {items.map((item, index) => (
          <SkillItem key={index} item={item} isLast={index === items.length - 1} />
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
