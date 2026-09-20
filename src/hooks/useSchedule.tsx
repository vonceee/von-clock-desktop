import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Task, TaskStatus, DailyRoutines, DayOfWeek } from "../types";
import { routineStorage as routineApi } from "../services/storage";

export const DEFAULT_TASKS: Task[] = [
  {
    id: "1",
    title: "Welcome to VON.CLOCK",
    notes: "This is your daily execution queue. Click 'Edit Routine' to begin.",
    startTime: "09:00",
    durationMinutes: 1440,
    status: TaskStatus.PENDING,
    dependencies: [],
    requirements: [],
  },
  {
    id: "2",
    title: "Customize Your Schedule",
    notes: "Tasks here update in real-time based on your system clock.",
    startTime: "11:58",
    durationMinutes: 60,
    status: TaskStatus.PENDING,
    dependencies: [],
    requirements: [],
  },
  {
    id: "3",
    title: "Plan Your Week",
    notes:
      "Use the day selector above to switch views and copy routines between days.",
    startTime: "11:59",
    durationMinutes: 30,
    status: TaskStatus.PENDING,
    dependencies: [],
    requirements: [],
  },
];

const createDefaults = () => JSON.parse(JSON.stringify(DEFAULT_TASKS));

export const INITIAL_ROUTINES: DailyRoutines = {
  Monday: createDefaults(),
  Tuesday: createDefaults(),
  Wednesday: createDefaults(),
  Thursday: createDefaults(),
  Friday: createDefaults(),
  Saturday: createDefaults(),
  Sunday: createDefaults(),
};

export const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

  // --- Computed ---

  const currentDayTasks = useMemo(
    () => routines[currentDay] || [],
    [routines, currentDay]
  );

  // --- Actions ---

  const saveDayRoutine = useCallback(
    async (newTasks: Task[]) => {
      const tasksToSave = JSON.parse(JSON.stringify(newTasks));

      try {
        setRoutines((prev) => ({
          ...prev,
          [currentDay]: tasksToSave,
        }));

        await routineApi.saveDayRoutine(currentDay, tasksToSave);
        window.dispatchEvent(new Event("schedule-update"));
      } catch (error) {
        console.error("Failed to save routine:", error);
      }
    },
    [currentDay]
  );

  const copyRoutineToDays = useCallback(
    async (sourceTasks: Task[], targetDays: DayOfWeek[]) => {
      const tasksToSave = JSON.parse(JSON.stringify(sourceTasks));

      try {
        setRoutines((prev) => {
          const newRoutines = { ...prev };
          targetDays.forEach((day) => {
            newRoutines[day] = JSON.parse(JSON.stringify(tasksToSave));
          });
          return newRoutines;
        });

        await Promise.all(
          targetDays.map((day) => routineApi.saveDayRoutine(day, tasksToSave))
        );

        window.dispatchEvent(new Event("schedule-update"));
      } catch (error) {
        console.error("Failed to copy routine:", error);
      }
    },
    []
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

