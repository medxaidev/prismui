import type { SystemProps } from '../system-props.types';
import { omitUndefinedProps } from '../../../utils';
import { SYSTEM_CONFIG } from '../system-config';

/**
 * Splits incoming component props into:
 * - `styleProps`: the subset of PrismUI system props
 * - `rest`: all remaining props that should be forwarded to the underlying element
 */
export function splitSystemProps<Props extends Record<string, any>>(
  props: Props
): {
  styleProps: Partial<SystemProps>;
  rest: Omit<Props, keyof SystemProps>;
} {
  const input = props as Props & SystemProps;

  const systemKeys = Object.keys(SYSTEM_CONFIG) as Array<keyof SystemProps>;

  const styleProps: Partial<SystemProps> = {};
  const rest: Record<string, any> = { ...props };

  for (const key of systemKeys) {
    const v = input[key];
    if (v !== undefined) {
      (styleProps as any)[key] = v;
      delete rest[key as any];
    }
  }

  return {
    styleProps: omitUndefinedProps(styleProps),
    rest: rest as Omit<Props, keyof SystemProps>,
  };
}
