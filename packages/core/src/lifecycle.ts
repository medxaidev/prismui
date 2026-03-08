// ---------------------------------------------------------------------------
// Module Lifecycle — constants and types for module lifecycle management
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

/** Status of a registered module within the runtime. */
export type ModuleStatus = 'registered' | 'active' | 'destroyed';

/** Event dispatched when a module completes initialization. */
export const MODULE_INIT = 'MODULE_INIT';

/** Event dispatched when a module is destroyed. */
export const MODULE_DESTROY = 'MODULE_DESTROY';
