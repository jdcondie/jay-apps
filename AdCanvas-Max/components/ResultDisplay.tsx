import React, { useState } from 'react';
import { ErrorIcon } from './icons/ErrorIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { GeneratedResult } from '../types';
import { X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResultDisplayProps {
  isLoading: boolean;
  generatedImages: GeneratedResult[];
  error: string | null;
  onStartOver: () => void;
}

const LoadingSpinner: React.FC = () => (
  <div role="status" className="flex flex-col items-center justify-center gap-2 text-center">
    <div className="w-8 h-8 border-2 border-[#d4d4d4] border-t-[#E8541A] rounded-full animate-spin"></div>
    <p className="text-[#717171] text-xs font-medium">Generating...</p>
  </div>
);

const ResultCard: React.FC<{ result: GeneratedResult; onPreview: (url: string) => void }> = ({ result, onPreview }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!result.imageUrl) return;
    const templateName = result.template.name.toLowerCase().replace(/\s+/g, '-') || 'custom';
    const fileName = `${templateName}-ad.png`;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-[#d4d4d4] flex flex-col overflow-hidden group transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#E8541A]">
      <div className="relative aspect-[4/5] flex items-center justify-center bg-[var(--brand-gray-50)] overflow-hidden">
        {!result.imageUrl && !result.error && <LoadingSpinner />}
        {result.imageUrl && (
          <img
            src={result.imageUrl}
            alt={`Generated ad in template ${result.template.name}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
            onClick={() => onPreview(result.imageUrl!)}
          />
        )}
        {result.error && (
          <div className="text-center text-red-500 p-6 flex flex-col items-center gap-3">
            <ErrorIcon className="w-10 h-10" />
            <p className="text-sm font-bold text-[#111111]">Generation Failed</p>
            <p className="text-xs text-[#717171] leading-relaxed">{result.error}</p>
          </div>
        )}
        {result.imageUrl && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => result.imageUrl && onPreview(result.imageUrl)}
              className="bg-white/90 backdrop-blur-md text-[#111111] p-3 rounded-full hover:bg-white transition-colors border border-[#d4d4d4]"
              title="Preview Image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#E8541A] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[var(--brand-orange-mid)] transition-colors shadow-lg"
            >
              <DownloadIcon className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#d4d4d4] flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#111111] uppercase tracking-widest mb-0.5">
            {result.template.name}
          </p>
          <p className="text-[10px] text-[#717171] font-medium">AI Generated Ad</p>
        </div>
      </div>
    </div>
  );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, generatedImages, error, onStartOver }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownloadAll = () => {
    generatedImages.forEach((result, index) => {
      if (result.imageUrl) {
        setTimeout(() => {
          const templateName = result.template.name.toLowerCase().replace(/\s+/g, '-') || 'custom';
          const fileName = `${templateName}-ad.png`;
          const link = document.createElement('a');
          link.href = result.imageUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 300);
      }
    });
  };

  const successfulGenerations = generatedImages.filter(r => r.imageUrl).length;

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center max-w-md flex flex-col items-center gap-6 p-10 bg-white rounded-2xl border border-[#d4d4d4] shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <ErrorIcon className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2 text-[#111111]">Generation Error</h3>
            <p className="text-sm text-[#717171] leading-relaxed">{error}</p>
          </div>
          <button
            onClick={onStartOver}
            className="bg-[#111111] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-[#111111]/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (generatedImages.length > 0) {
      return (
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#E8541A] mb-1">Results</p>
              <h2 className="text-xl font-black text-[#111111]" style={{ letterSpacing: '-0.025em' }}>Generated Ads</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onStartOver}
                className="bg-white border border-[#d4d4d4] text-[#717171] font-semibold py-2 px-3 rounded-lg flex items-center gap-2 transition-colors hover:border-[#111111] hover:text-[#111111] text-sm"
              >
                <RefreshIcon className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={successfulGenerations === 0 || isLoading}
                className="bg-[#E8541A] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all hover:bg-[var(--brand-orange-mid)] text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <DownloadIcon className="w-4 h-4" />
                Download All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {generatedImages.map((result, idx) => (
              <ResultCard
                key={`${result.template.id}-${idx}`}
                result={result}
                onPreview={setPreviewUrl}
              />
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full" aria-live="polite" aria-atomic="true">
      {renderContent()}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
              onClick={() => setPreviewUrl(null)}
            >
              <X size={20} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewUrl}
                alt="Enlarged preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultDisplay;
