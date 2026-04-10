import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Search, ChevronDown, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

const Assets: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Product Image', 'Packaging', 'Lifestyle', 'Logo', 'Other'];

  const assets = [
    { id: 1, name: 'DSC05427.jpg', type: 'Other', url: 'https://picsum.photos/seed/asset1/800/800' },
    { id: 2, name: 'DSC05287.jpg', type: 'Other', url: 'https://picsum.photos/seed/asset2/800/800' },
    { id: 3, name: 'DSC05281.jpg', type: 'Other', url: 'https://picsum.photos/seed/asset3/800/800' },
    { id: 4, name: 'DSC05270.jpg', type: 'Other', url: 'https://picsum.photos/seed/asset4/800/800' },
    { id: 5, name: 'DSC05268.png', type: 'Other', url: 'https://picsum.photos/seed/asset5/800/800' },
    { id: 6, name: 'DSC05268_white.png', type: 'Other', url: 'https://picsum.photos/seed/asset6/800/800' },
    { id: 7, name: 'DSC05266.png', type: 'Other', url: 'https://picsum.photos/seed/asset7/800/800' },
    { id: 8, name: 'DSC05264.png', type: 'Other', url: 'https://picsum.photos/seed/asset8/800/800' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Brand Assets</h1>
          <p className="text-black/40 mt-1">Upload and manage your product images and media.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-500/20">
          <Upload size={16} />
          <span>Upload Assets</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === filter 
                ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' 
                : 'bg-black/5 text-black/40 hover:bg-black/10'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-square relative overflow-hidden bg-black/5">
              <img 
                src={asset.url} 
                alt={asset.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-black truncate pr-2">{asset.name}</p>
                <MoreVertical size={14} className="text-black/20" />
              </div>
              <div className="relative">
                <button className="w-full flex items-center justify-between px-4 py-2 bg-black/5 rounded-xl text-[10px] font-bold text-black/60 hover:bg-black/10 transition-colors">
                  <span>{asset.type}</span>
                  <ChevronDown size={14} className="text-black/20" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;
