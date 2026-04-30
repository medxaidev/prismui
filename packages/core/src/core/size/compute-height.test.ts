import { describe, it, expect } from 'vitest';
import {
  computeHeight,
  isValidLineHeightPx,
  isValidPaddingYPx,
} from './compute-height';
import { defaultSizeTokens } from './default-size-tokens';
import type { PrismuiSize } from './types';

describe('computeHeight (Stage-14 SZ-COMP-1)', () => {
  // ── Closed-form algebra ────────────────────────────────────────────────
  describe('closed-form formula: height = lineHeight + paddingY*2 + borderY', () => {
    it('Stage-14 anchor: Button md ideal = 20 + 8*2 + 2 = 38 (SZ-COMP-2)', () => {
      expect(computeHeight({ lineHeight: 20, paddingY: 8, borderY: 2 })).toBe(38);
    });

    it('Stage-14 anchor: Button lg ideal = 24 + 8*2 + 2 = 42', () => {
      expect(computeHeight({ lineHeight: 24, paddingY: 8, borderY: 2 })).toBe(42);
    });

    it('Stage-14 anchor: Button sm ideal = 20 + 4*2 + 2 = 30', () => {
      expect(computeHeight({ lineHeight: 20, paddingY: 4, borderY: 2 })).toBe(30);
    });

    it('zero paddingY collapses to lineHeight + borderY', () => {
      expect(computeHeight({ lineHeight: 20, paddingY: 0, borderY: 2 })).toBe(22);
    });

    it('zero borderY collapses to lineHeight + paddingY*2 (variant.outline-less hypothetical)', () => {
      expect(computeHeight({ lineHeight: 20, paddingY: 8, borderY: 0 })).toBe(36);
    });

    it('large borderY (4 · OQ-SZ-9 outline variant alt) participates linearly', () => {
      expect(computeHeight({ lineHeight: 20, paddingY: 8, borderY: 4 })).toBe(40);
    });
  });

  // ── Advisory invariant checks ──────────────────────────────────────────
  describe('isValidLineHeightPx (SZ-TYPE-1 advisory)', () => {
    it('accepts the canonical px integer pool', () => {
      for (const lh of [16, 20, 24, 28, 32, 36, 40, 48]) {
        expect(isValidLineHeightPx(lh), `lh=${lh}`).toBe(true);
      }
    });

    it('rejects ratio values (1.25 / 1.4 / 1.5)', () => {
      expect(isValidLineHeightPx(1.25)).toBe(false);
      expect(isValidLineHeightPx(1.4)).toBe(false);
      expect(isValidLineHeightPx(1.5)).toBe(false);
    });

    it('rejects px values not divisible by 4', () => {
      expect(isValidLineHeightPx(18)).toBe(false);
      expect(isValidLineHeightPx(22)).toBe(false);
      expect(isValidLineHeightPx(30)).toBe(false);
    });

    it('rejects values below 16 (SZ-TYPE-1 floor)', () => {
      expect(isValidLineHeightPx(12)).toBe(false);
      expect(isValidLineHeightPx(8)).toBe(false);
      expect(isValidLineHeightPx(0)).toBe(false);
    });
  });

  describe('isValidPaddingYPx (SZ-SCALE-2 advisory)', () => {
    it('accepts the canonical 4-multiple pool', () => {
      for (const py of [0, 4, 8, 12, 16, 20, 24]) {
        expect(isValidPaddingYPx(py), `py=${py}`).toBe(true);
      }
    });

    it('rejects values not divisible by 4', () => {
      expect(isValidPaddingYPx(3)).toBe(false);
      expect(isValidPaddingYPx(6)).toBe(false);
      expect(isValidPaddingYPx(10)).toBe(false);
    });

    it('rejects negative values', () => {
      expect(isValidPaddingYPx(-4)).toBe(false);
    });
  });
});

// ── default-size-tokens drift audit · ratchet guardrail ──────────────────
//
// v1 baseline carries known drifts (xs/md/xl: actual = ideal − 2). This test
// MUST stay green and acts as a ratchet: drift may NOT regress further (i.e.
// new drift introductions or wider negative drift fail this test). Phase 3
// chose Option (a) — preserve v1 baseline visuals + label drift explicitly.
// v1.x backlog is to migrate to ideal (drift → 0 across all tiers).
describe('defaultSizeTokens × computeHeight ratchet (Phase 3 drift audit)', () => {
  // Lock the expected drift table so the test fails if anyone "fixes" the
  // baseline silently or introduces a new drift class.
  const expectedDrift: Record<PrismuiSize, number> = {
    xs: -2, // ideal 26 − actual 24
    sm:  0, // ideal 30 − actual 30
    md: -2, // ideal 38 − actual 36 (SZ-COMP-2 anchor 38)
    lg:  0, // ideal 42 − actual 42
    xl: -2, // ideal 50 − actual 48
  };

  // Helper: parse '24px' → 24 ; tolerates both `24` and `'24px'`.
  function parsePx(value: string | number): number {
    if (typeof value === 'number') return value;
    return parseInt(value, 10);
  }

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    '%s: SZ-COMP-1 inputs are individually invariant-compliant',
    (size) => {
      const t = defaultSizeTokens[size];
      // SZ-TYPE-1: lineHeight px integer · % 4 === 0 · ≥ 16
      expect(isValidLineHeightPx(t.lineHeight), `${size}.lineHeight=${t.lineHeight}`).toBe(true);
      // SZ-SCALE-2: paddingY % 4 === 0
      expect(isValidPaddingYPx(parsePx(t.paddingY)), `${size}.paddingY=${t.paddingY}`).toBe(true);
      // SZ-COMP-6: borderY = 2 (default · structural placeholder)
      expect(t.borderY, `${size}.borderY`).toBe(2);
    },
  );

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    '%s: actual height = ideal + drift (locked drift table · ratchet)',
    (size) => {
      const t = defaultSizeTokens[size];
      const ideal = computeHeight({
        lineHeight: t.lineHeight,
        paddingY: parsePx(t.paddingY),
        borderY: t.borderY,
      });
      const actual = parsePx(t.height);
      const drift = actual - ideal;
      expect(drift, `${size}: actual=${actual} - ideal=${ideal}`).toBe(expectedDrift[size]);
    },
  );

  it('all drift values are ≤ 0 (actual ≤ ideal · ratchet floor)', () => {
    // Future migrations may raise actual toward ideal (drift → 0) but MUST
    // NOT exceed ideal (drift > 0 would mean over-padding silently appearing).
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      const t = defaultSizeTokens[size];
      const ideal = computeHeight({
        lineHeight: t.lineHeight,
        paddingY: parsePx(t.paddingY),
        borderY: t.borderY,
      });
      const actual = parsePx(t.height);
      expect(actual - ideal, `${size}: drift must be ≤ 0`).toBeLessThanOrEqual(0);
    }
  });

  it('Stage-14 SZ-COMP-2: Button md ideal = 38 (anchor)', () => {
    // This test makes the SZ-COMP-2 anchor explicit at the size-token layer.
    // If anyone changes typography.label.md or default-size-tokens.md.paddingY
    // without updating Stage-14 §3.3, this test fails loudly.
    const md = defaultSizeTokens.md;
    expect(
      computeHeight({
        lineHeight: md.lineHeight,
        paddingY: parsePx(md.paddingY),
        borderY: md.borderY,
      }),
    ).toBe(38);
  });
});
