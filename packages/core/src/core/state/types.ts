/**
 * PrismuiStateTokens
 *
 * Theme-level state tokens. Controls the visual appearance of
 * disabled state across all components.
 *
 * Naming convention: dimension-first (opacity-disabled, cursor-disabled)
 * This allows future expansion:
 *   opacity-disabled / opacity-hover / opacity-loading
 *   cursor-disabled  / cursor-loading
 *
 * Explicitly excluded: loading, focus, hover (not system-controlled)
 */
export interface PrismuiStateTokens {
  disabled: {
    opacity: number;   // 0~1, default: 0.5
    cursor: string;    // CSS cursor value, default: 'not-allowed'
  };
}
