/**
 * Merge two prop objects where keys from OverrideProps take precedence.
 *
 * This is used heavily in polymorphic component typing, where component-specific
 * props override the default element props.
 */
export type MergeProps<Props extends object = {}, OverrideProps extends object = {}> =
  OverrideProps & Omit<Props, keyof OverrideProps>;