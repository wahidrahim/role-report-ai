'use client';
import { FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ChangeEvent, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useResumeStore } from '@/stores/resumeStore';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

async function parsePDF(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let parsedText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    textContent.items.forEach((item) => {
      const textItem = item as TextItem;

      parsedText += textItem.str + (textItem.hasEOL ? '\n' : '');
    });
  }

  return parsedText;
}

export default function ResumeUploader() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { resumeFileName, setResumeText, setResumeFileName } = useResumeStore();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setResumeFile(file);

    if (file && file.type === 'application/pdf') {
      setIsParsing(true);

      try {
        const extractedText = await parsePDF(file);

        setResumeText(extractedText);
        setResumeFileName(file.name);
      } catch (error) {
        console.error('Failed to parse PDF:', error);
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resume-upload">Upload Resume</Label>
        <div className="flex items-center gap-2">
          <Input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={isParsing}
            className="cursor-pointer"
          />
          {isParsing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner />
              <span className="text-sm">Parsing PDF...</span>
            </div>
          )}
        </div>
      </div>

      {resumeFile && !isParsing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4" />
          <span>File selected: {resumeFile.name}</span>
        </div>
      )}

      {!resumeFile && !isParsing && resumeFileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4" />
          <span>File already loaded: {resumeFileName}</span>
        </div>
      )}
    </div>
  );
}
