import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  type RuntimeEvent,
} from '@prismui/core';

export const runtime = createInteractionRuntime({
  modules: [createPageModule(), createModalModule()],
});

/** Enriched event entry with version tracking for EventLog display. */
export interface EventEntry {
  event: RuntimeEvent;
  prevVersion: number;
  nextVersion: number;
}

/** Ring buffer of enriched event entries. */
export const eventEntries: EventEntry[] = [];

// Track version changes by subscribing to bus events
let lastVersion = runtime.store.getState().version;

runtime.bus.subscribe((event: RuntimeEvent) => {
  const prevVersion = lastVersion;
  const nextVersion = runtime.store.getState().version;
  lastVersion = nextVersion;

  eventEntries.push({ event, prevVersion, nextVersion });

  // Keep last 100 entries
  if (eventEntries.length > 100) {
    eventEntries.shift();
  }
});
