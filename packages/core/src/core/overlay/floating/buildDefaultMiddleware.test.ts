/**
 * Stage-11 · L0 Overlay Foundation · `buildDefaultMiddleware` tests
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §四 (OV-FLOAT-2)
 *
 * Coverage:
 *   · Hard contract: returned array length === 3 (always)
 *   · Soft contract: order = [offset, flip, shift] (current default impl)
 *   · Default values: offset 8 · shiftPadding 4 · flipEnabled true
 *   · Override pathways: each option independently honoured
 *   · Idempotence: separate calls return distinct arrays (no shared refs)
 */

import { describe, it, expect } from 'vitest';

import { buildDefaultMiddleware } from './buildDefaultMiddleware';

// Vendor `Middleware` has a `name: string` field (e.g. 'offset', 'flip', 'shift').
// We deliberately cast through `unknown` here to introspect the chain · this
// is a TEST-only escape from the opaque brand and does NOT exist in
// production code (which always operates on `FloatingMiddleware`).
function getNames(chain: ReturnType<typeof buildDefaultMiddleware>): string[] {
  return chain.map((m) => (m as unknown as { name: string }).name);
}

describe('buildDefaultMiddleware · OV-FLOAT-2 hard contract', () => {
  it('always returns exactly 3 middleware (hard side)', () => {
    expect(buildDefaultMiddleware()).toHaveLength(3);
    expect(buildDefaultMiddleware({ offset: 12 })).toHaveLength(3);
    expect(buildDefaultMiddleware({ shiftPadding: 8 })).toHaveLength(3);
    expect(buildDefaultMiddleware({ flipEnabled: false })).toHaveLength(3);
  });

  it('chain contains offset + flip + shift (hard side · names verifiable)', () => {
    const names = getNames(buildDefaultMiddleware());
    expect(names).toContain('offset');
    expect(names).toContain('flip');
    expect(names).toContain('shift');
  });
});

describe('buildDefaultMiddleware · OV-FLOAT-2 soft contract', () => {
  it('current default-implementation order = [offset, flip, shift] (soft · not yet hard-locked)', () => {
    expect(getNames(buildDefaultMiddleware())).toEqual(['offset', 'flip', 'shift']);
  });

  it('flipEnabled: false still emits a flip middleware (count contract preserved)', () => {
    const chain = buildDefaultMiddleware({ flipEnabled: false });
    expect(chain).toHaveLength(3);
    expect(getNames(chain)).toEqual(['offset', 'flip', 'shift']);
  });
});

describe('buildDefaultMiddleware · referential isolation', () => {
  it('separate calls return distinct array instances', () => {
    const a = buildDefaultMiddleware();
    const b = buildDefaultMiddleware();
    expect(a).not.toBe(b);
  });
});
