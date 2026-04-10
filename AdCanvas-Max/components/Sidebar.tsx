import React from 'react';
import {
  LayoutGrid,
  LayoutTemplate,
  Sparkles,
  History,
  ChevronDown,
  Moon,
  HelpCircle,
  Zap,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../src/lib/utils';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  width: number;
  onDragStart: (e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onPageChange,
  isOpen,
  onToggle,
  width,
  onDragStart,
}) => {
  const menuItems = [
    { icon: Sparkles, label: 'Generator' },
    { icon: LayoutGrid, label: 'Dashboard' },
    { icon: LayoutTemplate, label: 'Templates' },
    { icon: History, label: 'History' },
  ];

  const collapsed = !isOpen;

  return (
    <aside
      style={{ width: collapsed ? 64 : width }}
      className="h-screen bg-[#111111] text-[#e0e0e0] flex flex-col border-r border-white/5 font-sans shrink-0 relative transition-[width] duration-200"
    >
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-white/5 shrink-0",
        collapsed ? "p-4 justify-center" : "p-5 justify-between"
      )}>
        {collapsed ? (
          <div className="text-[#E8541A]">
            <Star size={22} fill="currentColor" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="text-[#E8541A]">
                <Star size={22} fill="currentColor" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
                StaticAds<span className="text-[#E8541A]">.</span>
              </h1>
            </div>
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        )}
      </div>

      {/* Collapsed toggle button */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-3 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* Workspace selector — hide when collapsed */}
      {!collapsed && (
        <div className="px-4 mt-5 mb-4">
          <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 rounded-xl text-sm font-medium text-white/80 border border-white/5 hover:bg-white/10 transition-all">
            <span className="truncate">My Workspace</span>
            <ChevronDown size={16} className="text-white/40 shrink-0 ml-1" />
          </button>
        </div>
      )}

      {/* Nav */}
      <div className={cn(
        "flex-grow overflow-y-auto custom-scrollbar py-2",
        collapsed ? "px-2" : "px-3"
      )}>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onPageChange(item.label)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center transition-all group text-sm font-semibold rounded-xl",
                collapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                activePage === item.label
                  ? "bg-[#E8541A] text-white shadow-lg shadow-orange-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon
                size={18}
                className={cn(
                  "transition-colors shrink-0",
                  activePage === item.label ? "text-white" : "group-hover:text-white"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "border-t border-white/5 bg-black/20",
        collapsed ? "p-2 space-y-2" : "p-4 space-y-4"
      )}>
        {collapsed ? (
          <>
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-[#E8541A]/20 rounded-full flex items-center justify-center text-[9px] font-bold text-[#E8541A]">JA</div>
            </div>
            <button
              className="w-full flex items-center justify-center py-2.5 bg-[#E8541A] hover:bg-[#F97440] text-white rounded-xl transition-all"
              title="Upgrade Pro"
            >
              <Zap size={14} className="fill-white" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#E8541A]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#E8541A] border border-[#E8541A]/20 shrink-0">JA</div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white">Credits</span>
                  <span className="text-[10px] text-[#E8541A] font-bold">12 Left</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/20">
                <Moon size={16} />
                <div className="w-8 h-4 bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white/40 rounded-full" />
                </div>
              </div>
            </div>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium">
              <HelpCircle size={18} />
              <span>Help & Support</span>
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#E8541A] hover:bg-[#F97440] text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-orange-500/20">
              <Zap size={16} className="fill-white" />
              <span>Upgrade Pro</span>
            </button>
          </>
        )}
      </div>

      {/* Drag handle — only when open */}
      {!collapsed && (
        <div
          onMouseDown={onDragStart}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#E8541A]/60 transition-colors group"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
