import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';

// ---------------------------------------------------------------------------
// 1. Basic rendering
// ---------------------------------------------------------------------------

describe('TextField — basic rendering', () => {
  it('renders a native input element', () => {
    render(<TextField data-testid="tf" />);
    expect(screen.getByTestId('tf').tagName).toBe('INPUT');
  });

  it('renders with label', () => {
    const { container } = render(<TextField label="Email" />);
    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toContain('Email');
  });

  it('renders with helperText', () => {
    render(<TextField helperText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextField placeholder="john@example.com" />);
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<TextField value="hello" onChange={() => { }} />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('renders with defaultValue', () => {
    render(<TextField defaultValue="default" />);
    expect(screen.getByDisplayValue('default')).toBeInTheDocument();
  });

  it('forwards ref to the input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextField ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes native input props (type, readOnly, etc.)', () => {
    render(<TextField type="password" readOnly data-testid="tf" />);
    const input = screen.getByTestId('tf');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('readOnly');
  });
});

// ---------------------------------------------------------------------------
// 2. Variants
// ---------------------------------------------------------------------------

describe('TextField — variants', () => {
  it('defaults to outlined variant', () => {
    const { container } = render(<TextField label="Test" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'outlined');
  });

  it('renders filled variant', () => {
    const { container } = render(<TextField label="Test" variant="filled" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'filled');
  });

  it('renders standard variant', () => {
    const { container } = render(<TextField label="Test" variant="standard" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'standard');
  });
});

// ---------------------------------------------------------------------------
// 3. Sizes
// ---------------------------------------------------------------------------

describe('TextField — sizes', () => {
  it('defaults to md size', () => {
    const { container } = render(<TextField label="Test" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'md');
  });

  it('renders sm size', () => {
    const { container } = render(<TextField label="Test" size="sm" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'sm');
  });
});

// ---------------------------------------------------------------------------
// 4. Floating label (shrink)
// ---------------------------------------------------------------------------

describe('TextField — floating label', () => {
  it('label is NOT shrunk when empty and not focused', () => {
    const { container } = render(<TextField label="Email" />);
    const label = container.querySelector('label');
    expect(label).not.toHaveAttribute('data-shrink');
  });

  it('label shrinks when input is focused', async () => {
    const { container } = render(<TextField label="Email" data-testid="tf" />);
    const input = screen.getByTestId('tf');
    fireEvent.focus(input);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('data-shrink');
  });

  it('label shrinks when input has value (controlled)', () => {
    const { container } = render(<TextField label="Email" value="test" onChange={() => { }} />);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('data-shrink');
  });

  it('label shrinks when input has defaultValue', () => {
    const { container } = render(<TextField label="Email" defaultValue="test" />);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('data-shrink');
  });

  it('label shrinks when placeholder is provided', () => {
    const { container } = render(<TextField label="Email" placeholder="Enter email" />);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('data-shrink');
  });

  it('label unshrinks when focus is lost and value is empty', async () => {
    const { container } = render(<TextField label="Email" data-testid="tf" />);
    const input = screen.getByTestId('tf');
    fireEvent.focus(input);
    expect(container.querySelector('label')).toHaveAttribute('data-shrink');
    fireEvent.blur(input);
    expect(container.querySelector('label')).not.toHaveAttribute('data-shrink');
  });

  it('label stays shrunk after blur if value is not empty', async () => {
    const user = userEvent.setup();
    const { container } = render(<TextField label="Email" data-testid="tf" />);
    const input = screen.getByTestId('tf');
    await user.click(input);
    await user.type(input, 'hello');
    fireEvent.blur(input);
    expect(container.querySelector('label')).toHaveAttribute('data-shrink');
  });

  it('shrink prop forces label to shrink', () => {
    const { container } = render(<TextField label="Date" shrink />);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('data-shrink');
  });

  it('shrink={false} prevents label from shrinking even with value', () => {
    const { container } = render(<TextField label="Email" value="test" shrink={false} onChange={() => { }} />);
    const label = container.querySelector('label');
    expect(label).not.toHaveAttribute('data-shrink');
  });
});

// ---------------------------------------------------------------------------
// 5. Error state
// ---------------------------------------------------------------------------

describe('TextField — error state', () => {
  it('sets data-error on root when error is truthy', () => {
    const { container } = render(<TextField error="Required" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-error');
  });

  it('shows error message instead of helperText', () => {
    render(<TextField helperText="Help" error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
  });

  it('sets aria-invalid on input', () => {
    render(<TextField error="Bad" data-testid="tf" />);
    expect(screen.getByTestId('tf')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not show error text when error is boolean true', () => {
    const { container } = render(<TextField error={true} helperText="Help" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-error');
    // helperText should still show when error is boolean
    expect(screen.getByText('Help')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 6. Disabled state
// ---------------------------------------------------------------------------

describe('TextField — disabled state', () => {
  it('sets data-disabled on root', () => {
    const { container } = render(<TextField disabled />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-disabled');
  });

  it('sets disabled on native input', () => {
    render(<TextField disabled data-testid="tf" />);
    expect(screen.getByTestId('tf')).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// 7. Required
// ---------------------------------------------------------------------------

describe('TextField — required', () => {
  it('shows asterisk in label when required', () => {
    const { container } = render(<TextField label="Name" required />);
    const asterisk = container.querySelector('span[aria-hidden="true"]');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk?.textContent).toContain('*');
  });

  it('sets aria-required on input', () => {
    render(<TextField required data-testid="tf" />);
    expect(screen.getByTestId('tf')).toHaveAttribute('aria-required', 'true');
  });
});

// ---------------------------------------------------------------------------
// 8. Sections (left / right)
// ---------------------------------------------------------------------------

describe('TextField — sections', () => {
  it('renders left section', () => {
    const { container } = render(
      <TextField leftSection={<span data-testid="left-icon">L</span>} />,
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(container.querySelector('[data-position="left"]')).toBeInTheDocument();
  });

  it('renders right section', () => {
    const { container } = render(
      <TextField rightSection={<span data-testid="right-icon">R</span>} />,
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(container.querySelector('[data-position="right"]')).toBeInTheDocument();
  });

  it('sets data-with-left-section on root', () => {
    const { container } = render(<TextField leftSection={<span>L</span>} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-with-left-section');
  });

  it('sets data-with-right-section on root', () => {
    const { container } = render(<TextField rightSection={<span>R</span>} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-with-right-section');
  });
});

// ---------------------------------------------------------------------------
// 9. Multiline
// ---------------------------------------------------------------------------

describe('TextField — multiline', () => {
  it('renders textarea when multiline is true', () => {
    const { container } = render(<TextField multiline data-testid="tf" />);
    const el = screen.getByTestId('tf');
    expect(el.tagName).toBe('TEXTAREA');
  });

  it('passes rows to textarea', () => {
    render(<TextField multiline rows={4} data-testid="tf" />);
    expect(screen.getByTestId('tf')).toHaveAttribute('rows', '4');
  });

  it('forwards ref to textarea', () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<TextField multiline ref={ref as any} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

// ---------------------------------------------------------------------------
// 10. Callbacks
// ---------------------------------------------------------------------------

describe('TextField — callbacks', () => {
  it('calls onFocus', () => {
    const onFocus = vi.fn();
    render(<TextField onFocus={onFocus} data-testid="tf" />);
    fireEvent.focus(screen.getByTestId('tf'));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur', () => {
    const onBlur = vi.fn();
    render(<TextField onBlur={onBlur} data-testid="tf" />);
    fireEvent.blur(screen.getByTestId('tf'));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('calls onChange', async () => {
    const onChange = vi.fn();
    render(<TextField onChange={onChange} data-testid="tf" />);
    const input = screen.getByTestId('tf');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 11. Accessibility
// ---------------------------------------------------------------------------

describe('TextField — accessibility', () => {
  it('label htmlFor matches input id', () => {
    const { container } = render(<TextField label="Email" id="email-input" />);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('for', 'email-input');
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email-input');
  });

  it('aria-describedby links to helper text', () => {
    render(<TextField helperText="Help" id="test" data-testid="tf" />);
    const input = screen.getByTestId('tf');
    expect(input).toHaveAttribute('aria-describedby', 'test-helper');
  });

  it('error helper text has role="alert"', () => {
    render(<TextField error="Error message" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error message');
  });

  it('generates unique id when not provided', () => {
    render(<TextField data-testid="tf" />);
    const input = screen.getByTestId('tf');
    expect(input.id).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 12. Pointer mode
// ---------------------------------------------------------------------------

describe('TextField — pointer mode', () => {
  it('sets data-pointer on input', () => {
    render(<TextField pointer data-testid="tf" />);
    expect(screen.getByTestId('tf')).toHaveAttribute('data-pointer');
  });
});
