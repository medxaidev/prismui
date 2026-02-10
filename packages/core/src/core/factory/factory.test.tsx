import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { factory } from './factory';
import { polymorphicFactory } from './polymorphic-factory';
import type { Factory, PolymorphicFactory } from './create-factory';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

interface TestProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

type TestFactory = Factory<{
  props: TestProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: Record<string, never>;
  variant: string;
}>;

const TestComponent = factory<TestFactory>((props, ref) => {
  const { label, children, ...rest } = props;
  return (
    <div ref={ref} data-label={label} {...rest}>
      {children}
    </div>
  );
});
TestComponent.displayName = 'TestComponent';

// Polymorphic fixture
interface TestPolyProps {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  component?: any;
}

type TestPolyFactory = PolymorphicFactory<{
  props: TestPolyProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: 'button';
  stylesNames: 'root';
  vars: Record<string, never>;
  variant: string;
}>;

const TestPolyComponent = polymorphicFactory<TestPolyFactory>((props, ref) => {
  const { color, component, children, ...rest } = props;
  const Element = component || 'button';
  return (
    <Element ref={ref} data-color={color} {...rest}>
      {children}
    </Element>
  );
});
TestPolyComponent.displayName = 'TestPolyComponent';

// ---------------------------------------------------------------------------
// factory() tests
// ---------------------------------------------------------------------------

describe('factory', () => {
  it('wraps forwardRef and renders correctly', () => {
    const { container } = render(<TestComponent label="hello">content</TestComponent>);
    const el = container.firstChild as HTMLElement;
    expect(el.nodeName).toBe('DIV');
    expect(el.getAttribute('data-label')).toBe('hello');
    expect(el.textContent).toBe('content');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<TestComponent ref={ref}>content</TestComponent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has .extend() method', () => {
    expect(typeof TestComponent.extend).toBe('function');
  });

  it('.extend() returns the input unchanged (identity)', () => {
    const input = {
      defaultProps: { label: 'default' },
      classNames: { root: 'my-root' },
    };
    const result = TestComponent.extend(input);
    expect(result).toBe(input);
  });

  it('has .withProps() method', () => {
    expect(typeof TestComponent.withProps).toBe('function');
  });

  it('.withProps() creates component with fixed props', () => {
    const Fixed = TestComponent.withProps({ label: 'fixed' });
    const { container } = render(<Fixed>child</Fixed>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-label')).toBe('fixed');
  });

  it('.withProps() fixed props can be overridden by user props', () => {
    const Fixed = TestComponent.withProps({ label: 'fixed' });
    const { container } = render(<Fixed label="override">child</Fixed>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-label')).toBe('override');
  });

  it('.withProps() result carries .extend() from parent', () => {
    const Fixed = TestComponent.withProps({ label: 'fixed' });
    // Mantine pattern: withProps copies .extend from parent
    expect(typeof (Fixed as any).extend).toBe('function');
  });

  it('.withProps() result has displayName WithProps(...)', () => {
    const Fixed = TestComponent.withProps({ label: 'fixed' });
    expect((Fixed as any).displayName).toBe('WithProps(TestComponent)');
  });

  it('.classes is not initialized by factory (set externally by CSS Modules)', () => {
    // Mantine pattern: .classes is typed but set externally, not by factory()
    expect(TestComponent.classes).toBeUndefined();
  });

  it('has displayName', () => {
    expect(TestComponent.displayName).toBe('TestComponent');
  });
});

// ---------------------------------------------------------------------------
// polymorphicFactory() tests
// ---------------------------------------------------------------------------

describe('polymorphicFactory', () => {
  it('renders with default element', () => {
    const { container } = render(<TestPolyComponent>click</TestPolyComponent>);
    expect(container.firstChild?.nodeName).toBe('BUTTON');
  });

  it('renders with custom component prop', () => {
    const { container } = render(<TestPolyComponent component="a">link</TestPolyComponent>);
    expect(container.firstChild?.nodeName).toBe('A');
  });

  it('forwards ref to default element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<TestPolyComponent ref={ref}>click</TestPolyComponent>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('passes custom props', () => {
    const { container } = render(<TestPolyComponent color="red">click</TestPolyComponent>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-color')).toBe('red');
  });

  it('has .extend() method (identity)', () => {
    const input = { defaultProps: { color: 'blue' } };
    const result = TestPolyComponent.extend(input);
    expect(result).toBe(input);
  });

  it('.withProps() creates component with fixed props', () => {
    const Fixed = TestPolyComponent.withProps({ color: 'green' });
    const { container } = render(<Fixed>click</Fixed>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-color')).toBe('green');
  });

  it('.withProps() fixed props can be overridden', () => {
    const Fixed = TestPolyComponent.withProps({ color: 'green' });
    const { container } = render(<Fixed color="red">click</Fixed>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-color')).toBe('red');
  });

  it('.classes is not initialized by polymorphicFactory (set externally)', () => {
    expect(TestPolyComponent.classes).toBeUndefined();
  });

  it('has displayName', () => {
    expect(TestPolyComponent.displayName).toBe('TestPolyComponent');
  });
});
