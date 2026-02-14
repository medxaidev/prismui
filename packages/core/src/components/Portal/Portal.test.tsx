import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Portal } from './Portal';
import { OptionalPortal } from './OptionalPortal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Remove all portal nodes created during tests. */
function cleanupPortalNodes() {
  document.querySelectorAll('[data-portal]').forEach((n) => n.remove());
  document.querySelectorAll('[data-prismui-portal-node]').forEach((n) => n.remove());
}

afterEach(() => {
  cleanupPortalNodes();
});

// ---------------------------------------------------------------------------
// Portal — basic rendering
// ---------------------------------------------------------------------------

describe('Portal — basic rendering', () => {
  it('renders children into a portal node on document.body', () => {
    render(<Portal>portal-content</Portal>);
    const portalNode = document.querySelector('[data-portal]');
    expect(portalNode).toBeTruthy();
    expect(portalNode!.textContent).toBe('portal-content');
  });

  it('renders children outside the parent DOM hierarchy', () => {
    const { container } = render(
      <div data-testid="parent">
        <Portal>outside-parent</Portal>
      </div>,
    );
    // Content should NOT be inside the parent container
    expect(container.textContent).not.toContain('outside-parent');
    // But should be in the document
    expect(document.body.textContent).toContain('outside-parent');
  });

  it('has correct displayName', () => {
    expect(Portal.displayName).toBe('@prismui/core/Portal');
  });
});

// ---------------------------------------------------------------------------
// Portal — target prop
// ---------------------------------------------------------------------------

describe('Portal — target prop', () => {
  it('renders into an HTMLElement target', () => {
    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-testid', 'custom-target');
    document.body.appendChild(targetEl);

    render(<Portal target={targetEl}>in-target</Portal>);
    expect(targetEl.textContent).toBe('in-target');

    targetEl.remove();
  });

  it('renders into a CSS selector target', () => {
    const targetEl = document.createElement('div');
    targetEl.id = 'portal-target';
    document.body.appendChild(targetEl);

    render(<Portal target="#portal-target">selector-content</Portal>);
    expect(targetEl.textContent).toBe('selector-content');

    targetEl.remove();
  });

  it('renders into a callback target (MUI pattern)', () => {
    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-testid', 'callback-target');
    document.body.appendChild(targetEl);

    render(<Portal target={() => targetEl}>callback-content</Portal>);
    expect(targetEl.textContent).toBe('callback-content');

    targetEl.remove();
  });

  it('renders nothing when CSS selector target is not found', () => {
    render(<Portal target="#nonexistent">lost-content</Portal>);
    expect(document.body.textContent).not.toContain('lost-content');
  });
});

// ---------------------------------------------------------------------------
// Portal — disablePortal
// ---------------------------------------------------------------------------

