import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders children', () => {
    render(<AuthLayout><div data-testid="card">Login</div></AuthLayout>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('forwards ref to root', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AuthLayout ref={ref}>Content</AuthLayout>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has correct displayName', () => {
    expect(AuthLayout.displayName).toBe('@prismui/core/AuthLayout');
  });

  it('applies custom className', () => {
    render(<AuthLayout data-testid="auth" className="my-auth">C</AuthLayout>);
    expect(screen.getByTestId('auth')).toHaveClass('my-auth');
  });

  it('passes through additional props', () => {
    render(<AuthLayout data-testid="auth" id="auth-page">C</AuthLayout>);
    expect(screen.getByTestId('auth')).toHaveAttribute('id', 'auth-page');
  });
});
