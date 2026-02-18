import type { RuntimeKernel } from './types';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a new RuntimeKernel instance.
 *
 * The kernel provides two separate registries:
 * - **Internal** (`register`/`get`): module-to-module service sharing
 * - **Exposed** (`expose`/`getExposed`): module-to-component API exposure
 *
 * @example
 * ```ts
 * const kernel = createRuntimeKernel();
 * kernel.register('overlay', overlayManager);
 * kernel.expose('dialog', dialogController);
 * ```
 */
export function createRuntimeKernel(): RuntimeKernel {
  const registry = new Map<string, unknown>();
  const exposed = new Map<string, unknown>();
  const modules = new Set<string>();

  return {
    // -- Internal registry --------------------------------------------------

    register<T>(name: string, value: T): void {
      if (registry.has(name)) {
        throw new Error(
          `[PrismUI Runtime] Module "${name}" is already registered. ` +
          `Each module name must be unique.`,
        );
      }
      registry.set(name, value);
      modules.add(name);
    },

    get<T>(name: string): T | undefined {
      return registry.get(name) as T | undefined;
    },

    has(name: string): boolean {
      return registry.has(name);
    },

    // -- Exposed registry ---------------------------------------------------

    expose<T>(name: string, api: T): void {
      exposed.set(name, api);
    },

    getExposed<T>(name: string): T | undefined {
      return exposed.get(name) as T | undefined;
    },

    // -- Introspection ------------------------------------------------------

    getModules(): string[] {
      return Array.from(modules);
    },

    isReady(): boolean {
      return modules.size > 0;
    },
  };
}
