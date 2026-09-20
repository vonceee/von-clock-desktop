import assert from "node:assert";

console.log("Starting copyRoutine test suite...");

const DEFAULT_TASKS = [
  {
    id: "1",
    title: "Welcome to VON.CLOCK",
    notes: "This is your daily execution queue. Click 'Edit Routine' to begin.",
    startTime: "09:00",
    durationMinutes: 1440,
    status: "PENDING",
    dependencies: [],
    requirements: [],
  },
  {
    id: "2",
    title: "Customize Your Schedule",
    notes: "Tasks here update in real-time based on your system clock.",
    startTime: "11:58",
    durationMinutes: 60,
    status: "PENDING",
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
    status: "PENDING",
    dependencies: [],
    requirements: [],
  },
];

const createDefaultTasks = () => JSON.parse(JSON.stringify(DEFAULT_TASKS));

const createInitialRoutines = () => ({
  Monday: createDefaultTasks(),
  Tuesday: createDefaultTasks(),
  Wednesday: createDefaultTasks(),
  Thursday: createDefaultTasks(),
  Friday: createDefaultTasks(),
  Saturday: createDefaultTasks(),
  Sunday: createDefaultTasks(),
});

const INITIAL_ROUTINES = createInitialRoutines();

// Test 1: Verify Initial Routines structure
assert.strictEqual(Object.keys(INITIAL_ROUTINES).length, 7, "Must have 7 days");
assert.ok(INITIAL_ROUTINES.Monday.length > 0, "Monday must have default tasks");
console.log("✔ Test 1 passed: INITIAL_ROUTINES structure verified.");

// Test 2: Simulate copyRoutine logic across multiple target days
let routines = JSON.parse(JSON.stringify(INITIAL_ROUTINES));

const sourceDay = "Monday";
const targetDays = ["Tuesday", "Wednesday", "Friday"];

// Custom tasks on Monday
const customMondayTasks = [
  {
    id: "custom-1",
    title: "Deep Work Block",
    notes: "No distractions",
    startTime: "08:00",
    durationMinutes: 120,
    status: "PENDING",
    dependencies: [],
    requirements: [],
  },
  {
    id: "custom-2",
    title: "Team Sync",
    notes: "Review deliverables",
    startTime: "10:30",
    durationMinutes: 45,
    status: "PENDING",
    dependencies: [],
    requirements: [],
  },
];

// Execute copy routine atomic logic as in useSchedule.tsx
let nextRoutines = {
  ...routines,
  [sourceDay]: JSON.parse(JSON.stringify(customMondayTasks)),
};
targetDays.forEach((day) => {
  nextRoutines[day] = customMondayTasks.map((t) => ({
    ...t,
    id: Math.random().toString(36).substr(2, 9),
  }));
});
routines = nextRoutines;

// Verifications
assert.strictEqual(routines.Monday.length, 2, "Monday should have 2 tasks");
assert.strictEqual(routines.Monday[0].title, "Deep Work Block");

targetDays.forEach((targetDay) => {
  assert.strictEqual(
    routines[targetDay].length,
    2,
    `${targetDay} should have 2 tasks copied from Monday`
  );
  assert.strictEqual(
    routines[targetDay][0].title,
    "Deep Work Block",
    `${targetDay} task title should match`
  );
  assert.strictEqual(
    routines[targetDay][1].title,
    "Team Sync",
    `${targetDay} task title should match`
  );
  // Ensure IDs are unique and not shared
  assert.notStrictEqual(
    routines[targetDay][0].id,
    routines.Monday[0].id,
    `${targetDay} should have distinct task ID`
  );
});

// Verify non-target days are untouched
assert.strictEqual(
  routines.Thursday.length,
  INITIAL_ROUTINES.Thursday.length,
  "Thursday was not a target day and should retain its tasks"
);
assert.strictEqual(
  routines.Saturday.length,
  INITIAL_ROUTINES.Saturday.length,
  "Saturday was not a target day and should retain its tasks"
);
assert.strictEqual(
  routines.Sunday.length,
  INITIAL_ROUTINES.Sunday.length,
  "Sunday was not a target day and should retain its tasks"
);

console.log("✔ Test 2 passed: Copy routine correctly copied tasks to all selected days and preserved other days.");

// Test 3: Storage fallback logic doesn't wipe unsaved days
const storageMock = { data: null };

function mockFetchRoutines() {
  return storageMock.data ? JSON.parse(JSON.stringify(storageMock.data)) : null;
}

function mockSaveRoutines(data) {
  storageMock.data = JSON.parse(JSON.stringify(data));
}

function mockSaveDayRoutine(day, tasks) {
  const existing = mockFetchRoutines() || createInitialRoutines();
  const base = {
    ...existing,
    [day]: tasks,
  };
  mockSaveRoutines(base);
}

// Saving one day when storage is empty
mockSaveDayRoutine("Tuesday", customMondayTasks);
const savedRoutines = mockFetchRoutines();
assert.ok(savedRoutines !== null);
assert.strictEqual(savedRoutines.Tuesday.length, 2);
assert.strictEqual(savedRoutines.Monday.length, INITIAL_ROUTINES.Monday.length, "Monday must not be wiped to []");
assert.strictEqual(savedRoutines.Wednesday.length, INITIAL_ROUTINES.Wednesday.length, "Wednesday must not be wiped to []");

console.log("✔ Test 3 passed: Storage fallback preserves all days without wiping to empty arrays.");

// Test 4: Verify saveDayRoutine saves user edits and sync maintains them
let liveRoutines = createInitialRoutines();
let liveRoutinesRef = { current: liveRoutines };

function simulateSaveDayRoutine(day, newTasks) {
  const tasksToSave = JSON.parse(JSON.stringify(newTasks));
  const next = {
    ...liveRoutinesRef.current,
    [day]: tasksToSave,
  };
  liveRoutinesRef.current = next;
  liveRoutines = next;
  mockSaveRoutines(next);
}

// Simulate user editing Monday with custom tasks
const updatedMondayTasks = [
  {
    id: "edit-1",
    title: "Updated Task 1",
    notes: "Saved note",
    startTime: "07:00",
    durationMinutes: 45,
    status: "PENDING",
    dependencies: [],
    requirements: [],
  },
];

simulateSaveDayRoutine("Monday", updatedMondayTasks);
assert.strictEqual(liveRoutines.Monday.length, 1);
assert.strictEqual(liveRoutines.Monday[0].title, "Updated Task 1");

// Simulate schedule-update event triggering fetchRoutines
const syncedData = mockFetchRoutines();
assert.ok(syncedData !== null);
assert.strictEqual(syncedData.Monday.length, 1, "Monday should have 1 updated task in storage");
assert.strictEqual(syncedData.Monday[0].title, "Updated Task 1", "Stored title should be 'Updated Task 1'");

console.log("✔ Test 4 passed: saveDayRoutine correctly saves edits and sync preserves them.");

console.log("\nALL TESTS PASSED SUCCESSFULLY! 🎉");
