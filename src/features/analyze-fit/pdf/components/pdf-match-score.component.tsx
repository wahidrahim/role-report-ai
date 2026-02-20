import { Text, View } from '@react-pdf/renderer';

import { colors, getScoreColor, styles } from '@/features/analyze-fit/pdf/styles.util';

type CriteriaBreakdown = {
  coreSkillsMatch?: { score: number; reasoning?: string };
  experienceRelevance?: { score: number; reasoning?: string };
  skillGapsSeverity?: { score: number; reasoning?: string };
  transferableSkills?: { score: number; reasoning?: string };
  overallPotential?: { score: number; reasoning?: string };
};

type PDFMatchScoreProps = {
  suitabilityScore?: number;
  bottomLine?: string;
  keyStrengths?: string[];
  criticalGaps?: string[];
  criteriaBreakdown?: CriteriaBreakdown;
};

const CRITERIA_CONFIG = [
  { key: 'coreSkillsMatch' as const, label: 'Core Skills Match', weight: '35%' },
  { key: 'experienceRelevance' as const, label: 'Experience Relevance', weight: '25%' },
  { key: 'skillGapsSeverity' as const, label: 'Skill Gaps Severity', weight: '20%' },
  { key: 'transferableSkills' as const, label: 'Transferable Skills', weight: '10%' },
  { key: 'overallPotential' as const, label: 'Overall Potential', weight: '10%' },
];

export function PDFMatchScore(props: PDFMatchScoreProps) {
  const { suitabilityScore, bottomLine, keyStrengths, criticalGaps, criteriaBreakdown } = props;

  if (suitabilityScore === undefined) return null;

  const scoreColor = getScoreColor(suitabilityScore);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Match Score</Text>

      <View style={styles.card}>
        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {suitabilityScore}
            <Text style={{ fontSize: 24, color: colors.lightGray }}>/10</Text>
          </Text>
          <Text style={styles.scoreLabel}>Overall Suitability Score</Text>
        </View>

        {/* Bottom Line */}
        {bottomLine && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, color: colors.mediumGray, textAlign: 'center' }}>
              {bottomLine}
            </Text>
          </View>
        )}

        {/* Strengths & Gaps */}
        {(keyStrengths?.length || criticalGaps?.length) && (
          <View style={[styles.row, { gap: 16, marginBottom: 16 }]}>
            {/* Key Strengths */}
            {keyStrengths && keyStrengths.length > 0 && (
              <View
                style={[styles.col, { padding: 12, backgroundColor: '#D1FAE5', borderRadius: 6 }]}
              >
                <Text
                  style={[
                    styles.textBold,
                    {
                      fontSize: 9,
                      color: colors.success,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    },
                  ]}
                >
                  Key Strengths
                </Text>
                {keyStrengths.map((strength, i) => (
                  <View
                    key={i}
                    style={[styles.listItem, { borderBottomWidth: 0, marginBottom: 4 }]}
                  >
                    <View style={[styles.bullet, styles.bulletSuccess]} />
                    <Text style={{ flex: 1, fontSize: 9, color: '#065F46' }}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Critical Gaps */}
            {criticalGaps && criticalGaps.length > 0 && (
              <View
                style={[styles.col, { padding: 12, backgroundColor: '#FEE2E2', borderRadius: 6 }]}
              >
                <Text
                  style={[
                    styles.textBold,
                    {
                      fontSize: 9,
                      color: colors.error,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    },
                  ]}
                >
                  Critical Gaps
                </Text>
                {criticalGaps.map((gap, i) => (
                  <View
                    key={i}
                    style={[styles.listItem, { borderBottomWidth: 0, marginBottom: 4 }]}
                  >
                    <View style={[styles.bullet, styles.bulletError]} />
                    <Text style={{ flex: 1, fontSize: 9, color: '#991B1B' }}>{gap}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Criteria Breakdown */}
        {criteriaBreakdown && (
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 6 }}>
            <Text
              style={[
                styles.textBold,
                {
                  fontSize: 9,
                  color: colors.mediumGray,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                },
              ]}
            >
              Assessment Breakdown
            </Text>
            {CRITERIA_CONFIG.map(({ key, label, weight }) => {
              const criteria = criteriaBreakdown[key];
              if (!criteria?.score) return null;

              const score = criteria.score;
              const barWidthPercent = (score / 10) * 100;

              return (
                <View key={key} style={[styles.row, { alignItems: 'center', marginBottom: 8 }]}>
                  {/* Label */}
                  <Text style={{ fontSize: 9, color: colors.mediumGray, width: 120 }}>{label}</Text>

                  {/* Weight */}
                  <Text
                    style={{
                      fontSize: 8,
                      color: colors.lightGray,
                      backgroundColor: '#E5E7EB',
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 2,
                      marginRight: 8,
                    }}
                  >
                    {weight}
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${barWidthPercent}%`, backgroundColor: getScoreColor(score) },
                      ]}
                    />
                  </View>

                  {/* Score */}
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: 'Helvetica-Bold',
                      color: getScoreColor(score),
                      width: 24,
                      textAlign: 'right',
                    }}
                  >
                    {score.toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