describe('Portal — disablePortal', () => {
  it('renders children in-place when disablePortal is true', () => {
    const { container } = render(
      <div data-testid="parent">
        <Portal disablePortal>in-place-content</Portal>
      </div>,
    );
    expect(container.textContent).toContain('in-place-content');
  });

  it('does not create a portal node when disablePortal is true', () => {
    render(<Portal disablePortal>no-portal</Portal>);
    const portalNodes = document.querySelectorAll('[data-portal]');
    expect(portalNodes.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Portal — reuseTargetNode
// ---------------------------------------------------------------------------

describe('Portal — reuseTargetNode', () => {
  it('reuses a shared portal node by default (reuseTargetNode=true)', () => {
    render(
      <>
        <Portal>content-1</Portal>
        <Portal>content-2</Portal>
      </>,
    );
    const sharedNodes = document.querySelectorAll('[data-prismui-portal-node]');
    expect(sharedNodes.length).toBe(1);
    expect(sharedNodes[0].textContent).toContain('content-1');
    expect(sharedNodes[0].textContent).toContain('content-2');
  });

  it('creates separate nodes when reuseTargetNode=false', () => {
    render(
      <>
        <Portal reuseTargetNode={false}>unique-1</Portal>
        <Portal reuseTargetNode={false}>unique-2</Portal>
      </>,
    );
    const portalNodes = document.querySelectorAll(
      '[data-portal]:not([data-prismui-portal-node])',
    );
    expect(portalNodes.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Portal — className / style / id on created node
// ---------------------------------------------------------------------------

describe('Portal — node attributes', () => {
  it('applies className to the created portal node', () => {
    render(
      <Portal reuseTargetNode={false} className="my-portal">
        styled-content
      </Portal>,
    );
    const node = document.querySelector(
      '[data-portal]:not([data-prismui-portal-node])',
    )!;
    expect(node.classList.contains('my-portal')).toBe(true);
  });

  it('applies id to the created portal node', () => {
    render(
      <Portal reuseTargetNode={false} id="portal-id">
        id-content
      </Portal>,
    );
    const node = document.getElementById('portal-id');
    expect(node).toBeTruthy();
    expect(node!.textContent).toBe('id-content');
  });

  it('applies style to the created portal node', () => {
    render(
      <Portal reuseTargetNode={false} style={{ zIndex: 9999 }}>
        styled-content
      </Portal>,
    );
    const node = document.querySelector(
      '[data-portal]:not([data-prismui-portal-node])',
    ) as HTMLElement;
    expect(node.style.zIndex).toBe('9999');
  });

  it('handles empty className without crashing', () => {
    render(
      <Portal reuseTargetNode={false} className="">
        empty-class
      </Portal>,
    );
    const node = document.querySelector(
      '[data-portal]:not([data-prismui-portal-node])',
    )!;
    expect(node).toBeTruthy();
  });

  it('handles className with extra spaces', () => {
    render(
      <Portal reuseTargetNode={false} className="hello  world">
        spaced-class
      </Portal>,
    );
    const node = document.querySelector(
      '[data-portal]:not([data-prismui-portal-node])',
    )!;
    expect(node.classList.contains('hello')).toBe(true);
    expect(node.classList.contains('world')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Portal — ref forwarding
// ---------------------------------------------------------------------------

describe('Portal — ref', () => {
  it('forwards ref to the portal node', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Portal ref={ref} reuseTargetNode={false}>
        ref-content
      </Portal>,
    );
    expect(ref.current).toBeTruthy();
    expect(ref.current!.getAttribute('data-portal')).toBe('true');
  });

  it('forwards ref to an explicit HTMLElement target', () => {
    const ref = createRef<HTMLElement>();
    const targetEl = document.createElement('div');
    targetEl.id = 'ref-target';
    document.body.appendChild(targetEl);

    render(
      <Portal ref={ref} target={targetEl}>
        ref-target-content
      </Portal>,
    );
    expect(ref.current).toBe(targetEl);

    targetEl.remove();
  });

  it('calls callback ref', () => {
    let refNode: HTMLElement | null = null;
    render(
      <Portal ref={(node) => { refNode = node; }} reuseTargetNode={false}>
        callback-ref
      </Portal>,
    );
    expect(refNode).toBeTruthy();
    expect(refNode!.getAttribute('data-portal')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Portal — cleanup
// ---------------------------------------------------------------------------

describe('Portal — cleanup', () => {
  it('removes created node on unmount when reuseTargetNode=false', () => {
    const { unmount } = render(
      <Portal reuseTargetNode={false}>cleanup-content</Portal>,
    );
    expect(
      document.querySelectorAll('[data-portal]:not([data-prismui-portal-node])').length,
    ).toBe(1);

    unmount();
    expect(
      document.querySelectorAll('[data-portal]:not([data-prismui-portal-node])').length,
    ).toBe(0);
  });

  it('does not remove shared node on unmount', () => {
    const { unmount } = render(<Portal>shared-content</Portal>);
    const sharedNode = document.querySelector('[data-prismui-portal-node]');
    expect(sharedNode).toBeTruthy();

    unmount();
    // Shared node should persist
    expect(document.querySelector('[data-prismui-portal-node]')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// OptionalPortal
// ---------------------------------------------------------------------------

describe('OptionalPortal', () => {
  it('renders in portal by default (withinPortal=true)', () => {
    const { container } = render(
      <div>
        <OptionalPortal>optional-in-portal</OptionalPortal>
      </div>,
    );
    expect(container.textContent).not.toContain('optional-in-portal');
    expect(document.body.textContent).toContain('optional-in-portal');
  });

  it('renders in-place when withinPortal=false', () => {
    const { container } = render(
      <div>
        <OptionalPortal withinPortal={false}>optional-in-place</OptionalPortal>
      </div>,
    );
    expect(container.textContent).toContain('optional-in-place');
  });

  it('has correct displayName', () => {
    expect(OptionalPortal.displayName).toBe('@prismui/core/OptionalPortal');
  });

  it('passes target prop through to Portal', () => {
    const targetEl = document.createElement('div');
    targetEl.id = 'optional-target';
    document.body.appendChild(targetEl);

    render(
      <OptionalPortal target={targetEl}>
        optional-target-content
      </OptionalPortal>,
    );
    expect(targetEl.textContent).toBe('optional-target-content');

    targetEl.remove();
  });

  it('forwards ref when withinPortal=true', () => {
    const ref = createRef<HTMLElement>();
    render(
      <OptionalPortal ref={ref} reuseTargetNode={false}>
        optional-ref
      </OptionalPortal>,
    );
    expect(ref.current).toBeTruthy();
  });
});
