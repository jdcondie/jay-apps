import React, { useState } from 'react';
import { Lightbulb, Plus, X, Search, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BrandIntelligence: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-3">
            <Lightbulb size={32} className="text-black/20" />
            <span>Brand Intelligence</span>
          </h1>
          <p className="text-black/40 mt-1">Audience & angle profiles for targeted ad generation.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-black/5 text-black/60 px-6 py-3 rounded-xl font-bold text-sm hover:bg-black/10 transition-all">
            <RotateCcw size={16} />
            <span>Generate Profiles</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} />
            <span>New Profile</span>
          </button>
        </div>
      </div>

      {/* Empty State / Placeholder */}
      <div className="bg-white border border-black/5 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-black/20">
          <Lightbulb size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-black">No Profiles Found</h3>
          <p className="text-black/40 max-w-md">Create audience profiles to help the AI generate more targeted and effective ad content from your brand kit.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-black/90 transition-all shadow-lg shadow-black/10"
        >
          <Plus size={16} />
          <span>Create Your First Profile</span>
        </button>
      </div>

      {/* New Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden font-sans"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-black">New Profile</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-black/20 hover:text-black transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Title', placeholder: 'e.g. Fitness Enthusiasts' },
                    { label: 'Persona', placeholder: 'e.g. 25-35 year old urban professionals' },
                    { label: 'Pain Point', placeholder: 'e.g. Lack of time for long workouts' },
                    { label: 'Angle', placeholder: 'e.g. Efficiency and high-intensity' },
                    { label: 'Visual Direction', placeholder: 'e.g. High contrast, dynamic motion' },
                    { label: 'Emotion', placeholder: 'e.g. Empowered, energized' },
                  ].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full bg-black/5 border border-black/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all"
                      />
                    </div>
                  ))}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Copy Hook</label>
                    <textarea
                      placeholder="e.g. Transform your body in just 20 minutes a day..."
                      className="w-full bg-black/5 border border-black/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-sm bg-black/5 text-black/60 hover:bg-black/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 py-4 rounded-2xl font-bold text-sm bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-500/20">
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandIntelligence;
