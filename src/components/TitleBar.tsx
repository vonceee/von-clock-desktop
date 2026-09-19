import React from "react";
import { Minus, Square, X, EyeClosed } from "lucide-react";

export const TitleBar: React.FC = () => {
  const isDesktop = typeof window !== "undefined" && Boolean(window.electronAPI?.isDesktop);

  return (
    <header className="h-9 bg-[#121214] border-b border-white/5 flex items-center justify-between px-3 select-none drag-region z-50 shrink-0">
      <div className="flex items-center gap-2 no-drag">
        <div className="p-1 rounded bg-rose-500/10 text-rose-400">
          <EyeClosed size={14} />
        </div>
        <span className="text-xs font-mono font-medium tracking-wider text-neutral-300">
          NOT CUTE ANYMORE <span className="text-white/30 text-[10px]">v1.0.0</span>
        </span>
      </div>

      {isDesktop && (
        <div className="flex items-center no-drag">
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Maximize"
          >
            <Square size={11} />
          </button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-red-500/80 transition-colors"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </header>
  );
};
