'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { AnalyzeInputs } from '@/features/analyze-fit/AnalyzeInputs';
import { AnalyzeResults } from '@/features/analyze-fit/AnalyzeResults';
import { useAnalysis } from '@/features/analyze-fit/hooks/useAnalysis';
import { DeepResearchReport } from '@/features/deep-research/DeepResearchReport';
import { useDeepResearch } from '@/features/deep-research/useDeepResearch';
import { useResumeStore } from '@/stores/resumeStore';

export default function Home() {
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { resumeText } = useResumeStore();

  const {
    radarChart,
    skillAssessment,
    suitabilityAssessment,
    resumeOptimizations,
    learningPriorities,
    isLoading: isAnalyzing,
    error: analysisError,
    analyze,
  } = useAnalysis();

  const {
    isLoading: isResearching,
    streamEvents,
    researchReport,
    startDeepResearch,
    canResearch,
  } = useDeepResearch(jobDescriptionText);

  const handleAnalyze = () => {
    if (!jobDescriptionText) {
      setValidationError('Please enter a job description.');
      return;
    }
    setValidationError(null);
    // Resume check is handled inside hook or component, but AnalyzeInputs props might need validation.
    // Actually AnalyzeFit.tsx had validation logic.
    analyze(resumeText || '', jobDescriptionText);
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-8 max-w-[1800px] mx-auto">
      {/* LEFT PANEL - INPUTS (Sticky) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-heading tracking-tight bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            Role Report AI
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Discover your perfect fit and prepare with deep, data-driven insights.
            <span className="block mt-2 text-sm text-primary/80">
              Desktop Optimized &bull; Real-time Intelligence
            </span>
          </p>
        </div>

        <AnalyzeInputs
          jobDescriptionText={jobDescriptionText}
          onJobDescriptionChange={setJobDescriptionText}
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
          validationError={validationError}
          error={analysisError}
        />

        {/* Deep Research Trigger */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Advanced Intelligence
          </h3>
          <Button
            variant="outline"
            onClick={startDeepResearch}
            disabled={isResearching || !canResearch}
            className="w-full h-12 border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-base"
          >
            <Sparkles className="mr-2 size-4 text-primary" />
            {isResearching ? 'Researching Entity...' : 'Start Deep Research'}
          </Button>
        </div>
      </motion.div>

      {/* RIGHT PANEL - RESULTS (Scrollable) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-8 space-y-8 pb-20"
      >
        {/* If nothing happened yet */}
        {!suitabilityAssessment && !researchReport && !isAnalyzing && !isResearching && (
          <div className="flex flex-col items-center justify-center h-[60vh] border border-dashed border-white/10 rounded-3xl bg-white/5 text-muted-foreground">
            <Sparkles className="size-12 mb-4 opacity-20" />
            <p>Ready to analyze. Upload a resume and job description to begin.</p>
          </div>
        )}

        <AnalyzeResults
          radarChart={radarChart}
          skillAssessment={skillAssessment}
          suitabilityAssessment={suitabilityAssessment}
          resumeOptimizations={resumeOptimizations}
          learningPriorities={learningPriorities}
          isLoading={isAnalyzing}
        />

        <DeepResearchReport
          isLoading={isResearching}
          streamEvents={streamEvents}
          researchReport={researchReport}
        />
      </motion.div>
    </main>
  );
}
