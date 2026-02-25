'use client';

import React, { forwardRef } from 'react';
import classes from './AuthLayout.module.css';

export interface AuthLayoutProps extends React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

/**
 * Centered authentication layout for login/register/forgot-password pages.
 * Simply centers its children both vertically and horizontally.
 */
export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(
  function AuthLayout({ children, className, ...others }, ref) {
    const rootClassName = [classes.root, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={rootClassName} {...others}>
        {children}
      </div>
    );
  },
);

AuthLayout.displayName = '@prismui/core/AuthLayout';
