'use client';

import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { AnalyzeFit } from '@/features/analyze-fit/AnalyzeFit';
import { DeepResearch } from '@/features/deep-research/DeepResearch';

export default function Home() {
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <AnalyzeFit
        jobDescriptionText={jobDescriptionText}
        onJobDescriptionChange={setJobDescriptionText}
      />
      <Card>
        <CardHeader>
          <CardTitle>Deep Research</CardTitle>
          <CardDescription>
            Conduct in-depth research on the company and role to better prepare for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeepResearch jobDescriptionText={jobDescriptionText} />
        </CardContent>
      </Card>
    </div>
  );
}
