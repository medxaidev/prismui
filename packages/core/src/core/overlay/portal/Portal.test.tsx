/**
 * Stage-11 · L0 Overlay Foundation · `Portal` component tests
 *
 * Contract: `@/devdocs/system/portal-primitive.md` §10 (P-1 ~ P-4 + secondary)
 *
 * Coverage:
 *   · P-1 SSR — Portal renders nothing on server; mount effect attaches post-hydrate
 *   · P-2 container variation — A → B switch; Element ↔ DocumentFragment; → undefined
 *   · P-3 unmount — DOM removed; Portal does NOT removeChild custom container
 *   · P-4 no-document — renderToString does not throw; returns empty subtree
 *   · Secondary — context propagation across portal (OV-PORTAL-3 regression guard)
 *   · Secondary — render semantics (no wrapper, no ref, no className)
 */

import React from 'react';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';

import { Portal } from './Portal';
import { OverlayProvider } from './OverlayProvider';

// ─────────────────────────────────────────────────────────────
// P-1 · SSR safety (OV-PORTAL-2)
// ─────────────────────────────────────────────────────────────

describe('Portal · P-1 · SSR safety', () => {
  it('renderToString outputs empty string for portal subtree', () => {
    const html = renderToString(
      <Portal>
        <span data-testid="marker">hello</span>
      </Portal>,
    );
    expect(html).not.toContain('marker');
    expect(html).not.toContain('hello');
  });

  it('renderToString does not throw without a container', () => {
    expect(() =>
      renderToString(
        <Portal>
          <div>x</div>
        </Portal>,
      ),
    ).not.toThrow();
  });

  it('mount effect attaches subtree after first commit', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    render(
      <Portal container={target}>
        <span data-testid="marker">post-mount</span>
      </Portal>,
    );

    // Post-commit: marker has been ported into target.
    expect(target.querySelector('[data-testid="marker"]')).not.toBeNull();
    expect(target.querySelector('[data-testid="marker"]')?.textContent).toBe('post-mount');

    document.body.removeChild(target);
  });
});

// ─────────────────────────────────────────────────────────────
// P-2 · container variation (OV-PORTAL-1)
// ─────────────────────────────────────────────────────────────

describe('Portal · P-2 · container variation', () => {
  it('switching container A → B re-mounts subtree to B; A becomes empty', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.append(a, b);

    function App({ target }: { target: Element }) {
      return (
        <Portal container={target}>
          <span data-testid="marker">x</span>
        </Portal>
      );
    }

    const { rerender } = render(<App target={a} />);
    expect(a.querySelectorAll('[data-testid="marker"]').length).toBe(1);
    expect(b.querySelectorAll('[data-testid="marker"]').length).toBe(0);

    rerender(<App target={b} />);
    expect(a.querySelectorAll('[data-testid="marker"]').length).toBe(0);
    expect(b.querySelectorAll('[data-testid="marker"]').length).toBe(1);

    document.body.removeChild(a);
    document.body.removeChild(b);
  });

  it('switching from Element to DocumentFragment works (covers ShadowRoot subtype)', () => {
    const elt = document.createElement('div');
    document.body.appendChild(elt);
    const fragment = document.createDocumentFragment();

    function App({ target }: { target: Element | DocumentFragment }) {
      return (
        <Portal container={target}>
          <span data-testid="marker">x</span>
        </Portal>
      );
    }

    const { rerender } = render(<App target={elt} />);
    expect(elt.querySelectorAll('[data-testid="marker"]').length).toBe(1);

    rerender(<App target={fragment} />);
    expect(elt.querySelectorAll('[data-testid="marker"]').length).toBe(0);
    // DocumentFragment.querySelector works.
    expect(fragment.querySelector('[data-testid="marker"]')).not.toBeNull();

    document.body.removeChild(elt);
  });

  it('switching container to undefined falls back to document.body', () => {
    const target = document.createElement('div');
    target.setAttribute('data-test-target', 'true');
    document.body.appendChild(target);

    function App({ container }: { container?: Element }) {
      return (
        <Portal container={container}>
          <span data-testid="marker">x</span>
        </Portal>
      );
    }

    const { rerender } = render(<App container={target} />);
    expect(target.querySelectorAll('[data-testid="marker"]').length).toBe(1);

    rerender(<App container={undefined} />);
    // Marker now lives directly under document.body (not under our test target).
    expect(target.querySelectorAll('[data-testid="marker"]').length).toBe(0);
    const stray = Array.from(document.body.children).filter(
      (el) => !el.hasAttribute('data-test-target'),
    );
    const found = stray.some((el) => el.querySelector('[data-testid="marker"]'));
    // Either marker is a direct child of body, or inside a sibling.
    expect(
      found || document.body.querySelector('[data-testid="marker"]') != null,
    ).toBe(true);

    document.body.removeChild(target);
  });
});

