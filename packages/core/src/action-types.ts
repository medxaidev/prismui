// ---------------------------------------------------------------------------
// Action Types — Namespaced action type utilities for module isolation
// Enforces `module/action` naming convention.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

/**
 * Create a namespaced action type string.
 *
 * @param moduleName - Module identifier (lowercase)
 * @param actionName - Action identifier (camelCase)
 * @returns Namespaced action type `"moduleName/actionName"`
 */
export function createActionType(moduleName: string, actionName: string): string {
  if (!moduleName || !actionName) {
    throw new Error('[ActionTypes] Module name and action name are required');
  }
  return `${moduleName}/${actionName}`;
}

/**
 * Parse a namespaced action type into its components.
 *
 * @param actionType - Full action type string (e.g. `"modal/open"`)
 * @returns Object with `moduleName` and `actionName`, or `null` if not valid
 */
export function parseActionType(actionType: string): {
  moduleName: string;
  actionName: string;
} | null {
  const idx = actionType.indexOf('/');
  if (idx <= 0 || idx === actionType.length - 1) return null;
  // Only allow a single `/`
  if (actionType.indexOf('/', idx + 1) >= 0) return null;

  return {
    moduleName: actionType.slice(0, idx),
    actionName: actionType.slice(idx + 1),
  };
}

/**
 * Batch-create namespaced action type constants for a module.
 *
 * @example
 * ```ts
 * const ModalActions = createModuleActions('modal', {
 *   OPEN: 'open',
 *   CLOSE: 'close',
 *   CLOSE_ALL: 'closeAll',
 * });
 * // ModalActions.OPEN === 'modal/open'
 * ```
 */
export function createModuleActions<T extends Record<string, string>>(
  moduleName: string,
  actions: T,
): { [K in keyof T]: string } {
  const result = {} as { [K in keyof T]: string };

  for (const key in actions) {
    if (Object.prototype.hasOwnProperty.call(actions, key)) {
      result[key] = createActionType(moduleName, actions[key]);
    }
  }

  return result;
}

/**
 * Check whether an action type follows the `module/action` namespace format.
 */
export function isNamespacedActionType(actionType: string): boolean {
  return parseActionType(actionType) !== null;
}
