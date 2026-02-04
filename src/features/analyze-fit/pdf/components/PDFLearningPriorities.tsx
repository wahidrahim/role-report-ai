import { Text, View } from '@react-pdf/renderer';

import { colors, getPriorityBadgeStyle, styles } from '../styles';

type LearningItem = {
  title?: string;
  priority?: string;
  category?: string;
  description?: string;
  estimatedTime?: string;
  resource?: string;
  outcome?: string;
};

type PDFLearningPrioritiesProps = {
  priorities?: (LearningItem | undefined)[] | null;
};

const getCategoryInfo = (category: string) => {
  switch (category) {
    case 'critical-gap':
      return { label: 'Critical Gap', color: colors.error, bgColor: '#FEE2E2' };
    case 'quick-win':
      return { label: 'Quick Win', color: colors.success, bgColor: '#D1FAE5' };
    case 'interview-prep':
      return { label: 'Interview Prep', color: '#EA580C', bgColor: '#FFEDD5' };
    default:
      return { label: category, color: colors.mediumGray, bgColor: '#F3F4F6' };
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

export function PDFLearningPriorities({ priorities }: PDFLearningPrioritiesProps) {
  const items = (priorities ?? []).filter((item): item is LearningItem => item !== undefined);

  if (items.length === 0) return null;

  const sortedItems = [...items].sort(
    (a, b) => getPriorityValue(b.priority || '') - getPriorityValue(a.priority || ''),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Learning Priorities</Text>

      {sortedItems.map((item, i) => {
        const categoryInfo = item.category ? getCategoryInfo(item.category) : null;

        return (
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
              {categoryInfo && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: categoryInfo.bgColor, color: categoryInfo.color },
                  ]}
                >
                  <Text>{categoryInfo.label}</Text>
                </View>
              )}

              {/* Time Estimate */}
              {item.estimatedTime && (
                <Text style={{ fontSize: 8, color: colors.lightGray }}>{item.estimatedTime}</Text>
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

            {/* Resource */}
            {item.resource && (
              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: '#DBEAFE', color: '#1E40AF', marginBottom: 6 },
                ]}
              >
                <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>
                  Resource
                </Text>
                <Text>{item.resource}</Text>
              </View>
            )}

            {/* Outcome */}
            {item.outcome && (
              <View style={{ paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <Text
                  style={{
                    fontSize: 7,
                    color: colors.lightGray,
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  After completing
                </Text>
                <Text style={{ fontSize: 9, color: colors.success, fontStyle: 'italic' }}>
                  &quot;{item.outcome}&quot;
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
