/**
 * Stage 9 Type-Level Validation for Button Slot System.
 *
 * This file is a compile-time-only test. It verifies that TypeScript
 * correctly catches invalid slot names and classNames keys.
 *
 * Run: npx tsc --noEmit packages/core/src/components/Button/Button.type-test.ts
 * Expected: 0 errors on valid lines, @ts-expect-error suppresses invalid lines.
 */
import type { ButtonStylesNames } from './Button';

// ── Point 1: ButtonStylesNames is a literal union, not `string` ──

// ✅ Valid slot names
const _valid1: ButtonStylesNames = 'root';
const _valid2: ButtonStylesNames = 'inner';
const _valid3: ButtonStylesNames = 'label';

// ❌ Invalid slot name — must be caught
// @ts-expect-error — 'lable' is not a valid ButtonStylesNames
const _invalid1: ButtonStylesNames = 'lable';

// @ts-expect-error — 'wrong' is not a valid ButtonStylesNames
const _invalid2: ButtonStylesNames = 'wrong';

// ── Point 2: classNames is constrained to ButtonStylesNames ──

import type { ButtonProps } from './Button';

// ✅ Valid classNames keys
const _validProps1: ButtonProps = { classNames: { root: 'x' } };
const _validProps2: ButtonProps = { classNames: { label: 'x' } };
const _validProps3: ButtonProps = { classNames: { inner: 'x' } };
const _validProps4: ButtonProps = { classNames: { root: 'a', inner: 'b', label: 'c' } };

// ❌ Invalid classNames key — must be caught
// @ts-expect-error — 'wrong' is not a valid slot name
const _invalidProps1: ButtonProps = { classNames: { wrong: 'x' } };

// @ts-expect-error — 'lable' is not a valid slot name
const _invalidProps2: ButtonProps = { classNames: { lable: 'x' } };

// ── Point 1b: getStyles type constraint via FactoryRenderContext ──

import type { FactoryRenderContext } from '../../core/component/factory';

// Simulate the render context with Button's Names type
type ButtonRenderCtx = FactoryRenderContext<any, ButtonStylesNames>;

function _testGetStyles(ctx: ButtonRenderCtx) {
  // ✅ Valid slot names
  ctx.styles.getStyles('root');
  ctx.styles.getStyles('inner');
  ctx.styles.getStyles('label');

  // ❌ Invalid slot names — must be caught
  // @ts-expect-error — 'lable' is not a valid ButtonStylesNames
  ctx.styles.getStyles('lable');

  // @ts-expect-error — 'wrong' is not a valid ButtonStylesNames
  ctx.styles.getStyles('wrong');
}

// ── Point 2b: styles override is also constrained ──
const _validStyles1: ButtonProps = { styles: { root: { color: 'red' } } };
const _validStyles2: ButtonProps = { styles: { label: { fontWeight: 'bold' } } };

// @ts-expect-error — 'wrong' is not a valid slot name
const _invalidStyles1: ButtonProps = { styles: { wrong: { color: 'red' } } };

// ── Point 3: SlotNames derives from defineSlots, not manual declaration ──
// This is structural — verified by the fact that ButtonStylesNames
// equals SlotNames<typeof buttonSlots> (see Button.tsx line 14).
// If a new slot is added to defineSlots, it auto-appears in ButtonStylesNames.

// Suppress unused variable warnings
void _valid1; void _valid2; void _valid3;
void _invalid1; void _invalid2;
void _validProps1; void _validProps2; void _validProps3; void _validProps4;
void _invalidProps1; void _invalidProps2;
void _testGetStyles;
void _validStyles1; void _validStyles2; void _invalidStyles1;
