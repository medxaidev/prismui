import { describe, expect, it } from 'vitest';
import { getMod, getBoxMod } from './get-box-mod';

describe('getMod', () => {
  it('transforms keys without data- prefix', () => {
    expect(getMod({ loading: true })).toEqual({ 'data-loading': true });
  });

  it('preserves keys that already have data- prefix', () => {
    expect(getMod({ 'data-active': true })).toEqual({ 'data-active': true });
  });

  it('filters out falsy values (undefined, null, false, empty string)', () => {
    expect(getMod({
      loading: undefined,
      active: null,
      disabled: false,
      empty: '',
      valid: true,
    })).toEqual({ 'data-valid': true });
  });

  it('keeps zero as a valid value', () => {
    expect(getMod({ count: 0 })).toEqual({ 'data-count': 0 });
  });

  it('keeps string values', () => {
    expect(getMod({ size: 'lg', variant: 'filled' })).toEqual({
      'data-size': 'lg',
      'data-variant': 'filled',
    });
  });
});

describe('getBoxMod', () => {
  it('returns null for undefined', () => {
    expect(getBoxMod(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getBoxMod('')).toBeNull();
  });

  it('handles string mod', () => {
    expect(getBoxMod('loading')).toEqual({ 'data-loading': true });
  });

  it('handles string mod with data- prefix', () => {
    expect(getBoxMod('data-active')).toEqual({ 'data-active': true });
  });

  it('handles object mod', () => {
    expect(getBoxMod({ loading: true, size: 'lg' })).toEqual({
      'data-loading': true,
      'data-size': 'lg',
    });
  });

  it('handles array of mods', () => {
    expect(getBoxMod([
      { loading: true },
      'active',
      { size: 'lg' },
    ])).toEqual({
      'data-loading': true,
      'data-active': true,
      'data-size': 'lg',
    });
  });

  it('handles nested arrays', () => {
    expect(getBoxMod([
      [{ loading: true }],
      ['active'],
    ])).toEqual({
      'data-loading': true,
      'data-active': true,
    });
  });

  it('filters falsy values in object mod', () => {
    expect(getBoxMod({ loading: true, disabled: false, hidden: undefined })).toEqual({
      'data-loading': true,
    });
  });
});
