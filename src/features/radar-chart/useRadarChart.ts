'use client';
import { experimental_useObject as useObject } from '@ai-sdk/react';

import { RadarChartDataSchema } from '@/features/radar-chart/schema';

export function useRadarChart() {
  return useObject({
    api: '/api/generate-radar-chart',
    schema: RadarChartDataSchema,
  });
}
