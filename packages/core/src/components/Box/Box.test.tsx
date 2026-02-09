
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Box } from './Box';
import { PrismuiProvider } from '../../core/PrismuiProvider';

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

describe('@prismui/core/Box renderRoot', () => {
  it('uses renderRoot when provided', () => {
    const { container } = render(
      <Box renderRoot={(props) => <a {...props} href="/test" />}>
        link content
      </Box>
    );
    const el = container.firstChild as HTMLAnchorElement;
    expect(el.nodeName).toBe('A');
    expect(el.href).toContain('/test');
  });

  it('renderRoot receives computed styles and className', () => {
    const { container } = render(
      <Box
        className="custom"
        style={{ color: 'red' }}
        renderRoot={(props) => <span {...props} />}
      >
        content
      </Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.nodeName).toBe('SPAN');
    expect(el.className).toContain('custom');
    expect(el.style.color).toBe('red');
  });

  it('renderRoot receives ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Box
        ref={ref}
        renderRoot={(props) => <div {...props} />}
      >
        content
      </Box>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renderRoot takes precedence over component', () => {
    const { container } = render(
      <Box
        component="button"
        renderRoot={(props) => <section {...props} />}
      >
        content
      </Box>
    );
    expect(container.firstChild?.nodeName).toBe('SECTION');
  });
});

describe('@prismui/core/Box mod', () => {
  it('applies string mod as data attribute', () => {
    const { container } = render(<Box mod="loading">content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-loading')).toBe('true');
  });

  it('applies object mod as data attributes', () => {
    const { container } = render(
      <Box mod={{ loading: true, size: 'lg' }}>content</Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-loading')).toBe('true');
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('filters falsy mod values', () => {
    const { container } = render(
      <Box mod={{ loading: true, disabled: false, hidden: undefined }}>
        content
      </Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-loading')).toBe('true');
    expect(el.hasAttribute('data-disabled')).toBe(false);
    expect(el.hasAttribute('data-hidden')).toBe(false);
  });

  it('applies array of mods', () => {
    const { container } = render(
      <Box mod={[{ loading: true }, 'active']}>content</Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-loading')).toBe('true');
    expect(el.getAttribute('data-active')).toBe('true');
  });

  it('does not add attributes when mod is undefined', () => {
    const { container } = render(<Box>content</Box>);
    const el = container.firstChild as HTMLElement;
    const dataAttrs = Array.from(el.attributes).filter(
      (a) => a.name.startsWith('data-')
    );
    expect(dataAttrs).toHaveLength(0);
  });
});

describe('@prismui/core/Box variant and size', () => {
  it('sets data-variant attribute', () => {
    const { container } = render(
      <Box variant="filled">content</Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-variant')).toBe('filled');
  });

  it('sets data-size for string size', () => {
    const { container } = render(
      <Box size="lg">content</Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('does not set data-size for number size', () => {
    const { container } = render(
      <Box size={24}>content</Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.hasAttribute('data-size')).toBe(false);
  });

  it('does not set data-variant when not provided', () => {
    const { container } = render(<Box>content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.hasAttribute('data-variant')).toBe(false);
  });
});

describe('@prismui/core/Box usePrismuiContext', () => {
  it('works without a provider (uses defaultTheme)', () => {
    const { container } = render(<Box m={2}>content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.margin).toBeTruthy();
  });

  it('works with a provider', () => {
    const { container } = render(
      <PrismuiProvider>
        <Box m={2}>content</Box>
      </PrismuiProvider>
    );
    const el = container.querySelector('div div') as HTMLElement;
    expect(el.style.margin).toBeTruthy();
  });
});
