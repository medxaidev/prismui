/**
 * Radius System Types
 *
 * Core definition:
 *   Radius System = 统一的 border-radius 取值契约 — 组件通过 `radius` prop
 *   表达边角尺度，值域为标准 scale 枚举或任意 CSS length。
 *
 * Two-axis value vocabulary:
 *   1. Theme scale: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
 *      → 解析为 `var(--prismui-radius-<scale>)`（主题注入，可由 theme.radius 覆盖）
 *   2. CSS length: `(string & {})` → 原样透传（如 '4px' / '0.5em' / 'calc(...)')
 *
 * Design rationale:
 *   - 组件 props 复用同一张 scale 枚举，不重复各自定义 union 类型
 *   - token 解析函数集中一处，避免 Button/Input 各自手写重复 if-chain
 *   - 未来 theme.radius 扩展新 scale 时，只需改 scale set 一处
 *
 * Related systems:
 *   - Size System (`core/size`) — 盒子模型 / 内部布局 / 字号
 *   - Radius System (`core/radius`) — 边角尺度（本模块）
 *   - Elevation System（未来） — 阴影 / 层级
 */

/**
 * PrismuiRadius
 *
 * The 6 standard radius scale tokens shared across all PrismUI components.
 * Maps 1:1 to theme.radius keys and emits `var(--prismui-radius-<scale>)`.
 */
export type PrismuiRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Radius
 *
 * Component-facing prop type. Union of:
 *   - PrismuiRadius — theme scale (resolves via CSS var)
 *   - `(string & {})` — any CSS length (passes through verbatim)
 *
 * The `(string & {})` idiom preserves scale-key autocomplete in editors while
 * still admitting arbitrary string values at the type level.
 *
 * Naming note: intentionally NOT `RadiusValue` — that name is taken by
 * `core/theme` for the theme-level token value type (radius scale entries).
 * This alias lives at the component-prop layer, parallel to how `Variant`
 * lives in `core/variant`.
 */
export type Radius = PrismuiRadius | (string & {});

/**
 * Runtime-checkable set of known scale keys. Kept in sync with `PrismuiRadius`
 * so `resolveRadiusToken` can discriminate scale-vs-length in O(1).
 */
export const RADIUS_SCALE: ReadonlySet<PrismuiRadius> = new Set<PrismuiRadius>([
  'xs', 'sm', 'md', 'lg', 'xl', 'full',
]);
