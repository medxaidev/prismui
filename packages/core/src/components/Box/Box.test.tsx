
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Box } from './Box';

describe('@prismui/core/Box polymorphic', () => {
  it('renders a div by default', () => {
    const { container } = render(<Box>content</Box>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('applies className', () => {
    const { container } = render(<Box className="test-class">content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('test-class');
  });

  it('applies style', () => {
    const { container } = render(<Box style={{ color: 'red' }}>content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.color).toBe('red');
  });

  it('renders the element specified by component', () => {
    const { container } = render(<Box component="button">click</Box>);
    expect(container.firstChild?.nodeName).toBe('BUTTON');
  });

  it('forwards ref to default element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Box ref={ref}>content</Box>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref to polymorphic element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Box component="button" ref={ref}>
        click
      </Box>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('passes native props based on component type', () => {
    const { container } = render(
      <Box component="a" href="https://example.com" target="_blank">
        link
      </Box>
    );

    const anchor = container.firstChild as HTMLAnchorElement;
    expect(anchor.nodeName).toBe('A');
    expect(anchor.href).toBe('https://example.com/');
    expect(anchor.target).toBe('_blank');
  });

  it('passes through native HTML attributes', () => {
    const { container } = render(
      <Box id="box-id" data-testid="box-test">
        content
      </Box>
    );

    const el = container.firstChild as HTMLElement;
    expect(el.id).toBe('box-id');
    expect(el.getAttribute('data-testid')).toBe('box-test');
  });
});

describe('@prismui/core/Box type inference', () => {
  it('infers intrinsic element props from component', () => {
    // @ts-expect-error href is not valid on default div
    <Box href="x" />;

    <Box component="a" href="x" />;

    // @ts-expect-error type is not valid on default div
    <Box type="submit" />;

    <Box component="button" type="submit" />;
  });

  it('infers ref type from component', () => {
    const divRef = createRef<HTMLDivElement>();
    const buttonRef = createRef<HTMLButtonElement>();

    <Box ref={divRef} />;
    <Box component="button" ref={buttonRef} />;

    // @ts-expect-error wrong ref type for default div
    <Box ref={buttonRef} />;

    // @ts-expect-error wrong ref type for button
    <Box component="button" ref={divRef} />;
  });
});

