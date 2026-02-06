import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createStyleRegistry } from './style-registry';
import { StyleRegistryProvider, useStyleRegistry } from './StyleRegistryProvider';

function RegistryConsumer() {
  const registry = useStyleRegistry();
  return <div data-testid="result">{registry ? 'has-registry' : 'no-registry'}</div>;
}

describe('StyleRegistryProvider', () => {
  it('provides registry to children via context', () => {
    const registry = createStyleRegistry();
    const { getByTestId } = render(
      <StyleRegistryProvider registry={registry}>
        <RegistryConsumer />
      </StyleRegistryProvider>,
    );
    expect(getByTestId('result').textContent).toBe('has-registry');
  });

  it('provides the same registry instance', () => {
    const registry = createStyleRegistry();
    let captured: ReturnType<typeof useStyleRegistry> = null;

    function Capture() {
      captured = useStyleRegistry();
      return null;
    }

    render(
      <StyleRegistryProvider registry={registry}>
        <Capture />
      </StyleRegistryProvider>,
    );

    expect(captured).toBe(registry);
  });
});

describe('useStyleRegistry', () => {
  it('returns null when no provider is present', () => {
    const { getByTestId } = render(<RegistryConsumer />);
    expect(getByTestId('result').textContent).toBe('no-registry');
  });
});
