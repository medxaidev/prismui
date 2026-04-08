/**
 * Token Scale Types
 *
 * Independent token scale definitions
 * Used by both Theme and Usage Types
 *
 * These scales are the foundation of the PrismUI token system.
 * They are defined independently to avoid circular dependencies
 * between Theme and Usage Types.
 */

/**
 * Spacing Scale
 *
 * 5-step spacing scale
 */
export type SpacingScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Font Size Scale
 *
 * 5-step font size scale
 */
export type FontSizeScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Font Weight Scale
 *
 * 4-step font weight scale
 */
export type FontWeightScale = "regular" | "medium" | "semibold" | "bold";

/**
 * Line Height Scale
 *
 * 5-step line height scale
 */
export type LineHeightScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Radius Scale
 *
 * 5-step border radius scale
 */
export type RadiusScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Shadow Scale
 *
 * 5-step shadow scale
 */
export type ShadowScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Breakpoint Scale
 *
 * 5-step breakpoint scale
 */
export type BreakpointScale = "xs" | "sm" | "md" | "lg" | "xl";
