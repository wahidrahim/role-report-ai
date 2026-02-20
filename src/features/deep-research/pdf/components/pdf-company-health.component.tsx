import { Text, View } from '@react-pdf/renderer';

import { colors, styles } from '@/features/analyze-fit/pdf/styles.util';

type PDFCompanyHealthProps = {
  status?: string;
  summary?: string;
  redFlags?: string[];
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Stable/Growing':
      return { color: colors.success, bgColor: colors.successLight };
    case 'Risky/Layoffs':
      return { color: colors.error, bgColor: colors.errorLight };
    default:
      return { color: colors.warning, bgColor: colors.warningLight };
  }
};

export function PDFCompanyHealth(props: PDFCompanyHealthProps) {
  const { status, summary, redFlags } = props;

  if (!status && !summary) return null;

  const statusStyle = getStatusStyle(status || 'Unknown');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Company Health</Text>

      <View style={styles.card}>
        {/* Status Badge */}
        {status && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: statusStyle.bgColor,
                color: statusStyle.color,
                marginBottom: 8,
                alignSelf: 'flex-start',
              },
            ]}
          >
            <Text>{status.toUpperCase()}</Text>
          </View>
        )}

        {/* Summary */}
        {summary && (
          <Text style={{ fontSize: 10, color: colors.mediumGray, lineHeight: 1.5 }}>{summary}</Text>
        )}
      </View>

      {/* Red Flags */}
      {redFlags && redFlags.length > 0 && (
        <View style={{ marginTop: 4 }}>
          <Text
            style={{
              fontSize: 9,
              fontFamily: 'Helvetica-Bold',
              color: colors.error,
              marginBottom: 6,
              textTransform: 'uppercase',
            }}
          >
            Risk Factors
          </Text>
          {redFlags.map((flag, i) => (
            <View key={i} style={styles.listItem}>
              <View style={[styles.bullet, styles.bulletError]} />
              <Text style={{ fontSize: 9, color: colors.mediumGray, flex: 1 }}>{flag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
