import React from 'react';
import {
  factory,
  useProps,
  useStyles,
  createVarsResolver,
} from '../../core/factory';
import type {
  Factory,
  StylesApiProps,
} from '../../core/factory';
import type { BoxProps, ElementProps } from '../Box';
import { Box } from '../Box';
import { ButtonBase } from '../ButtonBase';
import { CloseIcon } from '../../icons/CloseIcon';
import { InfoIcon } from '../../icons/InfoIcon';
import { SuccessIcon } from '../../icons/SuccessIcon';
import { WarningIcon } from '../../icons/WarningIcon';
import { ErrorIcon } from '../../icons/ErrorIcon';
import { getRadius } from '../../core/theme/get-radius';
import { getThemeColor } from '../../core/theme/get-theme-color';
import type { PrismuiRadius } from '../../core/theme/types';
import classes from './Alert.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertStylesNames =
  | 'root'
  | 'wrapper'
  | 'icon'
  | 'body'
  | 'title'
  | 'description'
  | 'actions'
  | 'closeButton';

export type AlertVariant = 'solid' | 'soft' | 'outlined' | 'plain';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export type AlertCssVariables = {
  root:
  | '--alert-radius'
  | '--alert-bg'
  | '--alert-color'
  | '--alert-bd'
  | '--alert-icon-color';
};

export interface AlertProps
  extends BoxProps,
  StylesApiProps<AlertFactory>,
  ElementProps<'div', 'title'> {
  /** Alert variant @default 'soft' */
  variant?: AlertVariant;

  /**
   * Semantic severity — determines default icon and maps to theme color.
   * - `'info'` → info color
   * - `'success'` → success color
   * - `'warning'` → warning color
   * - `'error'` → error color
   * @default 'info'
   */
  severity?: AlertSeverity;

  /**
   * Color override. Supports semantic keys (primary, secondary, info, success, warning, error),
   * color family names (blue, red), or CSS colors.
   * When not set, derived from `severity`.
   */
  color?: string;

  /** Alert title */
  title?: React.ReactNode;

  /** Alert description (rendered below title) */
  description?: React.ReactNode;

  /** Custom icon. Set to `false` to hide the default severity icon. */
  icon?: React.ReactNode | false;

  /** Action buttons or links rendered below description */
  actions?: React.ReactNode;

  /** Show close button @default false */
  withCloseButton?: boolean;

  /** Called when close button is clicked */
  onClose?: () => void;

  /** Close button aria-label @default 'Close' */
  closeButtonLabel?: string;

  /** Border radius @default 'md' */
  radius?: PrismuiRadius;
}

export type AlertFactory = Factory<{
  props: AlertProps;
  ref: HTMLDivElement;
  stylesNames: AlertStylesNames;
  vars: AlertCssVariables;
  variant: AlertVariant;
}>;

// ---------------------------------------------------------------------------
// Severity → color mapping
// ---------------------------------------------------------------------------

const SEVERITY_COLOR_MAP: Record<AlertSeverity, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

// ---------------------------------------------------------------------------
// Severity → default icon mapping
// ---------------------------------------------------------------------------

const SEVERITY_ICON_MAP: Record<AlertSeverity, React.ReactElement> = {
  info: <InfoIcon size={24} />,
  success: <SuccessIcon size={24} />,
  warning: <WarningIcon size={24} />,
  error: <ErrorIcon size={24} />,
};

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  variant: 'soft',
  severity: 'info',
} satisfies Partial<AlertProps>;

const varsResolver = createVarsResolver<AlertFactory>(
  (theme, { radius, color, severity, variant }) => {
    const resolvedColor = color || SEVERITY_COLOR_MAP[severity || 'info'];
    const resolvedVariant = variant || 'soft';

    // For soft variant, use lighter/darker CSS variables directly
    if (resolvedVariant === 'soft') {
      const bg = `var(--prismui-${resolvedColor}-lighter)`;
      const textColor = `var(--prismui-${resolvedColor}-darker)`;
      const iconColor = `var(--prismui-${resolvedColor}-main)`;

      return {
        root: {
          '--alert-radius': radius === undefined ? undefined : getRadius(radius),
          '--alert-bg': bg,
          '--alert-color': textColor,
          '--alert-bd': 'transparent',
          '--alert-icon-color': iconColor,
        },
      };
    }

    // For outlined variant, use mainChannel with opacity
    if (resolvedVariant === 'outlined') {
      const bg = `rgba(var(--prismui-${resolvedColor}-mainChannel) / 8%)`;
      const border = `rgba(var(--prismui-${resolvedColor}-mainChannel) / 16%)`;
      const textColor = `var(--prismui-${resolvedColor}-darker)`;
      const iconColor = `var(--prismui-${resolvedColor}-main)`;

      return {
        root: {
          '--alert-radius': radius === undefined ? undefined : getRadius(radius),
          '--alert-bg': bg,
          '--alert-color': textColor,
          '--alert-bd': border,
          '--alert-icon-color': iconColor,
        },
      };
    }

    // For solid and plain variants, use variantColorResolver
    const colors = theme.variantColorResolver({
      color: resolvedColor,
      theme,
      variant: resolvedVariant,
      scheme: 'light',
    });

    const iconColor = resolvedVariant === 'solid'
      ? colors.color
      : getThemeColor(resolvedColor, theme);

    return {
      root: {
        '--alert-radius': radius === undefined ? undefined : getRadius(radius),
        '--alert-bg': colors.background,
        '--alert-color': colors.color,
        '--alert-bd': 'transparent',
        '--alert-icon-color': iconColor || undefined,
      },
    };
  },
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Alert = factory<AlertFactory>((_props, ref) => {
  const props = useProps('Alert', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    variant,
    severity,
    color,
    title,
    description,
    icon,
    actions,
    withCloseButton,
    onClose,
    closeButtonLabel,
    radius,
    children,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<AlertFactory>({
    name: 'Alert',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  // Resolve icon: custom icon, false to hide, or default severity icon
  const resolvedIcon =
    icon === false
      ? null
      : icon || SEVERITY_ICON_MAP[severity || 'info'];

  return (
    <Box
      ref={ref}
      {...getStyles('root', { variant })}
      variant={variant}
      role="alert"
      mod={[{ severity }, mod]}
      {...others}
    >
      <div {...getStyles('wrapper')}>
        {resolvedIcon && (
          <div {...getStyles('icon')}>{resolvedIcon}</div>
        )}

        <div {...getStyles('body')}>
          {title && (
            <div
              {...getStyles('title')}
              data-with-close-button={withCloseButton || undefined}
            >
              {title}
            </div>
          )}

          {description && (
            <div {...getStyles('description')}>{description}</div>
          )}

          {children && (
            <div {...getStyles('description')}>{children}</div>
          )}

          {actions && (
            <div {...getStyles('actions')}>{actions}</div>
          )}
        </div>

        {withCloseButton && (
          <ButtonBase
            {...getStyles('closeButton')}
            onClick={onClose}
            aria-label={closeButtonLabel || 'Close'}
            __staticSelector="Alert"
            disableRipple
          >
            <CloseIcon size={20} />
          </ButtonBase>
        )}
      </div>
    </Box>
  );
});

Alert.classes = classes;
Alert.displayName = '@prismui/core/Alert';
