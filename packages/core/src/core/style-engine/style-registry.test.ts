import { describe, expect, it } from 'vitest';
import { createStyleRegistry } from './style-registry';

describe('createStyleRegistry', () => {
  it('inserts a CSS snippet and retrieves it via toString', () => {
    const reg = createStyleRegistry();
    reg.insert('a', '.a { color: red; }');
    expect(reg.toString()).toBe('.a { color: red; }\n');
  });

  it('deduplicates by id', () => {
    const reg = createStyleRegistry();
    reg.insert('a', '.a { color: red; }');
    reg.insert('a', '.a { color: blue; }');
    expect(reg.toString()).toBe('.a { color: red; }\n');
  });

  it('preserves insertion order', () => {
    const reg = createStyleRegistry();
    reg.insert('a', '.a {}');
    reg.insert('b', '.b {}');
    reg.insert('c', '.c {}');
    expect(reg.toString()).toBe('.a {}\n.b {}\n.c {}\n');
  });

  it('has() returns correct status', () => {
    const reg = createStyleRegistry();
    expect(reg.has('x')).toBe(false);
    reg.insert('x', '.x {}');
    expect(reg.has('x')).toBe(true);
  });

  it('flush() returns CSS and clears the registry', () => {
    const reg = createStyleRegistry();
    reg.insert('a', '.a {}');
    reg.insert('b', '.b {}');

    const css = reg.flush();
    expect(css).toBe('.a {}\n.b {}\n');

    expect(reg.toString()).toBe('');
    expect(reg.has('a')).toBe(false);
    expect(reg.has('b')).toBe(false);
  });

  it('can be reused after flush', () => {
    const reg = createStyleRegistry();
    reg.insert('a', '.a {}');
    reg.flush();

    reg.insert('b', '.b {}');
    expect(reg.toString()).toBe('.b {}\n');
    expect(reg.has('a')).toBe(false);
    expect(reg.has('b')).toBe(true);
  });

  it('handles CSS that already ends with newline', () => {
    const reg = createStyleRegistry();
    reg.insert('a', '.a {}\n');
    expect(reg.toString()).toBe('.a {}\n');
  });
});
