import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useComponentDefaultProps } from './use-component-default-props';
import { PrismUIProvider } from '../theme/provider/PrismUIProvider';
import { createTheme, deepMerge } from '../theme/create-theme';
import { factory } from './factory';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * A minimal component that exposes resolved props via a data attribute.
 * Used to verify that useComponentDefaultProps resolves correctly.
 */
function PropsReadout({
  componentName,
  props,
  testId = 'readout',
}: {
  componentName: string;
  props: Record<string, any>;
  testId?: string;
}) {
  const resolved = useComponentDefaultProps(componentName, props);
  return (
    <div
      data-testid={testId}
      data-resolved={JSON.stringify(resolved)}
    />
  );
}

function getResolved(element: HTMLElement): Record<string, any> {
  return JSON.parse(element.getAttribute('data-resolved')!);
}

// ─────────────────────────────────────────────────────────────────
// mergeWithDefaults behaviour (via useComponentDefaultProps)
// ─────────────────────────────────────────────────────────────────

describe('mergeWithDefaults (via useComponentDefaultProps)', () => {
  it('returns props unchanged when no theme components configured', () => {
    const { getByTestId } = render(
      <PropsReadout componentName="Test" props={{ size: 'md' }} />,
    );
    expect(getResolved(getByTestId('readout'))).toEqual({ size: 'md' });
  });

  it('fills in defaults for keys not provided in props', () => {
    const theme = createTheme({
      components: { Test: { defaultProps: { size: 'lg', variant: 'filled' } } },
    });
    const { getByTestId } = render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Test" props={{}} />
      </PrismUIProvider>,
    );
    const resolved = getResolved(getByTestId('readout'));
    expect(resolved.size).toBe('lg');
    expect(resolved.variant).toBe('filled');
  });

  it('user-provided value overrides defaultProps', () => {
    const theme = createTheme({
      components: { Test: { defaultProps: { size: 'lg' } } },
    });
    const { getByTestId } = render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Test" props={{ size: 'sm' }} />
      </PrismUIProvider>,
    );
    expect(getResolved(getByTestId('readout')).size).toBe('sm');
  });

  it('undefined is treated as "not passed" — defaultProps applies (core behaviour)', () => {
    const theme = createTheme({
      components: { Test: { defaultProps: { size: 'lg' } } },
    });
    const { getByTestId } = render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Test" props={{ size: undefined }} />
      </PrismUIProvider>,
    );
    expect(getResolved(getByTestId('readout')).size).toBe('lg');
  });

  it('null is treated as explicit clear — null applies (not defaultProps)', () => {
    const theme = createTheme({
      components: { Test: { defaultProps: { size: 'lg' } } },
    });
    const { getByTestId } = render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Test" props={{ size: null }} />
      </PrismUIProvider>,
    );
    expect(getResolved(getByTestId('readout')).size).toBeNull();
  });

  it('referential stability: returns original props object when no defaults need applying', () => {
    const theme = createTheme({
      components: { Test: { defaultProps: { size: 'lg' } } },
    });
    // Capture the identity inside a component
    let inputRef: any;
    let outputRef: any;

    function IdentityCheck() {
      const input = React.useMemo(() => ({ size: 'sm' }), []);
      inputRef = input;
      const resolved = useComponentDefaultProps('Test', input);
      outputRef = resolved;
      return null;
    }

    render(
      <PrismUIProvider theme={theme}>
        <IdentityCheck />
      </PrismUIProvider>,
    );

    // size='sm' provided → no default needed → same object
    expect(outputRef).toBe(inputRef);
  });

  it('referential stability: returns new object when a default must be applied', () => {
    const theme = createTheme({
      components: { Test: { defaultProps: { size: 'lg' } } },
    });
    let inputRef: any;
    let outputRef: any;

    function IdentityCheck() {
      const input = React.useMemo(() => ({ variant: 'outline' }), []);
      inputRef = input;
      const resolved = useComponentDefaultProps('Test', input);
      outputRef = resolved;
      return null;
    }

    render(
      <PrismUIProvider theme={theme}>
        <IdentityCheck />
      </PrismUIProvider>,
    );

    // size missing → new object
    expect(outputRef).not.toBe(inputRef);
    expect(outputRef.size).toBe('lg');
    expect(outputRef.variant).toBe('outline');
  });

  it('looks up by componentName, not displayName', () => {
    const theme = createTheme({
      components: {
        StableKey: { defaultProps: { size: 'xl' } },
      },
    });
    const { getByTestId } = render(
      <PrismUIProvider theme={theme}>
        {/* componentName = 'StableKey', not 'DisplayLabel' */}
        <PropsReadout componentName="StableKey" props={{}} />
      </PrismUIProvider>,
    );
    expect(getResolved(getByTestId('readout')).size).toBe('xl');
  });

  it('multiple components defaultProps are independent', () => {
    const theme = createTheme({
      components: {
        Button: { defaultProps: { size: 'lg' } },
        Badge: { defaultProps: { size: 'xs' } },
      },
    });
    const { getByTestId } = render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Button" props={{}} testId="btn" />
        <PropsReadout componentName="Badge" props={{}} testId="bdg" />
      </PrismUIProvider>,
    );
    expect(getResolved(getByTestId('btn')).size).toBe('lg');
    expect(getResolved(getByTestId('bdg')).size).toBe('xs');
  });

  it('works without PrismUIProvider (returns props unchanged)', () => {
    const { getByTestId } = render(
      <PropsReadout componentName="Test" props={{ size: 'md' }} />,
    );
    expect(getResolved(getByTestId('readout'))).toEqual({ size: 'md' });
  });
});

