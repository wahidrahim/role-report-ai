'use client';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { SkillChartItem } from '@/features/resume-analyzer/types';

export type SkillsRadarChartProps = {
  skills: SkillChartItem[];
};

const chartConfig = {
  candidateLevel: {
    label: 'Candidate Level',
    color: 'var(--chart-1)',
  },
  requiredLevel: {
    label: 'Required Level',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function SkillsRadarChart({ skills }: SkillsRadarChartProps) {
  const chartData = skills.map((skill) => ({
    skill: skill.axis,
    requiredLevel: Math.min(skill.requiredLevel, 100), // Cap at 100%
    candidateLevel: Math.min(skill.userLevel, 100), // Cap at 100%
    reasoning: skill.reasoning,
  }));

  if (skills.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
        No skills data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px] w-full">
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={(props) => {
            const { active, payload } = props;
            if (!active || !payload || !payload.length) {
              return null;
            }
            const data = payload[0].payload;

            return (
              <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  indicator="line"
                  className="p-0 border-0 bg-transparent shadow-none min-w-0"
                />
                {data.reasoning && (
                  <div className="mt-1 pt-1 border-t border-border/50">
                    <p className="text-muted-foreground">{data.reasoning}</p>
                  </div>
                )}
              </div>
            );
          }}
        />
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="candidateLevel" fill="var(--color-candidateLevel)" fillOpacity={0.6} />
        <Radar dataKey="requiredLevel" fill="var(--color-requiredLevel)" fillOpacity={0.6} />
        <ChartLegend className="mt-8" content={<ChartLegendContent />} />
      </RadarChart>
    </ChartContainer>
  );
}
