import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-black border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
          <span className="text-black font-black text-xl">A</span>
        </div>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight">
          AdCanvas <span className="text-slate-500 font-medium">Pro</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI DTC Ad Generator</span>
      </div>
    </header>
  );
};

export default Header;