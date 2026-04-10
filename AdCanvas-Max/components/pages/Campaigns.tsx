import React from 'react';
import { Crosshair, Plus, Search, Filter } from 'lucide-react';

const Campaigns: React.FC = () => {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Campaigns</h1>
          <p className="text-black/40 mt-1">Manage and track your ad campaigns across platforms.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Active Campaigns', value: '0' },
          { label: 'Total Spend', value: '$0.00' },
          { label: 'Avg. ROAS', value: '0.0x' },
          { label: 'Total Conversions', value: '0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-black/5 p-8 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-white border border-black/5 rounded-[3rem] p-32 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-black/20">
          <Crosshair size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-black">No active campaigns.</h3>
          <p className="text-black/40 max-w-md">Connect your ad accounts to start tracking performance and managing campaigns directly from AdCanvas.</p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-black/90 transition-all shadow-lg shadow-black/10">
          <span>Connect Ad Account</span>
        </button>
      </div>
    </div>
  );
};

export default Campaigns;
