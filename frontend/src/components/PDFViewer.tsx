import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(prevPageNumber + offset, numPages || 1)));
  }

  function changeScale(delta: number) {
    setScale(prevScale => Math.max(0.5, Math.min(prevScale + delta, 2.0)));
  }

  useEffect(() => {
    // Reset loading state when PDF URL changes
    setIsLoading(true);
  }, [url]);

  // Don't render anything during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-2">
        <Button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min={1}
          max={numPages || 1}
          value={pageNumber}
          onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
          className="w-16 text-center"
        />
        <span>of {numPages || '?'}</span>
        <Button
          onClick={() => changePage(1)}
          disabled={pageNumber >= (numPages || 1)}
          variant="outline"
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={() => changeScale(-0.1)} variant="outline" size="icon">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span>{(scale * 100).toFixed(0)}%</span>
        <Button onClick={() => changeScale(0.1)} variant="outline" size="icon">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-md overflow-auto max-h-[calc(100vh-200px)] w-full">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          options={{
            cMapUrl: '/cmaps/',
            cMapPacked: true,
          }}
          loading={
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-pulse">Loading PDF...</div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-[300px] text-red-500">
              Failed to load PDF. Please try again.
            </div>
          }
        >
          {!isLoading && (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          )}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;