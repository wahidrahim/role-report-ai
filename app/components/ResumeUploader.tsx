'use client';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ChangeEvent, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const parsePDF = async (file: File): Promise<string> => {
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
};

export default function ResumeUploader() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);

    if (file && file.type === 'application/pdf') {
      setIsParsing(true);
      try {
        const extractedText = await parsePDF(file);
        console.log('Extracted PDF text:', extractedText);
      } catch (error) {
        console.error('Failed to parse PDF:', error);
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      {isParsing && <p>Parsing PDF...</p>}
      {resumeFile && !isParsing && <p>File selected: {resumeFile.name}</p>}
    </div>
  );
}
