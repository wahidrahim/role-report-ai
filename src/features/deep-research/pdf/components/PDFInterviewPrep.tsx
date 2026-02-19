import { Text, View } from '@react-pdf/renderer';

import { colors, styles } from '@/features/analyze-fit/pdf/styles';

type InterviewFormat = {
  style?: string;
  description?: string;
  evidence?: string;
};

type CrashCourse = {
  topic?: string;
  companyContext?: string;
  studyTip?: string;
};

type StrategicQuestion = {
  question?: string;
  context?: string;
};

type PDFInterviewPrepProps = {
  interviewFormat?: InterviewFormat;
  skillGapCrashCourses?: CrashCourse[];
  strategicQuestions?: StrategicQuestion[];
};

export function PDFInterviewPrep({
  interviewFormat,
  skillGapCrashCourses,
  strategicQuestions,
}: PDFInterviewPrepProps) {
  if (!interviewFormat && !skillGapCrashCourses?.length && !strategicQuestions?.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interview Prep</Text>

      {/* Interview Format */}
      {interviewFormat && (
        <View style={[styles.card, { marginBottom: 12 }]}>
          <View style={[styles.row, { alignItems: 'center', gap: 6, marginBottom: 6 }]}>
            <Text
              style={{
                fontSize: 8,
                fontFamily: 'Helvetica-Bold',
                color: colors.lightGray,
                textTransform: 'uppercase',
              }}
            >
              Interview Format
            </Text>
            {interviewFormat.style && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: '#EDE9FE', color: colors.primary },
                ]}
              >
                <Text>{interviewFormat.style}</Text>
              </View>
            )}
          </View>

          {interviewFormat.description && (
            <Text style={{ fontSize: 9, color: colors.mediumGray, lineHeight: 1.5, marginBottom: 6 }}>
              {interviewFormat.description}
            </Text>
          )}

          {interviewFormat.evidence && (
            <View
              style={[
                styles.exampleBox,
                { backgroundColor: '#F3F4F6', color: colors.mediumGray },
              ]}
            >
              <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2, color: colors.lightGray }}>
                Evidence
              </Text>
              <Text style={{ fontStyle: 'italic', fontSize: 9 }}>
                &quot;{interviewFormat.evidence}&quot;
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Crash Courses */}
      {skillGapCrashCourses && skillGapCrashCourses.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Helvetica-Bold',
              color: colors.darkGray,
              marginBottom: 8,
            }}
          >
            Skill Gap Crash Courses
          </Text>
          {skillGapCrashCourses.map((course, i) => (
            <View key={i} style={[styles.card, { marginBottom: 6 }]}>
              {course.topic && (
                <Text
                  style={[styles.textBold, { fontSize: 10, color: colors.primary, marginBottom: 4 }]}
                >
                  {course.topic}
                </Text>
              )}

              {course.companyContext && (
                <View style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 7, textTransform: 'uppercase', color: colors.lightGray, marginBottom: 2 }}>
                    Company Context
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.mediumGray }}>{course.companyContext}</Text>
                </View>
              )}

              {course.studyTip && (
                <View
                  style={[
                    styles.exampleBox,
                    { backgroundColor: '#EDE9FE', color: colors.primary },
                  ]}
                >
                  <Text style={{ fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }}>
                    Study Tip
                  </Text>
                  <Text style={{ fontSize: 9 }}>{course.studyTip}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Strategic Questions */}
      {strategicQuestions && strategicQuestions.length > 0 && (
        <View>
          <Text
            style={{
              fontSize: 10,
              fontFamily: 'Helvetica-Bold',
              color: colors.darkGray,
              marginBottom: 8,
            }}
          >
            Strategic Questions
          </Text>
          {strategicQuestions.map((q, i) => (
            <View key={i} style={[styles.listItem, { alignItems: 'flex-start' }]}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#EDE9FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.primary }}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.textBold, { fontSize: 10, marginBottom: 2 }]}>
                  {q.question}
                </Text>
                {q.context && (
                  <Text style={{ fontSize: 8, color: colors.lightGray, fontStyle: 'italic' }}>
                    {q.context}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
