'use client';

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { z } from 'zod';

import { analysisSchema } from '@/schemas/analysisSchema';

export type SkillsRadarChartItem = z.infer<
  typeof analysisSchema
>['analysis']['skills_radar_chart'][number];

interface SkillsRadarChartProps {
  skills: SkillsRadarChartItem[];
}

export default function SkillsRadarChart({ skills }: SkillsRadarChartProps) {
  // Transform data for recharts - calculate percentage
  const chartData = skills.map((skill) => {
    const percentage =
      skill.required_skill_level > 0
        ? (skill.users_skill_level / skill.required_skill_level) * 100
        : 0;
    return {
      skill: skill.axis,
      percentage: Math.min(percentage, 100), // Cap at 100%
      reason: skill.reason,
    };
  });

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
          <Radar
            name="Your Level"
            dataKey="percentage"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.3}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
