'use client';

import { toPng } from 'html-to-image';
import { useCallback, useState, RefObject } from 'react';
import { toast } from 'sonner';

import type { AnalysisReportData } from '@/features/analyze-fit/pdf/analysis-report-document.component';

type UsePDFExportProps = {
  suitabilityAssessment?: AnalysisReportData['suitabilityAssessment'];
  skillAssessment?: AnalysisReportData['skillAssessment'];
  resumeOptimizations?: AnalysisReportData['resumeOptimizations'];
  learningPriorities?: AnalysisReportData['learningPriorities'];
};

export function usePDFExport(props: UsePDFExportProps) {
  const { suitabilityAssessment, skillAssessment, resumeOptimizations, learningPriorities } = props;

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(
    async (chartRef: RefObject<HTMLDivElement | null>) => {
      setIsGenerating(true);

      try {
        // Dynamically import @react-pdf/renderer to reduce initial bundle size
        const { pdf } = await import('@react-pdf/renderer');
        const { AnalysisReportDocument } = await import(
          '@/features/analyze-fit/pdf/analysis-report-document.component'
        );

        // Capture the radar chart as an image if available
        let chartImage: string | undefined;
        if (chartRef.current) {
          try {
            chartImage = await toPng(chartRef.current, {
              backgroundColor: '#FFFFFF',
              pixelRatio: 2,
              quality: 1,
            });
          } catch (chartError) {
            console.warn('Failed to capture chart image:', chartError);
            // Continue without the chart image.
          }
        }

        // Prepare the data for the PDF
        const reportData: AnalysisReportData = {
          suitabilityAssessment,
          skillAssessment,
          resumeOptimizations,
          learningPriorities,
          chartImage,
        };

        // Generate the PDF
        const doc = <AnalysisReportDocument data={reportData} />;
        const blob = await pdf(doc).toBlob();

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `role-report-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Report downloaded successfully');
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        toast.error('Failed to generate PDF. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    },
    [suitabilityAssessment, skillAssessment, resumeOptimizations, learningPriorities],
  );

  return {
    generatePDF,
    isGenerating,
  };
}
