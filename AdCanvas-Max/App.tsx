import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AdTemplate, UploadedImage, AspectRatio, GeneratedResult } from './types';
import { AD_TEMPLATES, ASPECT_RATIOS } from './constants';
import { generateAdImage } from './services/geminiService';
import { saveToHistory, getCustomTemplates, urlToBase64 } from './src/lib/utils';
import AddTemplateModal from './components/AddTemplateModal';
import Sidebar from './components/Sidebar';
import ImageUploader from './components/ImageUploader';
import AdTemplateSelector from './components/AdTemplateSelector';
import ResultDisplay from './components/ResultDisplay';
import AspectRatioSelector from './components/AspectRatioSelector';
import ProductImportModal from './components/ProductImportModal';
import Dashboard from './components/pages/Dashboard';
import Templates from './components/pages/Templates';
import History from './components/pages/History';
import { Sparkles, Plus, X, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('Generator');
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customTemplates, setCustomTemplates] = useState<AdTemplate[]>(() => getCustomTemplates());
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const allTemplates = [...customTemplates, ...AD_TEMPLATES];
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = rightPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(600, Math.max(320, startWidth.current + delta));
      setRightPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleSidebarDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(380, Math.max(200, startWidth.current + delta));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<AdTemplate[]>([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]);
  const [headline, setHeadline] = useState<string>('');
  const [subheadline, setSubheadline] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // Check if a key is already selected in AI Studio
      let hasKey = false;
      if (window.aistudio) {
        hasKey = await window.aistudio.hasSelectedApiKey();
      }
      
      // Also check if a key is provided via environment variables as a fallback
      // Note: process.env.GEMINI_API_KEY is usually available in the dev environment
      if (!hasKey && process.env.GEMINI_API_KEY) {
        hasKey = true;
      }
      
      setHasApiKey(hasKey);
    };
    checkApiKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const handleImageUpload = (image: UploadedImage) => {
    setProductImage(image);
    setGeneratedImages([]);
    setError(null);
  };
  
  const handleClearImage = () => {
    setProductImage(null);
  }

  const handleTemplateSelect = (template: AdTemplate) => {
    setSelectedTemplates(prev => 
      prev.some(t => t.id === template.id) 
        ? prev.filter(t => t.id !== template.id) 
        : [...prev, template]
    );
    setGeneratedImages([]);
    setError(null);
  };

  const handleAspectRatioSelect = (ratio: AspectRatio) => {
    setSelectedAspectRatio(ratio);
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!productImage || selectedTemplates.length === 0 || !selectedAspectRatio) {
      setError("Please upload an image, select at least one template, and choose an aspect ratio.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const initialResults: GeneratedResult[] = selectedTemplates.map(template => ({
      template: template,
      imageUrl: null,
      error: undefined,
      headline,
      subheadline
    }));
    setGeneratedImages(initialResults);

    try {
      const imageFile = productImage.file;
      const base64ImageData = await fileToBase64(imageFile);
      const mimeType = imageFile.type;

      // Pre-fetch all reference images in parallel
      const referenceMap = new Map<string, { data: string; mimeType: string }>();
      await Promise.all(selectedTemplates.map(async (template) => {
        const refUrl = template.referenceImageUrl;
        if (!refUrl) return;
        try {
          if (refUrl.startsWith('data:')) {
            // Custom template — already base64
            const [meta, data] = refUrl.split(',');
            const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
            referenceMap.set(template.id, { data, mimeType: mime });
          } else {
            // Built-in template — fetch from public
            const result = await urlToBase64(refUrl);
            referenceMap.set(template.id, result);
          }
        } catch (e) {
          console.warn(`Could not load reference image for ${template.name}:`, e);
        }
      }));

      const generationPromises = selectedTemplates.map(template => {
        const ref = referenceMap.get(template.id);
        return generateAdImage(base64ImageData, mimeType, template, selectedAspectRatio, headline, subheadline, ref?.data, ref?.mimeType)
          .then(resultBase64 => ({
            template: template,
            imageUrl: `data:image/png;base64,${resultBase64}`,
            error: undefined,
            headline,
            subheadline
          }))
          .catch(err => ({
            template: template,
            imageUrl: null,
            error: err instanceof Error ? err.message : "An unknown error occurred.",
            headline,
            subheadline
          }));
      });

      const results = await Promise.all(generationPromises);
      setGeneratedImages(results);

      // Save successful generations to history
      const hasSuccessfulGeneration = results.some(result => result.imageUrl);
      
      results.forEach(result => {
        if (result.imageUrl) {
          saveToHistory({
            ...result,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            aspectRatio: selectedAspectRatio.value
          });
        }
      });

      // Automatically navigate to History page if at least one generation was successful
      if (hasSuccessfulGeneration) {
        setTimeout(() => {
          setActivePage('History');
        }, 1500); // Small delay to let the user see the result in the sidebar first
      }

      // Check if any generation failed due to API key issues
      const keyError = results.find(r => r.error?.includes("Requested entity was not found."));
      if (keyError) {
        setHasApiKey(false);
        setError("Your API key session has expired or is invalid. Please reconnect your API key.");
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during setup.";
      setError(errorMessage);
      
      if (errorMessage.includes("Requested entity was not found.")) {
        setHasApiKey(false);
      }
      
      setGeneratedImages([]); 
    } finally {
      setIsLoading(false);
    }
  }, [productImage, selectedTemplates, selectedAspectRatio, headline, subheadline]);

  const handleStartOver = () => {
    setProductImage(null);
    setSelectedTemplates([]);
    setSelectedAspectRatio(ASPECT_RATIOS[0]);
    setHeadline('');
    setSubheadline('');
    setGeneratedImages([]);
    setIsLoading(false);
    setError(null);
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Templates':
        return <Templates />;
      case 'History':
        return <History key={activePage} onNavigate={handlePageChange} />;
      case 'Generator':
        return (
          <div className="flex-grow flex flex-col border-r border-[#d4d4d4] overflow-hidden">
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8 text-[10px] font-bold text-[#717171] uppercase tracking-[0.2em]">
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className="hover:text-[#E8541A] transition-colors"
                >
                  Products
                </button>
                <Plus size={12} />
                <ChevronRight size={12} />
                <span>Brand Assets</span>
                <Plus size={12} />
                <ChevronRight size={12} />
                <span className="text-[#111111]">Pinterest</span>
                <button className="ml-auto bg-[#111111]/5 px-3 py-1 rounded-full text-[10px] hover:bg-[#111111]/10 transition-colors">Connect</button>
              </div>

              <div className="flex-grow overflow-hidden">
                <AdTemplateSelector
                  templates={allTemplates}
                  selectedTemplates={selectedTemplates}
                  onSelectTemplate={handleTemplateSelect}
                  onAddTemplate={() => setIsAddTemplateOpen(true)}
                  onTemplateDeleted={(id) => setCustomTemplates(prev => prev.filter(t => t.id !== id))}
                />
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-black/40">Page under construction: {activePage}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] text-[#111111] font-sans overflow-hidden">
      {/* 1. Sidebar */}
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
        width={sidebarWidth}
        onDragStart={handleSidebarDragStart}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderPage()}
        </div>
      </main>

      {/* 3. Right Section: Editor & Preview (Only show on Generator page) */}
      {activePage === 'Generator' && (
        <>
          {/* Drag handle */}
          <div
            onMouseDown={handleDragStart}
            className="w-1 shrink-0 bg-brand-border hover:bg-[#E8541A] cursor-col-resize transition-colors duration-150 relative group"
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        </>
      )}
      {activePage === 'Generator' && (
        <div style={{ width: rightPanelWidth }} className="flex flex-col bg-white border-l border-[#d4d4d4] overflow-hidden shrink-0">
          <div className="flex-grow p-8 overflow-y-auto custom-scrollbar flex flex-col">
            {/* Image Upload Area */}
            <div className="flex-grow flex flex-col items-center justify-center">
              {!productImage ? (
                <div className="w-full max-w-sm">
                  <ImageUploader onImageUpload={handleImageUpload} />
                  <p className="mt-6 text-center text-[11px] text-[#717171] leading-relaxed font-medium">
                    Upload up to 4 images to blend, remix, or creatively transform
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-sm space-y-8">
                  <div className="relative group aspect-square rounded-3xl overflow-hidden border border-[#d4d4d4] bg-[#fafafa] shadow-sm">
                    <img src={productImage.previewUrl} alt="Product preview" className="w-full h-full object-contain p-6" />
                    <button 
                      onClick={handleClearImage}
                      className="absolute top-4 right-4 w-9 h-9 bg-[#E8541A] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-all hover:scale-110"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {/* Ad Copy Inputs */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#717171]">Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Enter headline..."
                        className="w-full bg-[#fafafa] border border-[#d4d4d4] rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all placeholder:text-[#717171]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#717171]">Subheadline</label>
                      <input
                        type="text"
                        value={subheadline}
                        onChange={(e) => setSubheadline(e.target.value)}
                        placeholder="Enter subheadline..."
                        className="w-full bg-[#fafafa] border border-[#d4d4d4] rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all placeholder:text-[#717171]/50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Area */}
            <AnimatePresence>
              {(generatedImages.length > 0 || isLoading) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-10 pt-10 border-t border-[#d4d4d4]"
                >
                  <ResultDisplay
                    isLoading={isLoading}
                    generatedImages={generatedImages}
                    error={error}
                    onStartOver={handleStartOver}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* Bottom Controls Bar */}
        <div className="p-6 bg-white border-t border-[#d4d4d4] flex flex-col gap-4">
          {!hasApiKey && (
            <div className="p-4 bg-[var(--brand-orange-light)] rounded-xl border border-[#E8541A]/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8541A]/10 rounded-xl flex items-center justify-center text-[#E8541A]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#E8541A] font-bold uppercase tracking-widest">API Key Required</p>
                  <p className="text-xs text-[#111111] font-medium">Connect your Gemini API key to enable generation.</p>
                </div>
              </div>
              <button
                onClick={handleConnectKey}
                className="bg-[#E8541A] text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-[var(--brand-orange-mid)] transition-all shadow-md shadow-[#E8541A]/20 whitespace-nowrap"
              >
                Connect Key
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-[#E8541A]/10 text-[#E8541A] px-3 py-2 rounded-lg shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap">Creativity Pro</span>
            </div>
            <button
              onClick={handleConnectKey}
              title="Change API Key"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#d4d4d4] text-[#717171] hover:text-[#E8541A] hover:border-[#E8541A] transition-all shrink-0"
            >
              <Zap size={15} className={hasApiKey ? "fill-[#E8541A] text-[#E8541A]" : ""} />
            </button>
          </div>

          <AspectRatioSelector
            ratios={ASPECT_RATIOS}
            selectedRatio={selectedAspectRatio}
            onSelectRatio={handleAspectRatioSelect}
          />

          <button
            onClick={handleGenerate}
            disabled={!productImage || selectedTemplates.length === 0 || isLoading || !hasApiKey}
            className="w-full flex items-center justify-center gap-2 bg-[#E8541A] text-white px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-[var(--brand-orange-mid)] transition-all disabled:bg-[#d4d4d4] disabled:text-[#717171] disabled:cursor-not-allowed disabled:shadow-none shadow-lg shadow-[#E8541A]/20 active:scale-95"
          >
            <Sparkles size={16} className={isLoading ? "animate-pulse" : ""} />
            <span>Generate</span>
            <span className="text-white/60 ml-1 text-xs">✦ 12</span>
          </button>
          </div>
        </div>
      )}
      {/* Product Import Modal */}
      <ProductImportModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
      {/* Add Template Modal */}
      <AddTemplateModal
        isOpen={isAddTemplateOpen}
        onClose={() => setIsAddTemplateOpen(false)}
        onAdded={(template) => {
          setCustomTemplates(prev => [template, ...prev]);
          setIsAddTemplateOpen(false);
        }}
      />
    </div>
  );
};

export default App;
