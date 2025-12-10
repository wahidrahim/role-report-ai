import { z } from 'zod';

import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { AnalysisSchema } from '@/features/resume-analyzer/schemas/AnalysisSchema';

type AnalysisSchemaType = z.infer<typeof AnalysisSchema>;
type ActionPlanData = AnalysisSchemaType['actionPlan'];
type ActionItem = ActionPlanData['resumeOptimizations'][number];

export type ActionPlanProps = {
  actionPlan: ActionPlanData;
};

function ActionItem({ item }: { item: ActionItem }) {
  const priorityVariant = item.priority === 'high' ? 'destructive' : 'secondary';
  return (
    <div>
      <h4 className="text-sm font-bold flex items-center gap-2">
        {item.title}
        <Badge variant={priorityVariant}>{item.priority}</Badge>
      </h4>
      {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
    </div>
  );
}

type ActionSectionProps = {
  title: string;
  items: ActionItem[];
};

function ActionSection({ title, items }: ActionSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-bold mb-3">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index}>
            <ActionItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ActionPlan({ actionPlan }: ActionPlanProps) {
  if (!actionPlan) {
    return null;
  }

  const { resumeOptimizations, learningPriorities } = actionPlan;

  const hasResumeOptimizations = resumeOptimizations && resumeOptimizations.length > 0;
  const hasLearningPriorities = learningPriorities && learningPriorities.length > 0;

  if (!hasResumeOptimizations && !hasLearningPriorities) {
    return null;
  }

  return (
    <div className="space-y-6">
      {hasResumeOptimizations && (
        <ActionSection title="Resume Optimizations" items={resumeOptimizations} />
      )}

      {hasResumeOptimizations && hasLearningPriorities && <Separator />}

      {hasLearningPriorities && (
        <ActionSection title="Learning Priorities" items={learningPriorities} />
      )}
    </div>
  );
}
