export type SkillAuditItem = {
  skill: string;
  status: 'verified' | 'transferable' | 'missing';
  evidence?: string;
  importance: 'critical' | 'niceToHave';
};

export type SkillChartItem = {
  axis: string;
  requiredLevel: number;
  userLevel: number;
  reasoning: string;
};
