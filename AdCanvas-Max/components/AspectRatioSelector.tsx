import React from 'react';
import { AspectRatio } from '../types';
import { cn } from '../src/lib/utils';

interface AspectRatioSelectorProps {
  ratios: AspectRatio[];
  selectedRatio: AspectRatio;
  onSelectRatio: (ratio: AspectRatio) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ ratios, selectedRatio, onSelectRatio }) => {
  return (
    <div role="group" aria-label="Aspect Ratios" className="flex gap-2 w-full">
      {ratios.map((ratio) => (
        <button
          key={ratio.id}
          onClick={() => onSelectRatio(ratio)}
          aria-pressed={selectedRatio?.id === ratio.id}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-center transition-all duration-150 border focus:outline-none",
            selectedRatio?.id === ratio.id
              ? "bg-[var(--brand-orange-light)] border-[#E8541A] ring-1 ring-[#E8541A] text-[#E8541A]"
              : "bg-white border-[#d4d4d4] hover:border-[#E8541A]/40 hover:bg-[var(--brand-orange-light)]/50 text-[#717171]"
          )}
        >
          <ratio.icon className={cn("w-5 h-5 mb-1", selectedRatio?.id === ratio.id ? "text-[#E8541A]" : "text-[#717171]")} />
          <h3 className={cn("font-bold text-[10px] uppercase tracking-tighter", selectedRatio?.id === ratio.id ? "text-[#E8541A]" : "text-[#717171]")}>{ratio.name}</h3>
        </button>
      ))}
    </div>
  );
};

export default AspectRatioSelector;
