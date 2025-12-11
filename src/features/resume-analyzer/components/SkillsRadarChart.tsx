'use client';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/core/components/ui/chart';

export type SkillsRadarChartProps = {
  data?:
    | (
        | Partial<{
            skillName: string;
            requiredLevel: number;
            candidateLevel: number;
            reasoning: string;
          }>
        | undefined
      )[]
    | null;
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

export default function SkillsRadarChart(props: SkillsRadarChartProps) {
  const { data } = props;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
        No skills data available
      </div>
    );
  }

  const chartData = data
    .filter((item) => item !== undefined)
    .map((data) => ({
      skill: data.skillName,
      requiredLevel: Math.min(data.requiredLevel || 0, 100), // Cap at 100%, default to 0
      candidateLevel: Math.min(data.candidateLevel || 0, 100), // Cap at 100%, default to 0
      reasoning: data.reasoning,
    }));

  // Sort by level to group similar values, then by name for stability
  const sortedData = [...chartData].sort(
    (a, b) => b.candidateLevel - a.candidateLevel || (a.skill || '').localeCompare(b.skill || ''),
  );

  // Distribute data to create a "bell curve" arrangement
  // This avoids the sharp cliff between the highest and lowest values in a standard sort
  const left: typeof chartData = [];
  const right: typeof chartData = [];

  sortedData.forEach((item, index) => {
    if (index % 2 === 0) {
      right.push(item);
    } else {
      left.unshift(item);
    }
  });

  const finalData = [...right, ...left];

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px] w-full">
      <RadarChart data={finalData}>
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
        <PolarGrid gridType="circle" />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="candidateLevel" fill="var(--color-candidateLevel)" fillOpacity={0.6} />
        <Radar dataKey="requiredLevel" fill="var(--color-requiredLevel)" fillOpacity={0.6} />
        <ChartLegend className="mt-8" content={<ChartLegendContent />} />
      </RadarChart>
    </ChartContainer>
  );
}
