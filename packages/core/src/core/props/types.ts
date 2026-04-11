/**
 * Props Contract — Stage 5.3
 *
 * System-level prop interfaces for PrismUI components.
 *
 * These interfaces define the TypeScript contract for props that are shared
 * across multiple components and managed by system-level middleware.
 *
 * Rule: System prop names (variant, color, size, disabled) are reserved.
 * Components must NOT redefine their semantics. Component-specific size
 * variants must use distinct names (e.g. indicatorSize, thumbSize).
 */

import type { Variant, ThemeColor } from '../variant/types';
import type { PrismuiSize } from '../size/types';

/**
 * VariantProps
 *
 * System-level props for the variant + color system.
 * Components that declare systems: ['variant'] should extend this interface.
 *
 * @example
 * interface ButtonOwnProps extends VariantProps {
 *   children?: React.ReactNode;
 * }
 */
export interface VariantProps {
  variant?: Variant;
  color?: ThemeColor;
}

/**
 * SizeProps
 *
 * System-level props for the size system.
 * Components that declare systems: ['size'] should extend this interface.
 * The size prop is always typed as PrismuiSize — never a hand-written union.
 *
 * @example
 * interface BadgeOwnProps extends SizeProps {
 *   dot?: boolean;
 * }
 */
export interface SizeProps {
  size?: PrismuiSize;
}

/**
 * DisabledProps
 *
 * Standard disabled prop, aligned with the native HTML disabled attribute.
 * Visual behavior (opacity, cursor, pointer-events) is handled per component
 * in CSS — not injected via varsResolver.
 *
 * Note: loading / focus states are NOT part of this interface.
 * Those belong to the State System (Step 5.4+).
 */
export interface DisabledProps {
  disabled?: boolean;
}

/**
 * PolymorphicSystemProps
 *
 * Convenience intersection of all three system-level prop interfaces.
 * Suitable for interactive components that use the full system stack:
 * variant colors, size scaling, and disabled state.
 *
 * Components that only need a subset should extend specific interfaces
 * directly (e.g. Skeleton extends SizeProps only).
 *
 * @example
 * interface ButtonOwnProps extends PolymorphicSystemProps {
 *   children?: React.ReactNode;
 * }
 *
 * @example
 * interface SkeletonOwnProps extends SizeProps {
 *   radius?: PrismuiSize;
 * }
 */
export type PolymorphicSystemProps = VariantProps & SizeProps & DisabledProps;
