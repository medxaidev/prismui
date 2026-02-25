import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('renders root, header, and main', () => {
    render(
      <MainLayout data-testid="ml-root">
        <MainLayout.Header data-testid="ml-header">Header</MainLayout.Header>
        <MainLayout.Main data-testid="ml-main">Content</MainLayout.Main>
      </MainLayout>,
    );
    expect(screen.getByTestId('ml-root')).toBeInTheDocument();
    expect(screen.getByTestId('ml-header')).toBeInTheDocument();
    expect(screen.getByTestId('ml-main')).toBeInTheDocument();
  });

  it('forwards ref to root', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <MainLayout ref={ref}>
        <MainLayout.Main>C</MainLayout.Main>
      </MainLayout>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has correct displayName', () => {
    expect(MainLayout.displayName).toBe('@prismui/core/MainLayout');
  });

  it('exposes compound components', () => {
    expect(MainLayout.Header).toBeDefined();
    expect(MainLayout.Main).toBeDefined();
  });

  it('sets --ml-header-height CSS variable', () => {
    render(
      <MainLayout data-testid="ml-root" header={{ height: 80 }}>
        <MainLayout.Main>C</MainLayout.Main>
      </MainLayout>,
    );
    expect(screen.getByTestId('ml-root').style.getPropertyValue('--ml-header-height')).toBe('80px');
  });

  it('defaults header height to 64px', () => {
    render(
      <MainLayout data-testid="ml-root">
        <MainLayout.Main>C</MainLayout.Main>
      </MainLayout>,
    );
    expect(screen.getByTestId('ml-root').style.getPropertyValue('--ml-header-height')).toBe('64px');
  });

  it('sets data-with-border on header by default', () => {
    render(
      <MainLayout>
        <MainLayout.Header data-testid="ml-header">H</MainLayout.Header>
        <MainLayout.Main>C</MainLayout.Main>
      </MainLayout>,
    );
    expect(screen.getByTestId('ml-header')).toHaveAttribute('data-with-border', 'true');
  });

  it('removes border when withBorder=false', () => {
    render(
      <MainLayout withBorder={false}>
        <MainLayout.Header data-testid="ml-header">H</MainLayout.Header>
        <MainLayout.Main>C</MainLayout.Main>
      </MainLayout>,
    );
    expect(screen.getByTestId('ml-header')).not.toHaveAttribute('data-with-border');
  });

  it('applies custom className', () => {
    render(
      <MainLayout data-testid="ml-root" className="my-main">
        <MainLayout.Main>C</MainLayout.Main>
      </MainLayout>,
    );
    expect(screen.getByTestId('ml-root')).toHaveClass('my-main');
  });

  it('throws when Header is used outside MainLayout', () => {
    expect(() => {
      render(<MainLayout.Header>H</MainLayout.Header>);
    }).toThrow('[PrismUI]');
  });
});
