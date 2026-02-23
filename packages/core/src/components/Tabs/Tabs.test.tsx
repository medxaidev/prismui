import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs defaultValue="tab1" data-testid="tabs-root" {...props}>
      <Tabs.List data-testid="tabs-list">
        <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
        <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
        <Tabs.Tab value="tab3">Tab 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
      <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
      <Tabs.Panel value="tab3">Panel 3</Tabs.Panel>
    </Tabs>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Tabs', () => {
  describe('Rendering', () => {
    it('renders all tabs and panels', () => {
      renderTabs();
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
      expect(screen.getByText('Panel 1')).toBeInTheDocument();
    });

    it('forwards ref to root element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Tabs ref={ref} defaultValue="a">
          <Tabs.List><Tabs.Tab value="a">A</Tabs.Tab></Tabs.List>
          <Tabs.Panel value="a">Content</Tabs.Panel>
        </Tabs>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies custom className to root', () => {
      renderTabs({ className: 'my-tabs' });
      expect(screen.getByTestId('tabs-root')).toHaveClass('my-tabs');
    });

    it('has correct displayName', () => {
      expect(Tabs.displayName).toBe('@prismui/core/Tabs');
    });

    it('exposes compound components', () => {
      expect(Tabs.List).toBeDefined();
      expect(Tabs.Tab).toBeDefined();
      expect(Tabs.Panel).toBeDefined();
    });
  });

  describe('ARIA attributes', () => {
    it('renders tablist with role="tablist"', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders tabs with role="tab"', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('renders panels with role="tabpanel"', () => {
      renderTabs();
      // Only active panel is visible, but all are in DOM (keepMounted=true)
      const panels = screen.getAllByRole('tabpanel', { hidden: true });
      expect(panels).toHaveLength(3);
    });

    it('sets aria-selected on active tab', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('sets aria-controls on tab linking to panel', () => {
      renderTabs();
      const tab = screen.getAllByRole('tab')[0];
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      const panel = document.getElementById(panelId!);
      expect(panel).toBeInTheDocument();
      expect(panel?.getAttribute('role')).toBe('tabpanel');
    });

    it('sets aria-labelledby on panel linking to tab', () => {
      renderTabs();
      const panels = screen.getAllByRole('tabpanel', { hidden: true });
      const tabId = panels[0].getAttribute('aria-labelledby');
      expect(tabId).toBeTruthy();
      const tab = document.getElementById(tabId!);
      expect(tab).toBeInTheDocument();
      expect(tab?.getAttribute('role')).toBe('tab');
    });

    it('sets aria-orientation on tablist', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('sets aria-orientation="vertical" when vertical', () => {
      renderTabs({ orientation: 'vertical' });
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('sets tabIndex=0 on active tab and -1 on others', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('tabindex', '0');
      expect(tabs[1]).toHaveAttribute('tabindex', '-1');
      expect(tabs[2]).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Tab selection', () => {
    it('activates tab on click', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]);
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    });

    it('shows corresponding panel on tab click', () => {
      renderTabs();
      fireEvent.click(screen.getAllByRole('tab')[1]);
      expect(screen.getByText('Panel 2')).toBeVisible();
    });

    it('calls onChange when tab is clicked', () => {
      const onChange = vi.fn();
      render(
        <Tabs defaultValue="tab1" onChange={onChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2">P2</Tabs.Panel>
        </Tabs>,
      );
      fireEvent.click(screen.getAllByRole('tab')[1]);
      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('supports controlled mode', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Tabs value="tab1" onChange={onChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2">P2</Tabs.Panel>
        </Tabs>,
      );
      fireEvent.click(screen.getAllByRole('tab')[1]);
      expect(onChange).toHaveBeenCalledWith('tab2');
      // Value doesn't change until parent updates
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');

      // Parent updates
      rerender(
        <Tabs value="tab2" onChange={onChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2">P2</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('allowTabDeactivation', () => {
    it('deactivates tab when clicking active tab', () => {
      const onChange = vi.fn();
      render(
        <Tabs defaultValue="tab1" allowTabDeactivation onChange={onChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
        </Tabs>,
      );
      fireEvent.click(screen.getByRole('tab'));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('does not deactivate when allowTabDeactivation is false', () => {
      const onChange = vi.fn();
      render(
        <Tabs defaultValue="tab1" onChange={onChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
        </Tabs>,
      );
      fireEvent.click(screen.getByRole('tab'));
      expect(onChange).toHaveBeenCalledWith('tab1');
    });
  });

  describe('Keyboard navigation', () => {
    it('moves focus to next tab with ArrowRight', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      expect(document.activeElement).toBe(tabs[1]);
    });

    it('moves focus to previous tab with ArrowLeft', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[1].focus();
      fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(tabs[0]);
    });

    it('loops from last to first with ArrowRight', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[2].focus();
      fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
      expect(document.activeElement).toBe(tabs[0]);
    });

    it('loops from first to last with ArrowLeft', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(tabs[2]);
    });

    it('does not loop when loop=false', () => {
      renderTabs({ loop: false });
      const tabs = screen.getAllByRole('tab');
      tabs[2].focus();
      fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
      // Focus stays on last tab
      expect(document.activeElement).toBe(tabs[2]);
    });

    it('moves focus to first tab with Home', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[2].focus();
      fireEvent.keyDown(tabs[2], { key: 'Home' });
      expect(document.activeElement).toBe(tabs[0]);
    });

    it('moves focus to last tab with End', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'End' });
      expect(document.activeElement).toBe(tabs[2]);
    });

    it('activates tab on arrow key when activateTabWithKeyboard=true', () => {
      renderTabs();
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      // Tab 2 should be active (clicked via activateOnFocus)
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('does not activate tab on arrow key when activateTabWithKeyboard=false', () => {
      renderTabs({ activateTabWithKeyboard: false });
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      // Focus moved but tab not activated
      expect(document.activeElement).toBe(tabs[1]);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('skips disabled tabs in keyboard navigation', () => {
      render(
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2" disabled>Tab 2</Tabs.Tab>
            <Tabs.Tab value="tab3">Tab 3</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2">P2</Tabs.Panel>
          <Tabs.Panel value="tab3">P3</Tabs.Panel>
        </Tabs>,
      );
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      // Should skip disabled tab2 and go to tab3
      expect(document.activeElement).toBe(tabs[2]);
    });

    it('uses ArrowDown/ArrowUp for vertical orientation', () => {
      renderTabs({ orientation: 'vertical' });
      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: 'ArrowDown' });
      expect(document.activeElement).toBe(tabs[1]);
    });
  });

  describe('Disabled tabs', () => {
    it('renders disabled tab with disabled attribute', () => {
      render(
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2" disabled>Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2">P2</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getAllByRole('tab')[1]).toBeDisabled();
    });

    it('does not activate disabled tab on click', () => {
      const onChange = vi.fn();
      render(
        <Tabs defaultValue="tab1" onChange={onChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2" disabled>Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2">P2</Tabs.Panel>
        </Tabs>,
      );
      fireEvent.click(screen.getAllByRole('tab')[1]);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keepMounted', () => {
    it('keeps inactive panels mounted by default', () => {
      renderTabs();
      // Panel 2 content should be in DOM even though not visible
      expect(screen.getByText('Panel 2')).toBeInTheDocument();
    });

    it('unmounts inactive panels when keepMounted=false', () => {
      renderTabs({ keepMounted: false });
      // Panel 2 content should not be in DOM
      expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();
    });

    it('per-panel keepMounted overrides global setting', () => {
      render(
        <Tabs defaultValue="tab1" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
            <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">P1</Tabs.Panel>
          <Tabs.Panel value="tab2" keepMounted>P2 kept</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getByText('P2 kept')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('sets data-variant="default" by default', () => {
      renderTabs();
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-variant', 'default');
    });

    it('sets data-variant="outline"', () => {
      renderTabs({ variant: 'outline' });
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-variant', 'outline');
    });

    it('sets data-variant="pills"', () => {
      renderTabs({ variant: 'pills' });
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-variant', 'pills');
    });
  });

  describe('Orientation', () => {
    it('sets data-orientation="horizontal" by default', () => {
      renderTabs();
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('sets data-orientation="vertical"', () => {
      renderTabs({ orientation: 'vertical' });
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('sets data-placement on vertical tabs', () => {
      renderTabs({ orientation: 'vertical', placement: 'right' });
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-placement', 'right');
    });
  });

  describe('Inverted', () => {
    it('sets data-inverted on horizontal inverted tabs', () => {
      renderTabs({ inverted: true });
      expect(screen.getByTestId('tabs-root')).toHaveAttribute('data-inverted', 'true');
    });

    it('does not set data-inverted on vertical tabs even if inverted=true', () => {
      renderTabs({ orientation: 'vertical', inverted: true });
      expect(screen.getByTestId('tabs-root')).not.toHaveAttribute('data-inverted');
    });
  });

  describe('CSS variables', () => {
    it('sets --tabs-color when color prop is provided', () => {
      renderTabs({ color: 'red' });
      const root = screen.getByTestId('tabs-root');
      expect(root.style.getPropertyValue('--tabs-color')).toBe('red');
    });

    it('sets --tabs-radius when radius prop is provided', () => {
      renderTabs({ radius: '8px' });
      const root = screen.getByTestId('tabs-root');
      expect(root.style.getPropertyValue('--tabs-radius')).toBe('8px');
    });

    it('sets --tabs-radius from number', () => {
      renderTabs({ radius: 12 });
      const root = screen.getByTestId('tabs-root');
      expect(root.style.getPropertyValue('--tabs-radius')).toBe('12px');
    });
  });

  describe('Tabs.Tab sections', () => {
    it('renders leftSection', () => {
      render(
        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Tab value="a" leftSection={<span data-testid="left-icon">L</span>}>
              Tab
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Content</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders rightSection', () => {
      render(
        <Tabs defaultValue="a">
          <Tabs.List>
            <Tabs.Tab value="a" rightSection={<span data-testid="right-badge">R</span>}>
              Tab
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Content</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getByTestId('right-badge')).toBeInTheDocument();
    });
  });

  describe('Tabs.List', () => {
    it('sets data-grow when grow is true', () => {
      renderTabs();
      const list = screen.getByTestId('tabs-list');
      expect(list).not.toHaveAttribute('data-grow');

      render(
        <Tabs defaultValue="a">
          <Tabs.List grow data-testid="grow-list">
            <Tabs.Tab value="a">A</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">C</Tabs.Panel>
        </Tabs>,
      );
      expect(screen.getByTestId('grow-list')).toHaveAttribute('data-grow', 'true');
    });
  });

  describe('Context error', () => {
    it('throws when Tabs.Tab is used outside Tabs', () => {
      expect(() => {
        render(<Tabs.Tab value="a">Tab</Tabs.Tab>);
      }).toThrow('[PrismUI]');
    });

    it('throws when Tabs.Panel is used outside Tabs', () => {
      expect(() => {
        render(<Tabs.Panel value="a">Panel</Tabs.Panel>);
      }).toThrow('[PrismUI]');
    });

    it('throws when Tabs.List is used outside Tabs', () => {
      expect(() => {
        render(<Tabs.List>List</Tabs.List>);
      }).toThrow('[PrismUI]');
    });
  });
});
