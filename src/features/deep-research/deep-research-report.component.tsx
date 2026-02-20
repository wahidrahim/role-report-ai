'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  Fingerprint,
  Globe,
  Grip,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import type { ResearchReport } from '@/ai/deep-research/nodes/createResearchReport';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Spinner } from '@/core/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { cn } from '@/core/lib/utils';

import { useDeepResearchPDFExport } from './hooks/use-deep-research-pdf-export.hook';
import type { StreamEvent } from './hooks/use-deep-research.hook';

type DeepResearchReportProps = {
  isLoading: boolean;
  streamEvents: StreamEvent[];
  researchReport: Partial<ResearchReport> | null;
  error?: string | null;
};

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// --- Components ---

function StatusLine(props: { event?: StreamEvent; isLoading: boolean }) {
  const { event, isLoading } = props;

  if (!event && !isLoading) return null;

  const displayMessage = event?.data?.message || 'Initializing research protocols...';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl bg-black/40 border border-primary/20 p-4 font-mono text-sm"
    >
      {/* Scanning effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary animate-pulse">
          <Activity className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-primary/70 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            System Active
          </div>
          <div className="text-primary font-medium tracking-wide">
            <span className="mr-2 text-primary/50">›</span>
            {displayMessage}
            <span className="ml-1 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyHealthWidget(props: { health: NonNullable<ResearchReport['companyHealth']> }) {
  const { health } = props;

  const statusColors = {
    'Stable/Growing': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Risky/Layoffs': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Unknown: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  const statusIcons = {
    'Stable/Growing': CheckCircle2,
    'Risky/Layoffs': AlertTriangle,
    Unknown: Activity,
  };

  const Icon = statusIcons[health.status] || Activity;

  return (
    <Card className="h-full bg-white/5 border-white/10 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-lg font-outfit text-white/90">
          <Shield className="h-5 w-5 text-primary" />
          Company Health
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-[0_0_15px_rgba(0,0,0,0.3)]',
              statusColors[health.status] ?? statusColors.Unknown,
            )}
          >
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
              Current Status
            </div>
            <div
              className={cn(
                'text-xl font-bold font-outfit',
                (statusColors[health.status] ?? statusColors.Unknown).split(' ')[0],
              )}
            >
              {health.status || 'Loading...'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm leading-relaxed text-white/80 bg-black/20 p-3 rounded-lg border border-white/5">
            {health.summary}
          </div>

          {health.redFlags && health.redFlags.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2 uppercase tracking-wide">
                <AlertTriangle className="h-3 w-3" />
                Risk Factors Detected
              </div>
              <ul className="space-y-2">
                {health.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-200/80">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CultureRadarWidget(props: { culture: NonNullable<ResearchReport['cultureIntel']> }) {
  const { culture } = props;

  return (
    <Card className="h-full bg-white/5 border-white/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-outfit text-white/90">
          <Fingerprint className="h-5 w-5 text-primary" />
          Cultural Fingerprint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="flex flex-wrap gap-2">
          {culture.keywords?.map((k, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary text-xs px-3 py-1 transition-colors"
            >
              #{k}
            </Badge>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="group rounded-xl bg-black/20 p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm font-medium">
              <Users className="h-4 w-4 text-sky-400" />
              Manager Vibe
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{culture.managerVibe}</p>
          </div>

          <div className="group rounded-xl bg-black/20 p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm font-medium">
              <Code2 className="h-4 w-4 text-violet-400" />
              Engineering Culture
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{culture.engineeringCulture}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrepHubWidget(props: { guide: NonNullable<ResearchReport['interviewPrepGuide']> }) {
  const { guide } = props;

  return (
    <Card className="col-span-full h-full bg-white/5 border-white/10 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-outfit text-white/90">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Strategic Prep Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format" className="w-full">
          <TabsList className="bg-black/20 p-1 border border-white/5 w-full justify-start gap-2">
            <TabsTrigger
              value="format"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Grip className="h-4 w-4 mr-2" />
              The Process
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Crash Courses
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Strategic Qs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="mt-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
            >
              <h3 className="text-xl font-outfit font-semibold text-white mb-2">
                {guide.interviewFormat?.style}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {guide.interviewFormat?.description}
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-4">
                {guide.skillGapCrashCourses?.map((course, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="group relative overflow-hidden rounded-xl bg-black/20 border border-white/5 hover:border-primary/20 transition-all p-5"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h4 className="flex items-center gap-2 text-base font-semibold text-primary/90 mb-3">
                      <Zap className="h-4 w-4" />
                      {course.topic}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Company Context
                        </div>
                        <p className="text-sm text-white/80">{course.companyContext}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <div className="text-xs uppercase tracking-wider text-primary mb-1 font-semibold">
                          Study Tip
                        </div>
                        <p className="text-sm text-primary/80">{course.studyTip}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <div className="grid gap-3">
              {guide.strategicQuestions?.map((q, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-circle bg-primary/10 text-primary font-bold font-mono text-sm">
                    {i + 1}
                  </div>
                  <div className="pt-1.5 text-sm text-white/90 leading-relaxed font-medium">
                    {q.question}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function DeepResearchReport(props: DeepResearchReportProps) {
  const { isLoading, error, streamEvents, researchReport } = props;

  const { generatePDF, isGenerating } = useDeepResearchPDFExport({
    researchReport: researchReport ?? null,
  });

  if (!isLoading && !researchReport && streamEvents.length === 0 && !error) {
    return null;
  }

  const latestEvent = streamEvents[streamEvents.length - 1];

  return (
    <section className="space-y-8 py-4">
      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4 text-red-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <span className="font-bold block">Analysis Failed</span>
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming Status Line */}
      {(isLoading || (!researchReport && streamEvents.length > 0)) && (
        <StatusLine event={latestEvent} isLoading={isLoading} />
      )}

      {/* Main Dashboard */}
      {researchReport && (
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="col-span-full mb-2">
            <h2 className="text-2xl font-outfit font-bold flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              Intelligence Dossier
            </h2>
            <p className="text-muted-foreground mt-1">
              Generated deep-dive intelligence report based on public data sources.
            </p>
          </motion.div>

          {/* Widgets */}
          {researchReport.companyHealth && (
            <motion.div variants={itemVariants} className="h-full">
              <CompanyHealthWidget health={researchReport.companyHealth} />
            </motion.div>
          )}

          {researchReport.cultureIntel && (
            <motion.div variants={itemVariants} className="h-full">
              <CultureRadarWidget culture={researchReport.cultureIntel} />
            </motion.div>
          )}

          {researchReport.interviewPrepGuide && (
            <motion.div variants={itemVariants} className="col-span-full">
              <PrepHubWidget guide={researchReport.interviewPrepGuide} />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Download Button */}
      {researchReport && !isLoading && (
        <div className="flex">
          <Button
            variant="outline"
            onClick={generatePDF}
            disabled={isGenerating}
            className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            {isGenerating ? <Spinner /> : <Download className="size-4" />}
            {isGenerating ? 'Generating...' : 'Download Report'}
          </Button>
        </div>
      )}
    </section>
  );
}
