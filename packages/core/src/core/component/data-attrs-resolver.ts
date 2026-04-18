/**
 * DataAttrsResolver — Stage 3 Step 10 §5.2
 *
 * A stateless function that derives root `data-*` attributes from resolved
 * component props (+ optional system-level options). Mirrors {@link VarsResolver}
 * but for the DOM attribute channel.
 *
 * Systems (`variant` / `size` / `state` / future) each export one resolver.
 * Factory collects their outputs and spreads them onto the root element in
 * a fixed priority order (see §5.3). Component render MUST NOT re-declare
 * the keys a resolver produces (see §6.2).
 */
export type DataAttrsResolver<
  Props extends Record<string, any> = Record<string, any>,
  Options = void,
> = (props: Props, options?: Options) => Record<string, string | undefined>;

/**
 * Utility: remove entries whose value is `undefined`.
 *
 * Boolean system attrs follow the "presence = true, absence = false"
 * convention (§5.6 F-3), so undefined keys must be stripped before spread.
 */
export function pruneUndefined(
  input: Record<string, string | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key in input) {
    const val = input[key];
    if (val !== undefined) out[key] = val;
  }
  return out;
}
