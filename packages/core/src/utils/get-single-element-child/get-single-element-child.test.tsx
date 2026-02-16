import React, { Fragment } from 'react';
import { describe, it, expect } from 'vitest';
import { getSingleElementChild } from './get-single-element-child';

describe('getSingleElementChild', () => {
  it('returns element when single JSX child', () => {
    const result = getSingleElementChild(<div />);
    expect(result).not.toBeNull();
  });

  it('returns element when single component child', () => {
    function MyComp() {
      return <div />;
    }
    const result = getSingleElementChild(<MyComp />);
    expect(result).not.toBeNull();
  });

  it('returns null for multiple children', () => {
    const result = getSingleElementChild([<div key="a" />, <span key="b" />]);
    expect(result).toBeNull();
  });

  it('returns null for string child', () => {
    const result = getSingleElementChild('hello');
    expect(result).toBeNull();
  });

  it('returns null for number child', () => {
    const result = getSingleElementChild(42);
    expect(result).toBeNull();
  });

  it('returns null for null', () => {
    const result = getSingleElementChild(null);
    expect(result).toBeNull();
  });

  it('returns null for undefined', () => {
    const result = getSingleElementChild(undefined);
    expect(result).toBeNull();
  });

  it('returns null for Fragment', () => {
    const result = getSingleElementChild(<Fragment />);
    expect(result).toBeNull();
  });

  it('returns null for empty array', () => {
    const result = getSingleElementChild([]);
    expect(result).toBeNull();
  });
});
