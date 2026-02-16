import { describe, it, expect } from 'vitest';
import { focusable, tabbable, findTabbableDescendants, FOCUS_SELECTOR } from './tabbable';

describe('FOCUS_SELECTOR', () => {
  it('includes expected selectors', () => {
    expect(FOCUS_SELECTOR).toContain('input');
    expect(FOCUS_SELECTOR).toContain('button');
    expect(FOCUS_SELECTOR).toContain('a');
    expect(FOCUS_SELECTOR).toContain('[tabindex]');
  });
});

describe('focusable', () => {
  it('returns true for a button', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    expect(focusable(btn)).toBe(true);
    document.body.removeChild(btn);
  });

  it('returns true for an input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    expect(focusable(input)).toBe(true);
    document.body.removeChild(input);
  });

  it('returns true for an anchor with href', () => {
    const a = document.createElement('a');
    a.href = 'https://example.com';
    document.body.appendChild(a);
    expect(focusable(a)).toBe(true);
    document.body.removeChild(a);
  });

  it('returns true for element with tabindex=0', () => {
    const div = document.createElement('div');
    div.setAttribute('tabindex', '0');
    document.body.appendChild(div);
    expect(focusable(div)).toBe(true);
    document.body.removeChild(div);
  });

  it('returns false for element with aria-hidden', () => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-hidden', 'true');
    document.body.appendChild(btn);
    expect(focusable(btn)).toBe(false);
    document.body.removeChild(btn);
  });

  it('returns false for element with hidden attribute', () => {
    const btn = document.createElement('button');
    btn.setAttribute('hidden', 'true');
    document.body.appendChild(btn);
    expect(focusable(btn)).toBe(false);
    document.body.removeChild(btn);
  });

  it('returns false for input type=hidden', () => {
    const input = document.createElement('input');
    input.type = 'hidden';
    document.body.appendChild(input);
    expect(focusable(input)).toBe(false);
    document.body.removeChild(input);
  });

  it('returns false for a plain div without tabindex', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(focusable(div)).toBe(false);
    document.body.removeChild(div);
  });
});

describe('tabbable', () => {
  it('returns true for a button (default tabindex)', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    expect(tabbable(btn)).toBe(true);
    document.body.removeChild(btn);
  });

  it('returns false for element with tabindex=-1', () => {
    const btn = document.createElement('button');
    btn.setAttribute('tabindex', '-1');
    document.body.appendChild(btn);
    expect(tabbable(btn)).toBe(false);
    document.body.removeChild(btn);
  });

  it('returns true for element with tabindex=0', () => {
    const div = document.createElement('div');
    div.setAttribute('tabindex', '0');
    document.body.appendChild(div);
    expect(tabbable(div)).toBe(true);
    document.body.removeChild(div);
  });
});

describe('findTabbableDescendants', () => {
  it('finds tabbable descendants', () => {
    const container = document.createElement('div');
    const btn = document.createElement('button');
    const input = document.createElement('input');
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    const div = document.createElement('div');

    container.appendChild(btn);
    container.appendChild(input);
    container.appendChild(hiddenInput);
    container.appendChild(div);
    document.body.appendChild(container);

    const result = findTabbableDescendants(container);
    expect(result).toContain(btn);
    expect(result).toContain(input);
    expect(result).not.toContain(hiddenInput);
    expect(result).not.toContain(div);

    document.body.removeChild(container);
  });

  it('returns empty array for container with no tabbable elements', () => {
    const container = document.createElement('div');
    container.innerHTML = '<div><span>text</span></div>';
    document.body.appendChild(container);

    const result = findTabbableDescendants(container);
    expect(result).toHaveLength(0);

    document.body.removeChild(container);
  });

  it('excludes elements with tabindex=-1', () => {
    const container = document.createElement('div');
    const btn = document.createElement('button');
    btn.setAttribute('tabindex', '-1');
    container.appendChild(btn);
    document.body.appendChild(container);

    const result = findTabbableDescendants(container);
    expect(result).not.toContain(btn);

    document.body.removeChild(container);
  });
});
