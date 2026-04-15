import type { SlotDefinition } from './define-slots';

/**
 * Payload shape consumed by resolveStylesNames.
 * Matches the relevant fields of ComponentPayload.
 */
interface ResolveStylesNamesInput {
  displayName: string;
  slots?: SlotDefinition;
  styling?: {
    structure: {
      stylesNames: readonly string[];
    };
  };
}

/**
 * Resolve the canonical stylesNames for a component.
 *
 * Single source of truth — all downstream systems MUST use this output:
 * - ensureClasses (CSS Modules validation)
 * - createStylingContext (getStyles parameter constraint)
 * - classNames/styles typing (StylingProps<Names>)
 *
 * Priority:
 * 1. slots exists + no explicit stylesNames → derive from slots keys
 * 2. slots exists + explicit stylesNames → use explicit (must be subset, DEV validated)
 * 3. no slots → use explicit stylesNames (legacy path)
 * 4. neither → empty array (root-only component, fallback)
 */
export function resolveStylesNames(payload: ResolveStylesNamesInput): readonly string[] {
  if (payload.slots) {
    const slotKeys = Object.keys(payload.slots);

    if (!payload.styling?.structure?.stylesNames) {
      return slotKeys;
    }

    // DEV: subset validation (see design doc 2.5.3)
    if (process.env.NODE_ENV !== 'production') {
      const slotKeySet = new Set(slotKeys);
      const extraNames = payload.styling.structure.stylesNames.filter(
        (name) => !slotKeySet.has(name),
      );
      if (extraNames.length > 0) {
        console.error(
          `[PrismUI] Component "${payload.displayName}" has stylesNames not present in slots: ` +
          `[${extraNames.join(', ')}]. ` +
          `Structure (slots) is the source of truth — stylesNames cannot extend it.`,
        );
      }
    }

    return payload.styling.structure.stylesNames;
  }

  return payload.styling?.structure?.stylesNames ?? [];
}
