import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Task, TaskStatus, DailyRoutines, DayOfWeek } from "../types";
import { routineStorage as routineApi } from "../services/storage";
import {
  DEFAULT_TASKS,
  INITIAL_ROUTINES,
  DAYS,
  createDefaultTasks,
} from "../constants/defaults";

export { DEFAULT_TASKS, INITIAL_ROUTINES, DAYS };

export const getTodayDayOfWeek = (): DayOfWeek => {
  const dayNames: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[new Date().getDay()];
};

const useScheduleState = () => {
  // --- State ---
  const [routines, setRoutines] = useState<DailyRoutines>(INITIAL_ROUTINES);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>(getTodayDayOfWeek);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Effects ---

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Routines on Mount
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        const data = await routineApi.fetchRoutines();

        if (data) {
          const merged: DailyRoutines = {
            ...INITIAL_ROUTINES,
            ...data,
          };
          const hasData = Object.values(merged).some((tasks) => tasks && tasks.length > 0);

          if (hasData) {
            setRoutines(merged);
          } else {
            console.log("No remote data found, using onboarding defaults.");
          }
        }
      } catch (error) {
        console.error("Failed to load routines:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoutines();
  }, []);

  // window event listener for synchronization
  useEffect(() => {
    const handleScheduleUpdate = async () => {
      try {
        const data = await routineApi.fetchRoutines();
        if (data) {
          setRoutines((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (error) {
        console.error("Failed to sync routines:", error);
      }
    };

    window.addEventListener("schedule-update", handleScheduleUpdate);
    return () => {
      window.removeEventListener("schedule-update", handleScheduleUpdate);
    };
  }, []);

  const routinesRef = React.useRef<DailyRoutines>(routines);
  useEffect(() => {
    routinesRef.current = routines;
  }, [routines]);

  // --- Computed ---

  const currentDayTasks = useMemo(
    () => routines[currentDay] || [],
    [routines, currentDay]
  );

  // --- Actions ---

  const saveDayRoutine = useCallback(
    async (newTasks: Task[], targetDay?: DayOfWeek) => {
      const dayToSave = targetDay || currentDay;
      const tasksToSave: Task[] = JSON.parse(JSON.stringify(newTasks));

      try {
        const nextRoutines: DailyRoutines = {
          ...routinesRef.current,
          [dayToSave]: tasksToSave,
        };
        routinesRef.current = nextRoutines;
        setRoutines(nextRoutines);

        await routineApi.saveRoutines(nextRoutines);
        window.dispatchEvent(new Event("schedule-update"));
      } catch (error) {
        console.error("Failed to save routine:", error);
      }
    },
    [currentDay]
  );

  const copyRoutineToDays = useCallback(
    async (
      sourceTasks: Task[],
      targetDays: DayOfWeek[],
      sourceDay?: DayOfWeek
    ) => {
      const fromDay = sourceDay || currentDay;
      const tasksToSave: Task[] = JSON.parse(JSON.stringify(sourceTasks));

      try {
        const nextRoutines: DailyRoutines = {
          ...routinesRef.current,
          [fromDay]: JSON.parse(JSON.stringify(tasksToSave)),
        };
        targetDays.forEach((day) => {
          nextRoutines[day] = tasksToSave.map((t: Task) => ({
            ...t,
            id: Math.random().toString(36).substr(2, 9),
          }));
        });
        routinesRef.current = nextRoutines;
        setRoutines(nextRoutines);

        await routineApi.saveRoutines(nextRoutines);
        window.dispatchEvent(new Event("schedule-update"));
      } catch (error) {
        console.error("Failed to copy routine:", error);
      }
    },
    [currentDay]
  );

  return {
    routines,
    currentDay,
    setCurrentDay,
    currentTime,
    isLoading,
    saveDayRoutine,
    copyRoutineToDays,
    currentDayTasks,
    DEFAULT_TASKS,
    INITIAL_ROUTINES,
    DAYS,
  };
};

export type ScheduleContextType = ReturnType<typeof useScheduleState>;

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const schedule = useScheduleState();
  return (
    <ScheduleContext.Provider value={schedule}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (context) return context;
  return useScheduleState();
};

