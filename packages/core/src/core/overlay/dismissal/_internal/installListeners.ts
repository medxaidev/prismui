/**
 * Stage-11 · L0 Overlay Foundation · Dismissal · global listener registry
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §4.2
 *
 * Single-install with reference counting: the first registered hook adds the
 * window/document listeners; the last unregister removes them. SSR-safe — all
 * DOM access is guarded by `typeof document !== 'undefined'`.
 *
 * The listeners delegate to a per-channel callback registry. Each
 * `useDismissal` instance subscribes to the channels it has opted in for; the
 * registry fans out events to all subscribers and lets each subscriber decide
 * whether the event applies (stack-top check + boundary detection happen at
 * the subscriber level, not here).
 */

export type DismissalChannel =
  | 'pointerdown'
  | 'click'
  | 'keydown'
  | 'focusin'
  | 'scroll';

type ChannelCallback<E extends Event = Event> = (event: E) => void;

interface ChannelEntry {
  count: number;
  callbacks: Set<ChannelCallback>;
  cleanup: (() => void) | null;
}

const channels: Record<DismissalChannel, ChannelEntry> = {
  pointerdown: { count: 0, callbacks: new Set(), cleanup: null },
  click: { count: 0, callbacks: new Set(), cleanup: null },
  keydown: { count: 0, callbacks: new Set(), cleanup: null },
  focusin: { count: 0, callbacks: new Set(), cleanup: null },
  scroll: { count: 0, callbacks: new Set(), cleanup: null },
};

function hasDocument(): boolean {
  return typeof document !== 'undefined';
}

function installChannel(channel: DismissalChannel): void {
  if (!hasDocument()) return;
  const entry = channels[channel];
  if (entry.cleanup) return;

  const dispatcher = (event: Event) => {
    // Iterate over a snapshot to avoid mutation-during-iteration when a
    // subscriber synchronously unregisters (e.g. consumer setState ⇒ unmount).
    const snapshot = Array.from(entry.callbacks);
    for (const cb of snapshot) cb(event);
  };

  // capture-phase across the board; scroll uses passive for performance
  // (we never preventDefault here — see §3.1 "显式不 preventDefault").
  switch (channel) {
    case 'pointerdown':
      document.addEventListener('pointerdown', dispatcher, true);
      entry.cleanup = () =>
        document.removeEventListener('pointerdown', dispatcher, true);
      break;
    case 'click':
      document.addEventListener('click', dispatcher, true);
      entry.cleanup = () =>
        document.removeEventListener('click', dispatcher, true);
      break;
    case 'keydown':
      // window keydown so we catch it before any focused-element handler.
      window.addEventListener('keydown', dispatcher, true);
      entry.cleanup = () =>
        window.removeEventListener('keydown', dispatcher, true);
      break;
    case 'focusin':
      // focusin bubbles natively; capture is fine and matches contract §3.3.
      document.addEventListener('focusin', dispatcher, true);
      entry.cleanup = () =>
        document.removeEventListener('focusin', dispatcher, true);
      break;
    case 'scroll':
      document.addEventListener('scroll', dispatcher, {
        capture: true,
        passive: true,
      });
      entry.cleanup = () =>
        document.removeEventListener('scroll', dispatcher, true);
      break;
  }
}

function uninstallChannel(channel: DismissalChannel): void {
  const entry = channels[channel];
  if (entry.cleanup) {
    entry.cleanup();
    entry.cleanup = null;
  }
}

/**
 * Subscribe to a global channel. Increments the channel's refcount, installs
 * the listener on first subscription, and returns an unsubscribe function
 * that decrements the refcount and tears the listener down on the last
 * unsubscribe.
 */
export function subscribeChannel<E extends Event = Event>(
  channel: DismissalChannel,
  callback: ChannelCallback<E>,
): () => void {
  const entry = channels[channel];
  entry.callbacks.add(callback as ChannelCallback);
  entry.count += 1;
  if (entry.count === 1) installChannel(channel);

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    entry.callbacks.delete(callback as ChannelCallback);
    entry.count -= 1;
    if (entry.count <= 0) {
      entry.count = 0;
      uninstallChannel(channel);
    }
  };
}

/**
 * Test-only: tear down every channel, regardless of refcount. Mirrors the
 * `__resetDismissalStack` helper exported from `DismissalStack.ts`.
 */
export function __resetDismissalListeners(): void {
  (Object.keys(channels) as DismissalChannel[]).forEach((channel) => {
    const entry = channels[channel];
    uninstallChannel(channel);
    entry.callbacks.clear();
    entry.count = 0;
  });
}
