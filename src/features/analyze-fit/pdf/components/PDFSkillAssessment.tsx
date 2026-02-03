import { Text, View } from '@react-pdf/renderer';

import { colors, styles } from '../styles';

type SkillItem = {
  skillName?: string;
  status?: string;
  importance?: string;
  reasoning?: string;
};

type PDFSkillAssessmentProps = {
  skills?: (SkillItem | undefined)[] | null;
};

export function PDFSkillAssessment({ skills }: PDFSkillAssessmentProps) {
  const items = (skills ?? []).filter((skill): skill is SkillItem => skill !== undefined);

  if (items.length === 0) return null;

  const groups = {
    verified: items.filter((s) => s.status === 'verified'),
    transferable: items.filter((s) => s.status === 'transferable'),
    missing: items.filter((s) => s.status === 'missing'),
  };

  const columnConfig = [
    { key: 'verified' as const, label: 'Verified', color: colors.success, bgColor: '#D1FAE5' },
    { key: 'transferable' as const, label: 'Transferable', color: colors.warning, bgColor: '#FEF3C7' },
    { key: 'missing' as const, label: 'Missing', color: colors.error, bgColor: '#FEE2E2' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skill Assessment</Text>

      <View style={[styles.row, { gap: 12 }]}>
        {columnConfig.map(({ key, label, color, bgColor }) => (
          <View key={key} style={[styles.colThird, { backgroundColor: bgColor, borderRadius: 6, padding: 10 }]}>
            <Text
              style={[
                styles.textBold,
                { fontSize: 10, color, marginBottom: 8, textTransform: 'uppercase' },
              ]}
            >
              {label}
            </Text>
            {groups[key].length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {groups[key].map((skill, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: 'white',
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: color,
                    }}
                  >
                    <Text style={{ fontSize: 8, color }}>
                      {skill.skillName}
                      {skill.importance === 'critical' && ' *'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 8, color: colors.lightGray, fontStyle: 'italic' }}>
                None found
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Legend for critical skills */}
      {items.some((s) => s.importance === 'critical') && (
        <Text style={{ fontSize: 7, color: colors.lightGray, marginTop: 6 }}>
          * Critical skill for the role
        </Text>
      )}
    </View>
  );
}
