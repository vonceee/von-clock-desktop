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

export const routineStorage = {
  async fetchRoutines(): Promise<DailyRoutines | null> {
    if (window.electronAPI) {
      return await window.electronAPI.getStorage("routines");
    }
    const local = localStorage.getItem("nca_routines");
    return local ? JSON.parse(local) : null;
  },

  async saveRoutines(routines: DailyRoutines): Promise<void> {
    if (window.electronAPI) {
      await window.electronAPI.setStorage("routines", routines);
    } else {
      localStorage.setItem("nca_routines", JSON.stringify(routines));
    }
  },

  async saveDayRoutine(day: DayOfWeek, tasks: Task[]): Promise<void> {
    const existing = (await this.fetchRoutines()) || {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    existing[day] = tasks;
    await this.saveRoutines(existing);
  },

  async fetchLogs(): Promise<any[]> {
    if (window.electronAPI) {
      return (await window.electronAPI.getStorage("logs")) || [];
    }
    const local = localStorage.getItem("nca_logs");
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
      localStorage.setItem("nca_logs", JSON.stringify(trimmed));
    }
  },
};
