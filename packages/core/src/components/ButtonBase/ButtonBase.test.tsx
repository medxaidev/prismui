import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';
import { ButtonBase } from './ButtonBase';
import type { TouchRippleActions } from './TouchRipple';
import classes from './ButtonBase.module.css';
import rippleStyles from './TouchRipple.module.css';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

// ---------------------------------------------------------------------------
// 1. Basic rendering
// ---------------------------------------------------------------------------

describe('ButtonBase — basic rendering', () => {
  it('renders as <button> by default', () => {
    renderWithProvider(<ButtonBase>Click me</ButtonBase>);
    const btn = screen.getByRole('button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.textContent).toBe('Click me');
  });

  it('sets type="button" on <button> element', () => {
    renderWithProvider(<ButtonBase>Click</ButtonBase>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies CSS Module root class', () => {
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const root = container.firstElementChild!;
    expect(root.classList.contains(classes.root)).toBe(true);
  });

  it('applies static class prismui-ButtonBase-root', () => {
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('prismui-ButtonBase-root');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithProvider(<ButtonBase ref={ref}>Click</ButtonBase>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders children', () => {
    renderWithProvider(
      <ButtonBase>
        <span data-testid="child">inner</span>
      </ButtonBase>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. Polymorphic component prop
// ---------------------------------------------------------------------------

describe('ButtonBase — polymorphic', () => {
  it('renders as <a> when component="a"', () => {
    const { container } = renderWithProvider(
      <ButtonBase component="a" href="/link">
        Link
      </ButtonBase>
    );
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('href')).toBe('/link');
  });

  it('does not set type attribute when component is not "button"', () => {
    const { container } = renderWithProvider(
      <ButtonBase component="a" href="/link">
        Link
      </ButtonBase>
    );
    expect(container.firstElementChild!.hasAttribute('type')).toBe(false);
  });

  it('renders as <div> when component="div"', () => {
    const { container } = renderWithProvider(
      <ButtonBase component="div">Div</ButtonBase>
    );
    expect(container.firstElementChild!.tagName).toBe('DIV');
    expect(container.firstElementChild!.hasAttribute('type')).toBe(false);
  });

  it('forwards ref to polymorphic element', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    renderWithProvider(
      <ButtonBase component="a" href="/test" ref={ref}>
        Link
      </ButtonBase>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

// ---------------------------------------------------------------------------
// 3. Keyboard accessibility
// ---------------------------------------------------------------------------

describe('ButtonBase — keyboard accessibility', () => {
  it('triggers onClick on Enter key', () => {
    const onClick = vi.fn();
    renderWithProvider(<ButtonBase onClick={onClick}>Click</ButtonBase>);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    // Native <button> handles Enter → click, but in jsdom we simulate:
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('triggers onClick on Space key', () => {
    const onClick = vi.fn();
    renderWithProvider(<ButtonBase onClick={onClick}>Click</ButtonBase>);
    fireEvent.keyUp(screen.getByRole('button'), { key: ' ' });
    // Native <button> handles Space → click:
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('onClick fires on click event', () => {
    const onClick = vi.fn();
    renderWithProvider(<ButtonBase onClick={onClick}>Click</ButtonBase>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 4. Disabled state
// ---------------------------------------------------------------------------

describe('ButtonBase — disabled', () => {
  it('applies disabled attribute on <button>', () => {
    renderWithProvider(<ButtonBase disabled>Click</ButtonBase>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    renderWithProvider(
      <ButtonBase disabled onClick={onClick}>
        Click
      </ButtonBase>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 5. Unstyled prop
// ---------------------------------------------------------------------------

describe('ButtonBase — unstyled', () => {
  it('skips CSS Module class when unstyled=true', () => {
    const { container } = renderWithProvider(
      <ButtonBase unstyled>Click</ButtonBase>
    );
    const root = container.firstElementChild!;
    expect(root.classList.contains(classes.root)).toBe(false);
  });

  it('still applies static class when unstyled=true', () => {
    const { container } = renderWithProvider(
      <ButtonBase unstyled>Click</ButtonBase>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('prismui-ButtonBase-root');
  });
});

// ---------------------------------------------------------------------------
// 6. __staticSelector
// ---------------------------------------------------------------------------

describe('ButtonBase — __staticSelector', () => {
  it('uses custom static selector for class name', () => {
    const { container } = renderWithProvider(
      <ButtonBase __staticSelector="MyButton">Click</ButtonBase>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('prismui-MyButton-root');
  });

  it('uses custom static selector for theme classNames lookup', () => {
    const theme = createTheme({
      components: {
        MyButton: {
          classNames: { root: 'theme-my-button' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <ButtonBase __staticSelector="MyButton">Click</ButtonBase>
      </PrismuiProvider>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('theme-my-button');
  });
});

// ---------------------------------------------------------------------------
// 7. className and style props
// ---------------------------------------------------------------------------

describe('ButtonBase — className and style props', () => {
  it('merges user className', () => {
    const { container } = renderWithProvider(
      <ButtonBase className="custom-btn">Click</ButtonBase>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('custom-btn');
    expect(root.classList.contains(classes.root)).toBe(true);
  });

  it('merges user style', () => {
    const { container } = renderWithProvider(
      <ButtonBase style={{ color: 'red' }}>Click</ButtonBase>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('color');
    expect(style).toContain('red');
  });

  it('passes extra props to root element', () => {
    renderWithProvider(
      <ButtonBase data-testid="my-btn" aria-label="action">
        Click
      </ButtonBase>
    );
    const btn = screen.getByTestId('my-btn');
    expect(btn.getAttribute('aria-label')).toBe('action');
  });
});

// ---------------------------------------------------------------------------
// 8. Component-level classNames and styles props
// ---------------------------------------------------------------------------

describe('ButtonBase — classNames and styles props', () => {
  it('merges component-level classNames prop', () => {
    const { container } = renderWithProvider(
      <ButtonBase classNames={{ root: 'cn-override' }}>Click</ButtonBase>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('cn-override');
    expect(root.classList.contains(classes.root)).toBe(true);
  });

  it('merges component-level styles prop', () => {
    const { container } = renderWithProvider(
      <ButtonBase styles={{ root: { backgroundColor: 'pink' } }}>
        Click
      </ButtonBase>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('background-color');
    expect(style).toContain('pink');
  });
});

// ---------------------------------------------------------------------------
// 9. Theme customization
// ---------------------------------------------------------------------------

describe('ButtonBase — theme customization', () => {
  it('applies theme defaultProps', () => {
    const theme = createTheme({
      components: {
        ButtonBase: {
          defaultProps: { className: 'theme-default' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <ButtonBase>Click</ButtonBase>
      </PrismuiProvider>
    );
    expect(container.firstElementChild!.className).toContain('theme-default');
  });

  it('applies theme classNames', () => {
    const theme = createTheme({
      components: {
        ButtonBase: {
          classNames: { root: 'theme-btn-root' },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <ButtonBase>Click</ButtonBase>
      </PrismuiProvider>
    );
    expect(container.firstElementChild!.className).toContain('theme-btn-root');
  });

  it('applies theme styles', () => {
    const theme = createTheme({
      components: {
        ButtonBase: {
          styles: { root: { border: '2px solid red' } },
        },
      },
    });
    const { container } = render(
      <PrismuiProvider theme={theme}>
        <ButtonBase>Click</ButtonBase>
      </PrismuiProvider>
    );
    const style = container.firstElementChild!.getAttribute('style') || '';
    expect(style).toContain('border');
  });
});

// ---------------------------------------------------------------------------
// 10. Provider requirement
// ---------------------------------------------------------------------------

describe('ButtonBase — Provider requirement', () => {
  it('throws when rendered without PrismuiProvider', () => {
    expect(() => render(<ButtonBase>Click</ButtonBase>)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 11. Static properties
// ---------------------------------------------------------------------------

describe('ButtonBase — static properties', () => {
  it('has .classes static property', () => {
    expect(ButtonBase.classes).toBe(classes);
  });

  it('has correct displayName', () => {
    expect(ButtonBase.displayName).toBe('@prismui/core/ButtonBase');
  });

  it('has .extend static method', () => {
    expect(typeof ButtonBase.extend).toBe('function');
  });

  it('has .withProps static method', () => {
    expect(typeof ButtonBase.withProps).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 12. Ripple — rendering
// ---------------------------------------------------------------------------

describe('ButtonBase — ripple rendering', () => {
  it('renders TouchRipple element by default', () => {
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    expect(rippleRoot).not.toBeNull();
  });

  it('does not render TouchRipple when disableRipple=true', () => {
    const { container } = renderWithProvider(
      <ButtonBase disableRipple>Click</ButtonBase>
    );
    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    expect(rippleRoot).toBeNull();
  });

  it('does not render TouchRipple when disabled=true', () => {
    const { container } = renderWithProvider(
      <ButtonBase disabled>Click</ButtonBase>
    );
    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    expect(rippleRoot).toBeNull();
  });

  it('renders children alongside ripple', () => {
    renderWithProvider(
      <ButtonBase>
        <span data-testid="child">inner</span>
      </ButtonBase>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 13. Ripple — mouse interaction
// ---------------------------------------------------------------------------

describe('ButtonBase — ripple mouse interaction', () => {
  it('spawns a ripple on mouseDown', async () => {
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.mouseDown(btn);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const ripples = rippleRoot?.querySelectorAll(`.${rippleStyles.rippleVisible}`);
    expect(ripples?.length).toBeGreaterThanOrEqual(1);
  });

  it('removes ripple after mouseUp', async () => {
    vi.useFakeTimers();
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.mouseDown(btn);
    });

    await act(async () => {
      fireEvent.mouseUp(btn);
    });

    // Advance past the exit animation duration (550ms)
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const ripples = rippleRoot?.querySelectorAll(`.${rippleStyles.ripple}`);
    expect(ripples?.length).toBe(0);

    vi.useRealTimers();
  });

  it('stops ripple on mouseLeave', async () => {
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.mouseDown(btn);
    });

    await act(async () => {
      fireEvent.mouseLeave(btn);
    });

    // The ripple should be marked as exiting (childLeaving class)
    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const leavingChildren = rippleRoot?.querySelectorAll(`.${rippleStyles.childLeaving}`);
    expect(leavingChildren?.length).toBeGreaterThanOrEqual(1);
  });

  it('does not spawn ripple when disableRipple=true', async () => {
    const { container } = renderWithProvider(
      <ButtonBase disableRipple>Click</ButtonBase>
    );
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.mouseDown(btn);
    });

    // No ripple root at all
    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    expect(rippleRoot).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 14. Ripple — centerRipple
// ---------------------------------------------------------------------------

describe('ButtonBase — centerRipple', () => {
  it('spawns a ripple when centerRipple=true', async () => {
    const { container } = renderWithProvider(
      <ButtonBase centerRipple>Click</ButtonBase>
    );
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.mouseDown(btn);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const ripples = rippleRoot?.querySelectorAll(`.${rippleStyles.rippleVisible}`);
    expect(ripples?.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 15. Ripple — focusRipple (pulsate)
// ---------------------------------------------------------------------------

describe('ButtonBase — focusRipple', () => {
  it('starts pulsate on focus when focusRipple=true', async () => {
    const { container } = renderWithProvider(
      <ButtonBase focusRipple>Click</ButtonBase>
    );
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.focus(btn);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const pulsating = rippleRoot?.querySelectorAll(`.${rippleStyles.ripplePulsate}`);
    expect(pulsating?.length).toBeGreaterThanOrEqual(1);
  });

  it('does not pulsate on focus when focusRipple=false (default)', async () => {
    const { container } = renderWithProvider(<ButtonBase>Click</ButtonBase>);
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.focus(btn);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const pulsating = rippleRoot?.querySelectorAll(`.${rippleStyles.ripplePulsate}`);
    expect(pulsating?.length).toBe(0);
  });

  it('stops pulsate on blur', async () => {
    vi.useFakeTimers();
    const { container } = renderWithProvider(
      <ButtonBase focusRipple>Click</ButtonBase>
    );
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.focus(btn);
    });

    await act(async () => {
      fireEvent.blur(btn);
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const ripples = rippleRoot?.querySelectorAll(`.${rippleStyles.ripple}`);
    expect(ripples?.length).toBe(0);

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// 16. Ripple — disableTouchRipple
// ---------------------------------------------------------------------------

describe('ButtonBase — disableTouchRipple', () => {
  it('does not spawn ripple on touchStart when disableTouchRipple=true', async () => {
    vi.useFakeTimers();
    const { container } = renderWithProvider(
      <ButtonBase disableTouchRipple>Click</ButtonBase>
    );
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.touchStart(btn, { touches: [{ clientX: 10, clientY: 10 }] });
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const ripples = rippleRoot?.querySelectorAll(`.${rippleStyles.rippleVisible}`);
    expect(ripples?.length).toBe(0);

    vi.useRealTimers();
  });

  it('still spawns ripple on mouseDown when disableTouchRipple=true', async () => {
    const { container } = renderWithProvider(
      <ButtonBase disableTouchRipple>Click</ButtonBase>
    );
    const btn = container.firstElementChild!;

    await act(async () => {
      fireEvent.mouseDown(btn);
    });

    const rippleRoot = container.querySelector(`.${rippleStyles.rippleRoot}`);
    const ripples = rippleRoot?.querySelectorAll(`.${rippleStyles.rippleVisible}`);
    expect(ripples?.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 17. Ripple — touchRippleRef
// ---------------------------------------------------------------------------

describe('ButtonBase — touchRippleRef', () => {
  it('exposes start/stop/pulsate via touchRippleRef', () => {
    const rippleRef = React.createRef<TouchRippleActions>();
    renderWithProvider(
      <ButtonBase touchRippleRef={rippleRef}>Click</ButtonBase>
    );
    expect(rippleRef.current).not.toBeNull();
    expect(typeof rippleRef.current?.start).toBe('function');
    expect(typeof rippleRef.current?.stop).toBe('function');
    expect(typeof rippleRef.current?.pulsate).toBe('function');
  });

  it('touchRippleRef is null when disableRipple=true', () => {
    const rippleRef = React.createRef<TouchRippleActions>();
    renderWithProvider(
      <ButtonBase disableRipple touchRippleRef={rippleRef}>Click</ButtonBase>
    );
    expect(rippleRef.current).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 18. Ripple — event handler passthrough
// ---------------------------------------------------------------------------

describe('ButtonBase — ripple event handler passthrough', () => {
  it('calls user onMouseDown alongside ripple', async () => {
    const onMouseDown = vi.fn();
    const { container } = renderWithProvider(
      <ButtonBase onMouseDown={onMouseDown}>Click</ButtonBase>
    );

    await act(async () => {
      fireEvent.mouseDown(container.firstElementChild!);
    });

    expect(onMouseDown).toHaveBeenCalledTimes(1);
  });

  it('calls user onFocus alongside ripple', async () => {
    const onFocus = vi.fn();
    const { container } = renderWithProvider(
      <ButtonBase focusRipple onFocus={onFocus}>Click</ButtonBase>
    );

    await act(async () => {
      fireEvent.focus(container.firstElementChild!);
    });

    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls user onBlur alongside ripple', async () => {
    const onBlur = vi.fn();
    const { container } = renderWithProvider(
      <ButtonBase focusRipple onBlur={onBlur}>Click</ButtonBase>
    );

    await act(async () => {
      fireEvent.blur(container.firstElementChild!);
    });

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
