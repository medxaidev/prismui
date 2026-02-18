// ---------------------------------------------------------------------------
// Runtime Kernel Types
// ---------------------------------------------------------------------------

/**
 * A pluggable runtime module that can be registered with PrismuiProvider.
 *
 * Modules encapsulate runtime capabilities (overlay management, dialog control,
 * toast notifications, etc.) and are tree-shakable — only imported modules
 * are bundled.
 *
 * @example
 * ```ts
 * export function overlayModule(): PrismuiModule {
 *   return {
 *     name: 'overlay',
 *     setup(kernel) {
 *       const manager = createOverlayManager();
 *       kernel.register('overlay', manager);
 *     },
 *     teardown() {
 *       // cleanup global listeners
 *     },
 *   };
 * }
 * ```
 */
export interface PrismuiModule {
  /** Unique module name. Used as the registry key. */
  name: string;

  /**
   * Called once when the module is initialized by PrismuiProvider.
   * Use `kernel.register()` to make services available to other modules,
   * and `kernel.expose()` to make APIs available to components.
   */
  setup(kernel: RuntimeKernel): void | Promise<void>;

  /**
   * Called when PrismuiProvider unmounts. Use this to clean up global
   * event listeners, timers, or subscriptions.
   */
  teardown?(): void;
}

// ---------------------------------------------------------------------------
// RuntimeKernel interface
// ---------------------------------------------------------------------------

/**
 * The core runtime kernel that manages module registration and service access.
 *
 * Created internally by `PrismuiProvider` and accessible via `useRuntimeKernel()`.
 *
 * **Two registries**:
 * - **Internal registry** (`register`/`get`): For module-to-module communication.
 *   E.g., `dialogModule` retrieves `overlayModule`'s manager.
 * - **Exposed registry** (`expose`/`getExposed`): For component-level access.
 *   E.g., `useDialogController()` retrieves the dialog API.
 */
export interface RuntimeKernel {
  // -- Internal registry (module-to-module) ---------------------------------

  /**
   * Register a service in the internal registry.
   * Throws if a service with the same name is already registered.
   */
  register<T>(name: string, value: T): void;

  /** Retrieve a service from the internal registry. */
  get<T>(name: string): T | undefined;

  /** Check if a service is registered. */
  has(name: string): boolean;

  // -- Exposed registry (module-to-component) -------------------------------

  /**
   * Expose a public API for component consumption.
   * Typically called by controller modules (dialog, toast).
   */
  expose<T>(name: string, api: T): void;

  /** Retrieve an exposed API. Used by hooks like `useDialogController()`. */
  getExposed<T>(name: string): T | undefined;

  // -- Introspection --------------------------------------------------------

  /** List all registered module names. */
  getModules(): string[];

  /** Returns true if at least one module has been registered. */
  isReady(): boolean;
}
