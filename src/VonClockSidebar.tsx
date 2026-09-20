import React from "react";
import { useSchedule } from "./hooks/useSchedule";
import { QuestLog } from "./components/QuestLog";

export const VonClockSidebar: React.FC = () => {
  const { currentDayTasks, currentTime, isLoading } = useSchedule();

  return (
    <div className="h-full w-full flex flex-col bg-black">
      <div className="flex-1 min-h-0">
        <QuestLog
          tasks={currentDayTasks}
          currentTime={currentTime}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
