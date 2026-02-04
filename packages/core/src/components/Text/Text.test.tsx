import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Text } from './Text';

describe('@prismui/core/Text polymorphic', () => {
  it('renders a span by default', () => {
    const { container } = render(<Text>content</Text>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('renders the element specified by component', () => {
    const { container } = render(<Text component="a" href="/test">link</Text>);
    expect(container.firstChild?.nodeName).toBe('A');
  });

  it('forwards ref to default element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Text ref={ref}>content</Text>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('applies className and style', () => {
    const { container } = render(
      <Text className="text-class" style={{ color: 'red' }}>
        content
      </Text>
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('text-class');
    expect(el.style.color).toBe('red');
  });
});

describe('@prismui/core/Text type inference', () => {
  it('infers intrinsic element props from component', () => {
    // @ts-expect-error href is not valid on default span
    <Text href="x" />;

    <Text component="a" href="x" />;

    // @ts-expect-error type is not valid on default span
    <Text type="submit" />;

    <Text component="button" type="submit" />;
  });
});
