let events = [];
let displacedEvents = [];
let nextId = 1;

export function getAllEvents() {
  return structuredClone(events);
}

export function generateEventId() {
  return nextId++;
}

export function commitEvent(newEvent, conflictingIds = []) {
  const ids = new Set(conflictingIds);

  const displaced = events.filter((event) =>
    ids.has(event.id)
  );

  events = events.filter((event) =>
    !ids.has(event.id)
  );

  events.push(newEvent);

  events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.start.localeCompare(b.start) ||
      a.id - b.id
  );

  displacedEvents.push(
    ...displaced.map((event) => ({
      ...structuredClone(event),
      status: "needs_rescheduling",
      displaced_by_event_id: newEvent.id
    }))
  );

  return structuredClone(displaced);
}

export function getDisplacedEvents() {
  return structuredClone(displacedEvents);
}
