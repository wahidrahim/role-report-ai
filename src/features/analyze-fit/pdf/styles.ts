import { StyleSheet } from '@react-pdf/renderer';

// Professional color scheme with violet accents
export const colors = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  dark: '#111827',
  darkGray: '#1F2937',
  mediumGray: '#4B5563',
  lightGray: '#9CA3AF',
  border: '#E5E7EB',
  background: '#FFFFFF',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
};

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 4,
  },
  headerDate: {
    fontSize: 10,
    color: colors.lightGray,
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkGray,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  colHalf: {
    width: '50%',
  },
  colThird: {
    width: '33.33%',
  },
  // Score styles
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 4,
  },
  // Badge styles
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  badgeCritical: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  badgeHigh: {
    backgroundColor: '#FFEDD5',
    color: '#EA580C',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  badgeLow: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  // List styles
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 4,
  },
  bulletSuccess: {
    backgroundColor: colors.success,
  },
  bulletWarning: {
    backgroundColor: colors.warning,
  },
  bulletError: {
    backgroundColor: colors.error,
  },
  bulletPrimary: {
    backgroundColor: colors.primary,
  },
  // Text styles
  textBold: {
    fontFamily: 'Helvetica-Bold',
  },
  textSmall: {
    fontSize: 9,
    color: colors.mediumGray,
  },
  textMuted: {
    color: colors.lightGray,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.lightGray,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // Chart image
  chartImage: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'contain',
    marginVertical: 12,
  },
  // Progress bar for criteria breakdown
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  // Example styles
  exampleBox: {
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
    fontSize: 9,
  },
  exampleBefore: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  exampleAfter: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    marginTop: 4,
  },
});

export const getScoreColor = (score: number): string => {
  if (score >= 8) return colors.success;
  if (score >= 6) return '#65A30D'; // lime-600
  if (score >= 4) return colors.warning;
  return colors.error;
};

export const getPriorityBadgeStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return styles.badgeCritical;
    case 'high':
      return styles.badgeHigh;
    case 'medium':
      return styles.badgeMedium;
    case 'low':
      return styles.badgeLow;
    default:
      return styles.badgeMedium;
  }
};
