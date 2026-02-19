'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { DeepResearchReportData } from '../pdf/DeepResearchDocument';

type UseDeepResearchPDFExportProps = {
  researchReport: DeepResearchReportData | null;
};

export function useDeepResearchPDFExport({ researchReport }: UseDeepResearchPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!researchReport) return;

    setIsGenerating(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { DeepResearchDocument } = await import('../pdf/DeepResearchDocument');

      const doc = <DeepResearchDocument data={researchReport} />;
      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `deep-research-${Date.now()}.pdf`;
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
  }, [researchReport]);

  return {
    generatePDF,
    isGenerating,
  };
}
