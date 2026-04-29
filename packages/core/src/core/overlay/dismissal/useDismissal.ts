/**
 * Stage-11 · L0 Overlay Foundation · Dismissal · `useDismissal` hook
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §2.1 + §三 + §四
 *
 * Behaviour summary:
 *   · `enabled: false` · hook is a noop · `close()` is a noop (P0-1)
 *   · 5 channels · each opt-in · default all off (OQ-OV-3 B)
 *   · programmatic-close · always available · highest priority
 *   · OV-DISMISS-2 stack policy · escape-key + pointer-outside only fire on
 *     the top entry
 *   · OV-DISMISS-3 self-reflexive · trigger ref excluded from outside checks
 *   · synchronous dispatch (v0.1.2 §3.1.x) · `onDismiss` runs inside the
 *     native event listener stack · cancel via `return false` resets the dedup
 *
 * IME composition guard (§3.2): we ignore Escape while `event.isComposing` is
 * `true` so CJK candidate windows don't accidentally close overlays.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useSyncExternalStore } from 'react';

import {
  DismissalStack,
  registerDismissalEntry,
  unregisterDismissalEntry,
} from './DismissalStack';
import { subscribeChannel } from './_internal/installListeners';
import { isInsideOverlay, isInsideTrigger } from './_internal/detectOutside';
import {
  createDedupRef,
  decideDispatch,
  resetDedup,
} from './_internal/priorityDedup';
import type {
  DismissalReason,
  DismissalStackEntry,
  PointerOutsideOptions,
  UseDismissalOptions,
  UseDismissalResult,
} from './types';

function normalisePointerOptions(
  value: boolean | PointerOutsideOptions | undefined,
): { enabled: boolean; trigger: 'pointerdown' | 'click'; pointerTypes?: ReadonlyArray<'mouse' | 'touch' | 'pen'> } {
  if (value === undefined || value === false) {
    return { enabled: false, trigger: 'pointerdown' };
  }
  if (value === true) {
    return { enabled: true, trigger: 'pointerdown' };
  }
  return {
    enabled: true,
    trigger: value.trigger ?? 'pointerdown',
    pointerTypes: value.pointerTypes,
  };
}

export function useDismissal(options: UseDismissalOptions): UseDismissalResult {
  const {
    enabled = true,
    overlayRef,
    triggerRef,
    pointerOutside,
    escapeKey = false,
    focusOutside = false,
    scrollOutside = false,
    onDismiss,
  } = options;

  const reactId = useId();

  // Latest options pinned in a ref so listeners (registered once per channel)
  // always see the freshest config without re-binding on every render.
  const latestRef = useRef({
    onDismiss,
    pointerOutside,
    escapeKey,
    focusOutside,
    scrollOutside,
    overlayRef,
    triggerRef,
    enabled,
  });
  latestRef.current = {
    onDismiss,
    pointerOutside,
    escapeKey,
    focusOutside,
    scrollOutside,
    overlayRef,
    triggerRef,
    enabled,
  };

  // Stable per-instance dedup latch — never shared across hooks.
  const dedupRef = useRef(createDedupRef());

  // Stack-eligible iff this entry actually opts into a stack-managed channel.
  const pointer = normalisePointerOptions(pointerOutside);
  const stackEligible = enabled && (escapeKey || pointer.enabled);

  // Stable identity object — re-created only when stack eligibility changes
  // so registration / unregistration triggers exactly once per transition.
  const entryRef = useRef<DismissalStackEntry | null>(null);
  const entry = useMemo<DismissalStackEntry | null>(() => {
    if (!stackEligible) return null;
    const channels: DismissalReason[] = [];
    if (escapeKey) channels.push('escape-key');
    if (pointer.enabled) channels.push('pointer-outside');
    const next: DismissalStackEntry = {
      id: reactId,
      channels: Object.freeze(channels.slice()) as ReadonlyArray<DismissalReason>,
    };
    entryRef.current = next;
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stackEligible, escapeKey, pointer.enabled, reactId]);

  // ── stack registration ────────────────────────────────────────────────────
  useEffect(() => {
    if (!entry) return;
    registerDismissalEntry(entry);
    return () => {
      unregisterDismissalEntry(entry);
    };
  }, [entry]);

  // ── synchronous dispatch ──────────────────────────────────────────────────
  const dispatchDismiss = useCallback(
    (reason: DismissalReason, event: Event | null) => {
      const decision = decideDispatch(dedupRef.current, reason);
      if (!decision.proceed) return;
      dedupRef.current.tick = decision.tick;
      dedupRef.current.priority = decision.priority;

      const result = latestRef.current.onDismiss(reason, event);
      if (result === false) {
        // Cancel — clear the latch so subsequent events can still fire.
        resetDedup(dedupRef.current);
      }
    },
    [],
  );

  // ── pointer-outside channel ──────────────────────────────────────────────
  useEffect(() => {
    if (!entry) return;
    const cfg = normalisePointerOptions(latestRef.current.pointerOutside);
    if (!cfg.enabled) return;

    const channel = cfg.trigger === 'click' ? 'click' : 'pointerdown';

    const unsubscribe = subscribeChannel<PointerEvent>(channel, (event) => {
      const live = latestRef.current;
      if (!live.enabled) return;
      const liveCfg = normalisePointerOptions(live.pointerOutside);
      if (!liveCfg.enabled) return;

      // PointerType filter (only meaningful for `pointerdown` · click events
      // do not carry pointerType in some engines, so skip the filter there).
      if (liveCfg.pointerTypes && liveCfg.pointerTypes.length > 0) {
        const t = (event as PointerEvent).pointerType as
          | 'mouse'
          | 'touch'
          | 'pen'
          | '';
        if (t && !liveCfg.pointerTypes.includes(t as 'mouse' | 'touch' | 'pen')) {
          return;
        }
      }

      // OV-DISMISS-2 — only the stack-top entry handles outside pointer.
      const top = DismissalStack.top();
      if (!top || top.id !== entry.id) return;

      const target = event.target as Node | null;
      if (isInsideOverlay(live.overlayRef, target)) return;
      if (isInsideTrigger(live.triggerRef, target)) return;

      dispatchDismiss('pointer-outside', event);
    });

    return unsubscribe;
    // We intentionally only re-subscribe when the channel itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, pointer.enabled, pointer.trigger, dispatchDismiss]);

  // ── escape-key channel ───────────────────────────────────────────────────
  useEffect(() => {
    if (!entry || !escapeKey) return;

    const unsubscribe = subscribeChannel<KeyboardEvent>('keydown', (event) => {
      if (event.key !== 'Escape') return;
      // IME composition guard (§3.2).
      if ((event as KeyboardEvent).isComposing) return;
      // Some legacy engines report `keyCode === 229` while composing.
      if ((event as KeyboardEvent).keyCode === 229) return;

      const live = latestRef.current;
      if (!live.enabled || !live.escapeKey) return;

      const top = DismissalStack.top();
      if (!top || top.id !== entry.id) return;

      dispatchDismiss('escape-key', event);
    });

    return unsubscribe;
  }, [entry, escapeKey, dispatchDismiss]);

  // ── focus-outside channel ────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !focusOutside) return;

    const unsubscribe = subscribeChannel<FocusEvent>('focusin', (event) => {
      const live = latestRef.current;
      if (!live.enabled || !live.focusOutside) return;

      const target = event.target as Node | null;
      if (!target) return;
      if (isInsideOverlay(live.overlayRef, target)) return;
      if (isInsideTrigger(live.triggerRef, target)) return;

      dispatchDismiss('focus-outside', event);
    });

    return unsubscribe;
  }, [enabled, focusOutside, dispatchDismiss]);

  // ── scroll-outside channel ───────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !scrollOutside) return;

    const unsubscribe = subscribeChannel<Event>('scroll', (event) => {
      const live = latestRef.current;
      if (!live.enabled || !live.scrollOutside) return;

      const target = event.target as Node | null;
      // P1-1 conservative default — overlayRef not yet mounted ⇒ ignore.
      if (!live.overlayRef.current) return;
      // document scroll events have target === document → counts as outside.
      if (target && live.overlayRef.current.contains(target)) return;

      dispatchDismiss('scroll-outside', event);
    });

    return unsubscribe;
  }, [enabled, scrollOutside, dispatchDismiss]);

  // ── isTopOfStack reactive read ──────────────────────────────────────────
  const getSnapshot = useCallback(() => {
    if (!entry) return false;
    return DismissalStack.top()?.id === entry.id;
  }, [entry]);
  const getServerSnapshot = useCallback(() => false, []);
  const isTopOfStack = useSyncExternalStore(
    DismissalStack.subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // ── programmatic-close ──────────────────────────────────────────────────
  const close = useCallback(() => {
    // P0-1 — disabled hook ⇒ no-op (no callback, no dedup mutation).
    if (!latestRef.current.enabled) return;
    dispatchDismiss('programmatic-close', null);
  }, [dispatchDismiss]);

  return { close, isTopOfStack };
}