// ─────────────────────────────────────────────────────────────────
// DEV warnings
// ─────────────────────────────────────────────────────────────────

describe('useComponentDefaultProps — DEV warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('[dev] warns when defaultProps contains "styles"', () => {
    const theme = createTheme({
      components: {
        Test: {
          defaultProps: { styles: { root: { color: 'red' } } } as any,
        },
      },
    });
    render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Test" props={{}} />
      </PrismUIProvider>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Do not use "styles" or "classNames"'),
    );
  });

  it('[dev] warns when defaultProps contains "classNames"', () => {
    const theme = createTheme({
      components: {
        Test: {
          defaultProps: { classNames: { root: 'foo' } } as any,
        },
      },
    });
    render(
      <PrismUIProvider theme={theme}>
        <PropsReadout componentName="Test" props={{}} />
      </PrismUIProvider>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Do not use "styles" or "classNames"'),
    );
  });
});

// ─────────────────────────────────────────────────────────────────
// factory integration
// ─────────────────────────────────────────────────────────────────

describe('factory + theme defaultProps (integration)', () => {
  const stylesNames = ['root'] as const;
  const classes = { root: 'root-class' };

  const TestButton = factory(
    {
      displayName: 'TestButton',
      componentName: 'TestButton',
      defaultElement: 'button',
      componentPropKeys: ['size', 'variant'] as const,
      styling: {
        structure: { stylesNames },
        resources: { classes },
      },
    },
    ({ Element, ref, domProps, componentProps }) => (
      <Element
        ref={ref}
        data-size={componentProps.size ?? 'none'}
        data-variant={componentProps.variant ?? 'none'}
        {...domProps}
      />
    ),
  );

  it('<TestButton> without props uses theme defaultProps', () => {
    const theme = createTheme({
      components: { TestButton: { defaultProps: { size: 'lg', variant: 'filled' } } },
    });
    const { getByRole } = render(
      <PrismUIProvider theme={theme}>
        <TestButton />
      </PrismUIProvider>,
    );
    const btn = getByRole('button');
    expect(btn.getAttribute('data-size')).toBe('lg');
    expect(btn.getAttribute('data-variant')).toBe('filled');
  });

  it('<TestButton size="sm"> overrides theme defaultProps', () => {
    const theme = createTheme({
      components: { TestButton: { defaultProps: { size: 'lg' } } },
    });
    const { getByRole } = render(
      <PrismUIProvider theme={theme}>
        <TestButton size="sm" />
      </PrismUIProvider>,
    );
    expect(getByRole('button').getAttribute('data-size')).toBe('sm');
  });

  it('<TestButton size={undefined}> falls back to theme defaultProps', () => {
    const theme = createTheme({
      components: { TestButton: { defaultProps: { size: 'lg' } } },
    });
    const { getByRole } = render(
      <PrismUIProvider theme={theme}>
        <TestButton size={undefined} />
      </PrismUIProvider>,
    );
    expect(getByRole('button').getAttribute('data-size')).toBe('lg');
  });
});

// ─────────────────────────────────────────────────────────────────
// createTheme components merge
// ─────────────────────────────────────────────────────────────────

describe('createTheme components merge', () => {
  it('merges components into theme correctly', () => {
    const theme = createTheme({
      components: {
        Button: { defaultProps: { size: 'lg', variant: 'filled' } },
      },
    });
    expect(theme.components?.Button?.defaultProps?.size).toBe('lg');
    expect(theme.components?.Button?.defaultProps?.variant).toBe('filled');
  });

  it('two createTheme overrides accumulate via deepMerge', () => {
    const base = createTheme({
      components: { Button: { defaultProps: { size: 'lg' } } },
    });
    const extended = deepMerge(base, {
      components: { Button: { defaultProps: { variant: 'outline' } } },
    });
    // deepMerge should preserve size and add variant
    expect(extended.components?.Button?.defaultProps?.size).toBe('lg');
    expect(extended.components?.Button?.defaultProps?.variant).toBe('outline');
  });
});