// ─────────────────────────────────────────────────────────────
// P-3 · unmount semantics (OV-PORTAL-4)
// ─────────────────────────────────────────────────────────────

describe('Portal · P-3 · unmount semantics', () => {
  it('unmount removes ported subtree from container', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const { unmount } = render(
      <Portal container={target}>
        <span data-testid="marker">x</span>
      </Portal>,
    );
    expect(target.querySelector('[data-testid="marker"]')).not.toBeNull();

    unmount();
    expect(target.querySelector('[data-testid="marker"]')).toBeNull();

    document.body.removeChild(target);
  });

  it('Portal does NOT remove the user-owned container itself', () => {
    const target = document.createElement('div');
    target.setAttribute('data-owned', 'true');
    document.body.appendChild(target);

    const { unmount } = render(
      <Portal container={target}>
        <span>x</span>
      </Portal>,
    );

    unmount();
    // Container lifecycle belongs to the consumer; Portal must leave it intact.
    expect(target.parentNode).toBe(document.body);
    expect(document.querySelector('[data-owned="true"]')).toBe(target);

    document.body.removeChild(target);
  });

  it('rapid mount/unmount/mount sequence does not leak DOM', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    for (let i = 0; i < 5; i++) {
      const { unmount } = render(
        <Portal container={target}>
          <span data-testid="marker">{i}</span>
        </Portal>,
      );
      expect(target.querySelectorAll('[data-testid="marker"]').length).toBe(1);
      unmount();
      expect(target.querySelectorAll('[data-testid="marker"]').length).toBe(0);
    }

    document.body.removeChild(target);
  });
});

// ─────────────────────────────────────────────────────────────
// P-4 · no-document environment safety (OV-PORTAL-2)
// ─────────────────────────────────────────────────────────────

describe('Portal · P-4 · no-document environment safety', () => {
  it('renderToString in pure SSR (no document touch) outputs empty', () => {
    // react-dom/server does NOT invoke effects · Portal returns null.
    const html = renderToString(
      <Portal>
        <span>should not appear</span>
      </Portal>,
    );
    expect(html).toBe('');
  });

  it('renderToString does not access document.body', () => {
    // If the hook inadvertently touched document during render, jsdom would still
    // have it; but the contract guarantees no touch on the SSR path. We assert
    // empty output as a proxy for "no DOM side effects".
    const html = renderToString(
      <OverlayProvider container={() => null}>
        <Portal>
          <span>x</span>
        </Portal>
      </OverlayProvider>,
    );
    expect(html).toBe('');
  });

  it('repeated mount/unmount in jsdom does not pollute global state', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    for (let i = 0; i < 3; i++) {
      const { unmount } = render(
        <Portal container={target}>
          <span>{i}</span>
        </Portal>,
      );
      unmount();
    }

    // No orphan, no leftover listeners (Portal attaches none anyway).
    expect(target.children.length).toBe(0);
    document.body.removeChild(target);
  });
});

// ─────────────────────────────────────────────────────────────
// Secondary · OV-PORTAL-3 regression guard (context propagation)
// ─────────────────────────────────────────────────────────────

describe('Portal · OV-PORTAL-3 regression guard · context propagation', () => {
  it('children read React Context provided by parent tree across portal', () => {
    const ThemeContext = React.createContext<string>('default');
    const target = document.createElement('div');
    document.body.appendChild(target);

    function Probe() {
      const value = React.useContext(ThemeContext);
      return <span data-testid="theme">{value}</span>;
    }

    render(
      <ThemeContext.Provider value="dark">
        <Portal container={target}>
          <Probe />
        </Portal>
      </ThemeContext.Provider>,
    );

    expect(target.querySelector('[data-testid="theme"]')?.textContent).toBe('dark');

    document.body.removeChild(target);
  });

  it('events bubble across portal to React parent (not DOM parent)', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const onClick = vi.fn();

    render(
      <div onClick={onClick}>
        <Portal container={target}>
          <button data-testid="btn">click me</button>
        </Portal>
      </div>,
    );

    const btn = target.querySelector<HTMLButtonElement>('[data-testid="btn"]')!;
    btn.click();

    expect(onClick).toHaveBeenCalledTimes(1);

    document.body.removeChild(target);
  });
});

// ─────────────────────────────────────────────────────────────
// Secondary · render semantics
// ─────────────────────────────────────────────────────────────

describe('Portal · render semantics (no DOM of its own)', () => {
  it('does not produce any wrapper element in either tree', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const { container } = render(
      <Portal container={target}>
        <span data-testid="child">x</span>
      </Portal>,
    );

    // No wrapper in the original render container.
    expect(container.children.length).toBe(0);
    // Child sits directly under target (no Portal wrapper).
    expect(target.firstElementChild?.getAttribute('data-testid')).toBe('child');

    document.body.removeChild(target);
  });
});

