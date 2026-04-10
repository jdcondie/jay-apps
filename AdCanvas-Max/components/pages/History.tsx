import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Sparkles, ChevronDown, RotateCcw, Trash2, Download, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHistory, clearHistory } from '../../src/lib/utils';
import { HistoryItem } from '../../types';

interface HistoryProps {
  onNavigate?: (page: string) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const refreshHistory = () => {
    const data = getHistory();
    console.log('Loading history data:', data.length, 'items found');
    setHistory(data);
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your generation history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">History</h1>
          <p className="text-black/40 mt-1">All your generations in one place.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={refreshHistory}
            className="flex items-center gap-2 text-black/40 hover:text-black font-bold text-sm transition-colors"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-colors"
            >
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>
          )}
          <button 
            onClick={() => onNavigate?.('Generator')}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black/90 transition-all shadow-lg shadow-black/10"
          >
            <Sparkles size={16} />
            <span>New Generation</span>
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-black/5 rounded-[3rem] p-32 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-black/20">
            <RotateCcw size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-black">No generations found.</h3>
            <p className="text-black/40 max-w-md">Start generating ad content to see your history here.</p>
          </div>
          <button 
            onClick={() => onNavigate?.('Generator')}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-black/90 transition-all shadow-lg shadow-black/10"
          >
            <Sparkles size={16} />
            <span>Start Generating</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id}
              className="group bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[4/5] bg-black/5 overflow-hidden">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => setSelectedImage(item.imageUrl)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
                    title="View Enlarged"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => item.imageUrl && downloadImage(item.imageUrl, `ad-${item.id}.png`)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                    {item.aspectRatio}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm truncate pr-2">{item.template.name}</h4>
                  <span className="text-[10px] text-black/30 font-medium">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {(item.headline || item.subheadline) && (
                  <div className="space-y-1">
                    {item.headline && <p className="text-xs font-bold text-black/80 line-clamp-1">{item.headline}</p>}
                    {item.subheadline && <p className="text-[10px] text-black/40 line-clamp-1">{item.subheadline}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Enlarged preview" 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
