import type { DataAttrsResolver } from '../component/data-attrs-resolver';

/**
 * sizeDataAttrs
 *
 * Produces root `data-size` from component props. No options.
 */
export const sizeDataAttrs: DataAttrsResolver<Record<string, any>> = (props) => ({
  'data-size': props.size != null ? String(props.size) : undefined,
});
