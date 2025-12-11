'use client';
import { UseObjectOptions, experimental_useObject as useObject } from '@ai-sdk/react';

import { RadarChartDataSchema } from '@/features/radar-chart/schema';

export function useRadarChart(options?: UseObjectOptions) {
  return useObject({
    api: '/api/generate-radar-chart',
    schema: RadarChartDataSchema,
  });
}
