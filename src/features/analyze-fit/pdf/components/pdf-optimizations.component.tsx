import { Text, View } from '@react-pdf/renderer';

import { colors, getPriorityBadgeStyle, styles } from '@/features/analyze-fit/pdf/styles.util';

type OptimizationExample =
  | { type: 'replacement'; before: string; after: string }
  | { type: 'addition'; content: string; location?: string }
  | { type: 'removal'; content: string }
  | { type: 'structural'; suggestion: string }
  | { type: 'general'; suggestion: string };

type OptimizationItem = {
  title?: string;
  priority?: string;
  category?: string;
  description?: string;
  estimatedEffort?: string;
  example?: OptimizationExample;
};

type PDFOptimizationsProps = {
  optimizations?: (OptimizationItem | undefined)[] | null;
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'keyword-optimization':
      return 'Keywords';
    case 'quantification':
      return 'Metrics';
    case 'experience-alignment':
      return 'Experience';
    case 'skills-section':
      return 'Skills';
    case 'format-structure':
      return 'Format';
    default:
      return category;
  }
};

const getPriorityValue = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
};

export function PDFOptimizations(props: PDFOptimizationsProps) {
  const { optimizations } = props;

  const items = (optimizations ?? []).filter(
    (item): item is OptimizationItem => item !== undefined,
  );

  if (items.length === 0) return null;

  const sortedItems = [...items].sort(
    (a, b) => getPriorityValue(b.priority || '') - getPriorityValue(a.priority || ''),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resume Optimizations</Text>

      {sortedItems.map((item, i) => (
        <View key={i} style={[styles.card, { marginBottom: 8 }]}>
          {/* Header Row */}
          <View style={[styles.row, { alignItems: 'center', marginBottom: 6, gap: 6 }]}>
            {/* Priority Badge */}
            {item.priority && (
              <View style={[styles.badge, getPriorityBadgeStyle(item.priority)]}>
                <Text>{item.priority.toUpperCase()}</Text>
              </View>
            )}

            {/* Category Badge */}
            {item.category && (
              <View style={[styles.badge, { backgroundColor: '#EDE9FE', color: colors.primary }]}>
                <Text>{getCategoryLabel(item.category)}</Text>
              </View>
            )}

            {/* Effort */}
            {item.estimatedEffort && (
              <Text style={{ fontSize: 8, color: colors.lightGray }}>{item.estimatedEffort}</Text>
            )}
          </View>

          {/* Title */}
          {item.title && (
            <Text style={[styles.textBold, { fontSize: 10, marginBottom: 4 }]}>{item.title}</Text>
          )}

          {/* Description */}
          {item.description && (
            <Text style={{ fontSize: 9, color: colors.mediumGray, marginBottom: 6 }}>
              {item.description}
            </Text>
          )}

          {/* Example */}
          {item.example && <ExampleRenderer example={item.example} />}
        </View>
      ))}
    </View>
  );
}

function ExampleRenderer(props: { example: OptimizationExample }) {
  const { example } = props;

  switch (example.type) {
    case 'replacement':
      return (
        <View>
          <View style={[styles.exampleBox, styles.exampleBefore]}>
            <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>Before</Text>
            <Text>{example.before}</Text>
          </View>
          <View style={[styles.exampleBox, styles.exampleAfter]}>
            <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>After</Text>
            <Text>{example.after}</Text>
          </View>
        </View>
      );

    case 'addition':
      return (
        <View style={[styles.exampleBox, { backgroundColor: '#D1FAE5', color: '#065F46' }]}>
          <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>Add</Text>
          <Text>{example.content}</Text>
          {example.location && (
            <Text style={{ fontSize: 7, marginTop: 4, color: colors.mediumGray }}>
              Location: {example.location}
            </Text>
          )}
        </View>
      );

    case 'removal':
      return (
        <View style={[styles.exampleBox, styles.exampleBefore]}>
          <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>Remove</Text>
          <Text style={{ textDecoration: 'line-through' }}>{example.content}</Text>
        </View>
      );

    case 'structural':
      return (
        <View style={[styles.exampleBox, { backgroundColor: '#DBEAFE', color: '#1E40AF' }]}>
          <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>
            Restructure
          </Text>
          <Text>{example.suggestion}</Text>
        </View>
      );

    case 'general':
      return (
        <View style={[styles.exampleBox, { backgroundColor: '#FEF3C7', color: '#92400E' }]}>
          <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>Tip</Text>
          <Text>{example.suggestion}</Text>
        </View>
      );

    default:
      return null;
  }
}
