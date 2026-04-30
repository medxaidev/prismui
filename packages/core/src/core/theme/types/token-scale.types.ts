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
 * 8-step semantic spacing scale (Stage-14 SZ-SCALE-4 v0.2 lock).
 *
 * Aligned with the 4-px primitive scale (Stage-14 SZ-SCALE-1/2):
 *   none = 0    xs = 4     sm = 8     md = 16
 *   lg   = 24   xl = 32    2xl = 40   3xl = 48
 *
 * Scope: covers values that recur across layout / component padding.
 * Components MAY use the primitive `theme.scale` for one-off non-recurring
 * values, but recurring values MUST be semantic-tokenized here.
 */
export type SpacingScale =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

/**
 * Font Size Scale
 *
 * 5-step font size scale
 */
export type FontSizeScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Font Weight Scale
 *
 * 5-step font weight scale
 */
export type FontWeightScale = "regular" | "medium" | "semibold" | "bold" | "extrabold";

/**
 * Line Height Scale
 *
 * 5-step line height scale
 */
export type LineHeightScale = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Typography Family (Stage-14 SZ-TYPE-2 · v1.0 lock)
 *
 * Three semantic families layered on top of the primitive scales above:
 *   - `body`  — running text, paragraph copy
 *   - `title` — headings (h1-h3), modal/section titles
 *   - `label` — UI text on buttons, form fields, tabs, tags
 *
 * Each family carries its own (fontSize, lineHeight, fontWeight) triple per
 * size step (see `TypographySize`). Used by `theme.typography.{body,title,label}`.
 */
export type TypographyFamily = "body" | "title" | "label";

/**
 * Typography Size (Stage-14 SZ-TYPE-2 · v1.0 lock)
 *
 * Three-step size scale per family. Aligned with component size scale (sm/md/lg)
 * but independent — typography size does NOT have to match component size 1:1.
 * (e.g. Button sm uses `label.md` per OQ-SZ-1=B, not `label.sm`.)
 */
export type TypographySize = "sm" | "md" | "lg";

/**
 * Radius Scale
 *
 * 5-step border radius scale
 */
export type RadiusScale = "xs" | "sm" | "md" | "lg" | "xl" | "full";

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

/**
 * Transition Duration Scale
 *
 * 3-step duration scale
 */
export type TransitionDurationScale = "fast" | "base" | "slow";

/**
 * Transition Easing Scale
 *
 * 3-step easing curve scale
 */
export type TransitionEasingScale = "standard" | "in" | "out";
