import {
  commitEvent,
  generateEventId,
  getAllEvents
} from "../data/eventStore.js";

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function isValidTime(time) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] =
    date.split("-").map(Number);

  const parsed =
    new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function validateEvent(input) {
  if (!input || typeof input !== "object") {
    throw new Error(
      "Request body must be a JSON object."
    );
  }

  const title =
    typeof input.title === "string"
      ? input.title.trim()
      : "";

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!isValidDate(input.date)) {
    throw new Error(
      "Date must be a valid YYYY-MM-DD date."
    );
  }

  if (!isValidTime(input.start)) {
    throw new Error(
      "Start must use HH:mm format."
    );
  }

  if (!isValidTime(input.end)) {
    throw new Error(
      "End must use HH:mm format."
    );
  }

  const startMinutes =
    timeToMinutes(input.start);

  const endMinutes =
    timeToMinutes(input.end);

  if (startMinutes >= endMinutes) {
    throw new Error(
      "Start time must be earlier than end time."
    );
  }

  if (
    !["fixed", "movable"].includes(input.type)
  ) {
    throw new Error(
      'Type must be either "fixed" or "movable".'
    );
  }

  if (
    !Number.isInteger(input.priority) ||
    input.priority < 1 ||
    input.priority > 10
  ) {
    throw new Error(
      "Priority must be an integer from 1 to 10."
    );
  }

  return {
    title,
    date: input.date,
    start: input.start,
    end: input.end,

    duration_minutes:
      endMinutes - startMinutes,

    type: input.type,
    priority: input.priority
  };
}

export function eventsOverlap(
  newEvent,
  existingEvent
) {
  if (
    newEvent.date !== existingEvent.date
  ) {
    return false;
  }

  return (
    timeToMinutes(newEvent.start) <
      timeToMinutes(existingEvent.end) &&

    timeToMinutes(newEvent.end) >
      timeToMinutes(existingEvent.start)
  );
}

export function createEvent(input) {

  // 1. Validate first.
  const candidate = validateEvent(input);

  const currentEvents = getAllEvents();

  // 2. Find ALL clashes.
  const conflicts = currentEvents.filter(
    (event) =>
      eventsOverlap(candidate, event)
  );

  // 3. Fixed events can NEVER be replaced.
  const fixedConflicts = conflicts.filter(
    (event) => event.type === "fixed"
  );

  if (fixedConflicts.length > 0) {
    return {
      status: "conflict",

      reason:
        "fixed_event_conflict",

      message:
        "This event overlaps with a fixed event.",

      conflicting_events:
        fixedConflicts
    };
  }

  // 4. Check priorities.
  const blockingConflicts =
    conflicts.filter(
      (event) =>
        event.priority >=
        candidate.priority
    );

  if (blockingConflicts.length > 0) {
    return {
      status: "conflict",

      reason:
        "priority_conflict",

      message:
        "The requested time is occupied by an event with equal or higher priority.",

      conflicting_events:
        blockingConflicts
    };
  }

  // Nothing has been modified before
  // ALL validation succeeds.

  const event = {
    id: generateEventId(),
    ...candidate
  };

  const displacedEvents =
    commitEvent(
      event,

      conflicts.map(
        (conflict) => conflict.id
      )
    );

  return {
    status: "success",
    event,

    displaced_events:
      displacedEvents
  };
}
