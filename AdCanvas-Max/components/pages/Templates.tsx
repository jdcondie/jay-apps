import React, { useState } from 'react';
import { LayoutTemplate, Upload, Search, ChevronDown, MoreVertical, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Templates: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Studio', 'Lifestyle', 'Room', 'Outdoor', 'Themed', 'Creative'];

  const templates = [
    { id: 1, name: 'IMG 7809 1', category: 'Studio', url: 'https://picsum.photos/seed/template1/800/1000' },
    { id: 2, name: 'IMG 7807 1', category: 'Lifestyle', url: 'https://picsum.photos/seed/template2/800/1000' },
    { id: 3, name: 'IMG 7773 1', category: 'Room', url: 'https://picsum.photos/seed/template3/800/1000' },
    { id: 4, name: 'IMG 7746 1', category: 'Outdoor', url: 'https://picsum.photos/seed/template4/800/1000' },
    { id: 5, name: 'IMG 7745 1', category: 'Themed', url: 'https://picsum.photos/seed/template5/800/1000' },
    { id: 6, name: 'IMG 7744 1', category: 'Creative', url: 'https://picsum.photos/seed/template6/800/1000' },
    { id: 7, name: 'IMG 7736 1', category: 'Studio', url: 'https://picsum.photos/seed/template7/800/1000' },
    { id: 8, name: 'IMG 7734 1', category: 'Lifestyle', url: 'https://picsum.photos/seed/template8/800/1000' },
    { id: 9, name: 'IMG 7103 1', category: 'Room', url: 'https://picsum.photos/seed/template9/800/1000' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Templates</h1>
          <p className="text-black/40 mt-1">Reference ads for your generations.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-500/20">
          <Upload size={16} />
          <span>Upload Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-4 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-[3/4] relative overflow-hidden bg-black/5">
              <img 
                src={template.url} 
                alt={template.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">{template.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
