import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dataStore.json is one folder above /data
const DATA_FILE = path.join(__dirname, "../dataStore.json");

function readDataStore() {
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(data);
}

function writeDataStore(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

export function getAllEvents() {
  const data = readDataStore();

  return structuredClone(data.events || []);
}

export function generateEventId() {
  const events = getAllEvents();

  if (events.length === 0) {
    return 1;
  }

  return Math.max(...events.map((event) => event.id)) + 1;
}

export function commitEvent(newEvent, conflictingIds = []) {
  const data = readDataStore();

  const ids = new Set(conflictingIds);

  const displaced = data.events.filter((event) =>
    ids.has(event.id)
  );

  // Remove events that were displaced
  data.events = data.events.filter(
    (event) => !ids.has(event.id)
  );

  // Add new event
  data.events.push(newEvent);

  // Keep calendar sorted
  data.events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.start.localeCompare(b.start) ||
      a.id - b.id
  );

  // Store displaced events for AI rescheduling
  if (!data.displacedEvents) {
    data.displacedEvents = [];
  }

  data.displacedEvents.push(
    ...displaced.map((event) => ({
      ...event,
      status: "needs_rescheduling",
      displaced_by_event_id: newEvent.id
    }))
  );

  writeDataStore(data);

  return structuredClone(displaced);
}

export function getDisplacedEvents() {
  const data = readDataStore();

  return structuredClone(
    data.displacedEvents || []
  );
}