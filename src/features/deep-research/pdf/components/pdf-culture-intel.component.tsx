import { Text, View } from '@react-pdf/renderer';

import { colors, styles } from '@/features/analyze-fit/pdf/styles.util';

type PDFCultureIntelProps = {
  keywords?: string[];
  managerVibe?: string;
  engineeringCulture?: string;
};

export function PDFCultureIntel(props: PDFCultureIntelProps) {
  const { keywords, managerVibe, engineeringCulture } = props;

  if (!keywords?.length && !managerVibe && !engineeringCulture) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cultural Fingerprint</Text>

      {/* Keyword Badges */}
      {keywords && keywords.length > 0 && (
        <View style={[styles.row, { gap: 6, marginBottom: 12, flexWrap: 'wrap' }]}>
          {keywords.map((keyword, i) => (
            <View
              key={i}
              style={[
                styles.badge,
                {
                  backgroundColor: '#EDE9FE',
                  color: colors.primary,
                },
              ]}
            >
              <Text>#{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Manager Vibe */}
      {managerVibe && (
        <View style={[styles.card, { marginBottom: 8 }]}>
          <Text
            style={{
              fontSize: 8,
              fontFamily: 'Helvetica-Bold',
              color: colors.lightGray,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Manager Vibe
          </Text>
          <Text style={{ fontSize: 9, color: colors.mediumGray, lineHeight: 1.5 }}>
            {managerVibe}
          </Text>
        </View>
      )}

      {/* Engineering Culture */}
      {engineeringCulture && (
        <View style={styles.card}>
          <Text
            style={{
              fontSize: 8,
              fontFamily: 'Helvetica-Bold',
              color: colors.lightGray,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Engineering Culture
          </Text>
          <Text style={{ fontSize: 9, color: colors.mediumGray, lineHeight: 1.5 }}>
            {engineeringCulture}
          </Text>
        </View>
      )}
    </View>
  );
}
