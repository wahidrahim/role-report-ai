'use client';
import { forwardRef } from 'react';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
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
    color: 'var(--color-primary)',
  },
  requiredLevel: {
    label: 'Required Level',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export const SkillsRadarChart = forwardRef<HTMLDivElement, SkillsRadarChartProps>(
  function SkillsRadarChart(props, ref) {
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
    <div ref={ref}>
      <ChartContainer config={chartConfig} className="mx-auto min-h-[400px] w-full">
        <RadarChart data={finalData}>
          <ChartTooltip
            cursor={false}
            content={(props: any) => {
              const { active, payload } = props;
              if (!active || !payload || !payload.length) {
                return null;
              }
              const data = payload[0].payload;

              return (
                <div className="grid max-w-[200px] items-start gap-1.5 rounded-lg border border-border/50 bg-background/90 backdrop-blur-sm px-2.5 py-1.5 text-xs shadow-xl">
                  <div className="font-semibold text-foreground">{data.skill}</div>
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    indicator="line"
                    hideLabel
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
          <PolarGrid
            gridType="circle"
            stroke="var(--color-border)"
            strokeWidth={1}
            className="opacity-100" // Increased visibility
          />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="candidateLevel"
            fill="var(--color-candidateLevel)"
            fillOpacity={0.4}
            stroke="var(--color-candidateLevel)"
            strokeWidth={1}
          />
          <Radar
            dataKey="requiredLevel"
            fill="var(--color-requiredLevel)"
            fillOpacity={0.2}
            stroke="var(--color-requiredLevel)"
            strokeWidth={1}
          />
        </RadarChart>
      </ChartContainer>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <span className="text-xs font-bold" style={{ color: chartConfig.candidateLevel.color }}>
          {chartConfig.candidateLevel.label}
        </span>
        <span className="text-xs font-bold" style={{ color: chartConfig.requiredLevel.color }}>
          {chartConfig.requiredLevel.label}
        </span>
      </div>
    </div>
  );
  }
);
