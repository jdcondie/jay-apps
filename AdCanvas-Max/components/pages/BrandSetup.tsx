import React, { useState } from 'react';
import { Plus, X, Palette, Type, MessageSquare, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

const BrandSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Brand Kit');

  const sections = [
    { id: 'general', title: 'General', icon: Palette, fields: [
      { label: 'Brand Name', type: 'text', placeholder: 'Default Brand Kit' },
      { label: 'Description', type: 'textarea', placeholder: 'Enter brand description...' },
    ]},
    { id: 'colors', title: 'Colors', icon: Palette, fields: [] },
    { id: 'typography', title: 'Typography', icon: Type, fields: [
      { label: 'Heading Font', type: 'text', placeholder: 'e.g. Montserrat' },
      { label: 'Body Font', type: 'text', placeholder: 'e.g. Open Sans' },
    ]},
    { id: 'tone', title: 'Tone Rules', icon: MessageSquare, fields: [] },
    { id: 'banned', title: 'Banned Words', icon: ShieldAlert, fields: [] },
    { id: 'claims', title: 'Claim Constraints', icon: BadgeCheck, fields: [] },
  ];

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Brand Setup</h1>
        <p className="text-black/40 mt-1">Configure your brand identity. Changes are saved automatically.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 bg-black/5 p-1.5 rounded-2xl w-fit">
        {['Brand Kit', 'Logos'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-white border border-black/5 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">{section.title}</h2>
              <button className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/10 transition-colors">
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-6">
              {section.fields.map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      className="w-full bg-black/5 border border-black/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all min-h-[120px]"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full bg-black/5 border border-black/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8541A]/10 focus:border-[#E8541A] transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandSetup;
