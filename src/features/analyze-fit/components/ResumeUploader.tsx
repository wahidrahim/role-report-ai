'use client';
import { FileText, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Spinner } from '@/core/components/ui/spinner';

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

type ResumeUploaderProps = {
  resumeFileName: string;
  onResumeChange: (text: string, fileName: string) => void;
  onClear: () => void;
};

export default function ResumeUploader({ resumeFileName, onResumeChange, onClear }: ResumeUploaderProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setResumeFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setResumeFile(file);

    if (file && file.type === 'application/pdf') {
      setIsParsing(true);

      try {
        const extractedText = await parsePDF(file);

        onResumeChange(extractedText, file.name);
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
            ref={inputRef}
            id="resume-upload"
            type="file"
            accept="application/pdf"
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-200">
          <FileText className="size-4" />
          <span className="flex-1">File selected: {resumeFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="size-6 opacity-60 hover:opacity-100 hover:text-destructive"
            aria-label="Clear uploaded resume"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {!resumeFile && !isParsing && resumeFileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-200">
          <FileText className="size-4" />
          <span className="flex-1">File already loaded: {resumeFileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="size-6 opacity-60 hover:opacity-100 hover:text-destructive"
            aria-label="Clear uploaded resume"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
