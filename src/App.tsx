import React, { useState } from "react";
import { TitleBar } from "./components/TitleBar";
import { VonClock } from "./VonClock";
import { VonClockSidebar } from "./VonClockSidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ScheduleProvider } from "./hooks/useSchedule";

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ScheduleProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-white">
        <TitleBar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Sidebar */}
        <aside
          className={`relative border-r border-white/10 bg-[#121214] transition-all duration-300 ease-in-out flex flex-col ${
            isSidebarOpen ? "w-80" : "w-0 opacity-0 overflow-hidden pointer-events-none"
          }`}
        >
          <div className="flex-1 overflow-hidden relative">
            <VonClockSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Subheader Toolbar */}
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-3 bg-[#121214]/60 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              </button>
              <div className="h-3 w-px bg-white/10 mx-1" />
              <span className="text-[11px] font-mono tracking-widest text-rose-400/90 font-semibold">
                ACTIVE_ROUTINE_ENGINE
              </span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <VonClock />
          </div>
        </main>
      </div>
    </div>
    </ScheduleProvider>
  );
};

export default App;
