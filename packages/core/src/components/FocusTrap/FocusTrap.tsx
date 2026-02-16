import { cloneElement } from 'react';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useMergedRef } from '../../hooks/use-merged-ref';
import { getSingleElementChild } from '../../utils/get-single-element-child/get-single-element-child';
import { VisuallyHidden } from '../VisuallyHidden';
import type { VisuallyHiddenProps } from '../VisuallyHidden';

export interface FocusTrapProps {
  /** Element to trap focus at, must support ref prop */
  children: any;

  /** If set to `false`, disables focus trap @default true */
  active?: boolean;

  /** Prop that is used to access element ref @default 'ref' */
  refProp?: string;

  /** Ref to combine with the focus trap ref */
  innerRef?: React.ForwardedRef<any>;
}

export function FocusTrap({
  children,
  active = true,
  refProp = 'ref',
  innerRef,
}: FocusTrapProps): React.ReactElement {
  const focusTrapRef = useFocusTrap(active);
  const ref = useMergedRef(focusTrapRef, innerRef);

  const child = getSingleElementChild(children);
  if (!child) {
    return children;
  }

  return cloneElement(child, { [refProp]: ref });
}

export function FocusTrapInitialFocus(props: Omit<VisuallyHiddenProps, 'tabIndex'>) {
  return <VisuallyHidden tabIndex={-1} data-autofocus {...props} />;
}

FocusTrap.displayName = '@prismui/core/FocusTrap';
FocusTrapInitialFocus.displayName = '@prismui/core/FocusTrapInitialFocus';
FocusTrap.InitialFocus = FocusTrapInitialFocus;
