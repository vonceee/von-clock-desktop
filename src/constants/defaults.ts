import { Task, TaskStatus, DailyRoutines, DayOfWeek } from "../types";

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

export const createDefaultTasks = (): Task[] =>
  JSON.parse(JSON.stringify(DEFAULT_TASKS));

export const createInitialRoutines = (): DailyRoutines => ({
  Monday: createDefaultTasks(),
  Tuesday: createDefaultTasks(),
  Wednesday: createDefaultTasks(),
  Thursday: createDefaultTasks(),
  Friday: createDefaultTasks(),
  Saturday: createDefaultTasks(),
  Sunday: createDefaultTasks(),
});

export const INITIAL_ROUTINES: DailyRoutines = createInitialRoutines();

export const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
