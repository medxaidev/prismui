import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  createDrawerModule,
  createNotificationModule,
  createAuditTrail,
  createAuditMiddleware,
  createPolicyEngine,
  createPolicyMiddleware,
  type RuntimeEvent,
  type AuditTrail,
  type PolicyEngine,
} from '@prismui/core';

// --- Governance Layer Setup ---
export const audit: AuditTrail = createAuditTrail({ maxEntries: 200 });
export const policy: PolicyEngine = createPolicyEngine();

// Example policy: block page transitions when locked
policy.addRule({
  name: 'block-transition-when-locked',
  eventTypes: ['PAGE_TRANSITION'],
  evaluate: (_event, state) => {
    if (state.locked) {
      return { verdict: 'deny', reason: 'Page is locked' };
    }
    return { verdict: 'allow' };
  },
});

export const runtime = createInteractionRuntime({
  modules: [
    createPageModule(),
    createModalModule(),
    createDrawerModule(),
    createNotificationModule({ maxNotifications: 20 }),
  ],
});

// Wire governance middleware (order: Policy → Audit → Reducer)
runtime.scheduler.use(createPolicyMiddleware(policy, runtime.store, audit));
runtime.scheduler.use(createAuditMiddleware(audit, runtime.store));

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
