import { Task, DailyRoutines, DayOfWeek } from "../types";

declare global {
  interface Window {
    electronAPI?: {
      getStorage: (key: string) => Promise<any>;
      setStorage: (key: string, data: any) => Promise<{ success: boolean; error?: string }>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      isDesktop?: boolean;
    };
  }
}

const STORAGE_KEY_ROUTINES = "von_clock_routines";
const LEGACY_STORAGE_KEY_ROUTINES = "nca_routines";
const STORAGE_KEY_LOGS = "von_clock_logs";
const LEGACY_STORAGE_KEY_LOGS = "nca_logs";

export const routineStorage = {
  async fetchRoutines(): Promise<DailyRoutines | null> {
    if (window.electronAPI) {
      return await window.electronAPI.getStorage("routines");
    }
    let local = localStorage.getItem(STORAGE_KEY_ROUTINES);
    if (!local) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY_ROUTINES);
      if (legacy) {
        local = legacy;
        localStorage.setItem(STORAGE_KEY_ROUTINES, legacy);
      }
    }
    return local ? JSON.parse(local) : null;
  },

  async saveRoutines(routines: DailyRoutines): Promise<void> {
    if (window.electronAPI) {
      await window.electronAPI.setStorage("routines", routines);
    } else {
      localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
    }
  },

  async saveDayRoutine(day: DayOfWeek, tasks: Task[]): Promise<void> {
    const existing = (await this.fetchRoutines()) || {};
    const base: DailyRoutines = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
      ...existing,
    };
    base[day] = tasks;
    await this.saveRoutines(base);
  },

  async fetchLogs(): Promise<any[]> {
    if (window.electronAPI) {
      return (await window.electronAPI.getStorage("logs")) || [];
    }
    let local = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!local) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY_LOGS);
      if (legacy) {
        local = legacy;
        localStorage.setItem(STORAGE_KEY_LOGS, legacy);
      }
    }
    return local ? JSON.parse(local) : [];
  },

  async logEvent(level: string, message: string): Promise<void> {
    const logs = await this.fetchLogs();
    logs.unshift({
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date().toISOString(),
    });
    const trimmed = logs.slice(0, 100);
    if (window.electronAPI) {
      await window.electronAPI.setStorage("logs", trimmed);
    } else {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(trimmed));
    }
  },
};
