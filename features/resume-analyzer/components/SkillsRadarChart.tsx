'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { SkillChartItem } from '@/features/resume-analyzer/types';

export type SkillsRadarChartProps = {
  skills: SkillChartItem[];
};

const chartConfig = {
  percentage: {
    label: 'Your score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function SkillsRadarChart({ skills }: SkillsRadarChartProps) {
  const chartData = skills.map((skill) => ({
    skill: skill.axis,
    percentage: Math.min(skill.value, 100), // Cap at 100%
    reasoning: skill.reasoning,
  }));

  return (
    <ChartContainer config={chartConfig}>
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => label}
              formatter={(value, name, item) => {
                const data = item.payload as unknown as {
                  skill: string;
                  percentage: number;
                  reasoning: string;
                };
                return (
                  <div>
                    <div>Your level: {value}%</div>
                    <div>{data.reasoning}</div>
                  </div>
                );
              }}
            />
          }
        />
        <PolarAngleAxis dataKey="skill" />
        <PolarGrid />
        <Radar dataKey="percentage" fill="var(--color-percentage)" fillOpacity={0.6} />
      </RadarChart>
    </ChartContainer>
  );
}
