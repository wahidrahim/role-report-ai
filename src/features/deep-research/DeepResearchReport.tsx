import { motion } from 'framer-motion';

import type { ResearchReport } from '@/ai/deep-research/nodes/createResearchReport';
import { Badge } from '@/core/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

import { StreamEvent } from './useDeepResearch';

type DeepResearchReportProps = {
  isLoading: boolean;
  streamEvents: StreamEvent[];
  researchReport: Partial<ResearchReport> | null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function DeepResearchReport({
  isLoading,
  error,
  streamEvents,
  researchReport,
}: DeepResearchReportProps & { error?: string | null }) {
  if (!isLoading && !researchReport && streamEvents.length === 0 && !error) {
    return null;
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4 text-red-200">
            <span className="font-bold">Error:</span> {error}
          </CardContent>
        </Card>
      )}

      {/* Streaming Events / Terminal Log style */}
      {(isLoading || streamEvents.length > 0) && (
        <Card className="bg-black/40 border-primary/20 font-mono text-sm max-h-48 overflow-y-auto mb-6">
          <CardContent className="p-4 space-y-1">
            {streamEvents.map((event) => (
              <div key={event.id} className="text-muted-foreground">
                <span className="text-primary mr-2">›</span>
                {event.data?.message}
              </div>
            ))}
            {isLoading && <div className="animate-pulse text-primary">_</div>}
          </CardContent>
        </Card>
      )}

      {researchReport && (
        <div>
          <Card className="border-secondary/20 bg-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Deep Research Report
                {isLoading && (
                  <Badge variant="secondary" className="animate-pulse bg-primary/20 text-primary">
                    Streaming...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Company Health */}
              {researchReport.companyHealth && (
                <div className="space-y-3">
                  <h3 className="text-lg font-outfit font-semibold text-primary/90">
                    Company Health
                  </h3>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    {researchReport.companyHealth.status && (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            researchReport.companyHealth.status === 'Stable/Growing'
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : researchReport.companyHealth.status === 'Risky/Layoffs'
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          }
                        >
                          {researchReport.companyHealth.status}
                        </Badge>
                      </div>
                    )}
                    {researchReport.companyHealth.summary && (
                      <p className="text-sm leading-relaxed">
                        {researchReport.companyHealth.summary}
                      </p>
                    )}
                    {researchReport.companyHealth.redFlags &&
                      researchReport.companyHealth.redFlags.length > 0 && (
                        <div className="mt-2 text-sm text-red-500">
                          <span className="font-semibold">Risks: </span>
                          {researchReport.companyHealth.redFlags.join(', ')}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Culture Intelligence */}
              {researchReport.cultureIntel && (
                <div className="space-y-3">
                  <h3 className="text-lg font-outfit font-semibold text-primary/90">
                    Culture Intelligence
                  </h3>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                    {researchReport.cultureIntel.keywords && (
                      <div className="flex flex-wrap gap-2">
                        {researchReport.cultureIntel.keywords.map((k, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-primary/10 border-primary/20 text-primary-foreground"
                          >
                            {k}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {researchReport.cultureIntel.managerVibe && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground mr-2">
                          Manager Vibe:
                        </span>
                        {researchReport.cultureIntel.managerVibe}
                      </div>
                    )}
                    {researchReport.cultureIntel.engineeringCulture && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground mr-2">Eng Culture:</span>
                        {researchReport.cultureIntel.engineeringCulture}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interview Prep */}
              {researchReport.interviewPrepGuide && (
                <div className="space-y-4">
                  <h3 className="text-lg font-outfit font-semibold text-primary/90">
                    Interview Prep Guide
                  </h3>

                  {/* Format */}
                  {researchReport.interviewPrepGuide.interviewFormat && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        Format Expectation
                      </h4>
                      <div className="mb-2 font-medium">
                        {researchReport.interviewPrepGuide.interviewFormat.style}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {researchReport.interviewPrepGuide.interviewFormat.description}
                      </p>
                    </div>
                  )}

                  {/* Skill Gap Crash Courses */}
                  {researchReport.interviewPrepGuide.skillGapCrashCourses &&
                    researchReport.interviewPrepGuide.skillGapCrashCourses.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Skill Gap Crash Courses
                        </h4>
                        <div className="grid gap-3">
                          {researchReport.interviewPrepGuide.skillGapCrashCourses.map(
                            (course, i) => (
                              <Card key={i} className="bg-white/5 border-white/5 pt-4">
                                <CardContent className="p-4 pt-0 space-y-2">
                                  <div className="font-semibold text-primary font-outfit">
                                    {course.topic}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground/80 block mb-1">
                                      Company Context:
                                    </span>
                                    {course.companyContext}
                                  </div>
                                  <div className="text-sm bg-primary/10 border border-primary/20 p-3 rounded-md text-primary-foreground/90">
                                    <span className="font-bold mr-1 text-primary">Study Tip:</span>
                                    {course.studyTip}
                                  </div>
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Strategic Questions */}
                  {researchReport.interviewPrepGuide.strategicQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Strategic Questions to Ask
                      </h4>
                      <ul className="space-y-2">
                        {researchReport.interviewPrepGuide.strategicQuestions.map((q, i) => (
                          <li
                            key={i}
                            className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm"
                          >
                            <span className="text-primary font-bold mr-2">{i + 1}.</span>
                            {q.question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
