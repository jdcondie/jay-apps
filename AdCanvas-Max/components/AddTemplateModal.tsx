import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Plus, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdTemplate } from '../types';
import { saveCustomTemplate } from '../src/lib/utils';
import { analyzeAdStyle } from '../services/geminiService';

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (template: AdTemplate) => void;
}

type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error';

const AddTemplateModal: React.FC<AddTemplateModalProps> = ({ isOpen, onClose, onAdded }) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysis, setAnalysis] = useState({ name: '', category: 'Studio', keywords: '', prompt: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      setAnalysisState('analyzing');

      try {
        const result = await analyzeAdStyle(dataUrl);
        setAnalysis(result);
        setAnalysisState('done');
      } catch {
        // No API key or failure — use sensible fallback so save still works
        setAnalysis({
          name: `Custom ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          category: 'Studio',
          keywords: 'custom',
          prompt: '',
        });
        setAnalysisState('done');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSave = () => {
    if (!imageDataUrl || analysisState !== 'done') return;
    const template: AdTemplate = {
      id: `custom-${Date.now()}`,
      name: analysis.name || `Custom ${Date.now()}`,
      description: analysis.keywords,
      keywords: analysis.keywords,
      previewUrl: imageDataUrl,
      referenceImageUrl: imageDataUrl,
      promptTemplate: analysis.prompt || undefined,
      category: analysis.category || 'Studio',
      isCustom: true,
    };
    saveCustomTemplate(template);
    onAdded(template);
    handleClose();
  };

  const handleClose = () => {
    setImageDataUrl(null);
    setAnalysisState('idle');
    setAnalysis({ name: '', category: 'Studio', keywords: '', prompt: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#E8541A] mb-0.5">Templates</p>
                  <h2 className="text-lg font-black text-[#111111]" style={{ letterSpacing: '-0.02em' }}>Add New Template</h2>
                </div>
                <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#d4d4d4] text-[#717171] hover:text-[#111111] hover:border-[#111111] transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Image Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !imageDataUrl && inputRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed transition-all mb-5 overflow-hidden ${
                  isDragging
                    ? 'border-[#E8541A] bg-[#FFF3EE]'
                    : imageDataUrl
                    ? 'border-[#d4d4d4]'
                    : 'border-[#d4d4d4] hover:border-[#E8541A] cursor-pointer'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {imageDataUrl ? (
                  <div className="relative aspect-[4/3]">
                    <img src={imageDataUrl} alt="Reference" className="w-full h-full object-cover" />

                    {/* Analysis overlay */}
                    <AnimatePresence>
                      {analysisState === 'analyzing' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles size={22} className="text-white" />
                          </motion.div>
                          <p className="text-xs font-bold text-white tracking-wide">Analyzing style...</p>
                        </motion.div>
                      )}

                      {analysisState === 'done' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/40 flex flex-col items-end justify-start p-2.5"
                        >
                          <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <CheckCircle size={10} />
                            Ready
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Remove button */}
                    {analysisState !== 'analyzing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageDataUrl(null);
                          setAnalysisState('idle');
                          setAnalysis({ name: '', category: 'Studio', keywords: '', prompt: '' });
                        }}
                        className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-11 h-11 bg-[#E8541A]/10 rounded-xl flex items-center justify-center">
                      <Upload size={20} className="text-[#E8541A]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#111111]">Drop your reference ad here</p>
                      <p className="text-xs text-[#717171] mt-0.5">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 border border-[#d4d4d4] rounded-xl text-sm font-bold text-[#717171] hover:border-[#111111] hover:text-[#111111] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!imageDataUrl || analysisState !== 'done'}
                  className="flex-1 py-3 bg-[#E8541A] text-white rounded-xl text-sm font-bold hover:bg-[#F97440] transition-all disabled:bg-[#d4d4d4] disabled:text-[#717171] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analysisState === 'analyzing' ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                        <Sparkles size={14} />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      Save Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTemplateModal;
