import React, { useState } from 'react';
import { X, Globe, Search, RotateCcw, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../src/lib/utils';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('https://altirapet.com/');
  const [isFetching, setIsFetching] = useState(false);

  const handleFetch = () => {
    setIsFetching(true);
    // Simulate fetching
    setTimeout(() => {
      setIsFetching(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden font-sans"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-black/40">Products</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-black/20 hover:text-black transition-colors">
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={onClose}
                    className="text-black/20 hover:text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-black/60 mb-8 leading-relaxed">
                Manage your product catalog for AI-generated content.
              </p>

              {/* Import Section */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-black/80">
                  <Globe size={18} className="text-black/40" />
                  <span>Import from Store</span>
                </div>
                
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#d4d4d4] rounded-xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all"
                  placeholder="https://yourstore.com"
                />

                <button
                  onClick={handleFetch}
                  disabled={isFetching}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-black/90 transition-all disabled:bg-black/20 shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                  {isFetching ? (
                    <RotateCcw size={18} className="animate-spin" />
                  ) : null}
                  <span>{isFetching ? 'Fetching...' : 'Fetch Products'}</span>
                </button>

                <p className="text-[11px] text-black/40 text-center font-medium">
                  We'll import products from your Shopify store.
                </p>
              </div>

              {/* Search Section */}
              <div className="pt-8 border-t border-[#d4d4d4] space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-[#fafafa] border border-[#d4d4d4] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-black/30 uppercase tracking-widest">
                  <span>0 products</span>
                  <button className="hover:text-black transition-colors">
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductImportModal;
