import React, { Fragment } from 'react';
import { describe, it, expect } from 'vitest';
import { isElement } from './is-element';

describe('isElement', () => {
  it('returns true for JSX element', () => {
    expect(isElement(<div />)).toBe(true);
  });

  it('returns true for component element', () => {
    function MyComp() {
      return <div />;
    }
    expect(isElement(<MyComp />)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isElement(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isElement(undefined)).toBe(false);
  });

  it('returns false for string', () => {
    expect(isElement('hello')).toBe(false);
  });

  it('returns false for number', () => {
    expect(isElement(42)).toBe(false);
  });

  it('returns false for array', () => {
    expect(isElement([<div key="a" />, <div key="b" />])).toBe(false);
  });

  it('returns false for Fragment', () => {
    expect(isElement(<Fragment />)).toBe(false);
  });

  it('returns false for boolean', () => {
    expect(isElement(true)).toBe(false);
    expect(isElement(false)).toBe(false);
  });
});
