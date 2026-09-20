import React, { useState } from "react";
import { TitleBar } from "./components/TitleBar";
import { VonClock } from "./VonClock";
import { VonClockSidebar } from "./VonClockSidebar";
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
            <VonClock
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            />
          </main>
        </div>
      </div>
    </ScheduleProvider>
  );
};

export default App;
