import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardLayout } from './DashboardLayout';
import { useNavbarState } from './DashboardLayout.context';

// ---------------------------------------------------------------------------
// Mock matchMedia (not available in JSDOM)
// ---------------------------------------------------------------------------

let originalMatchMedia: typeof window.matchMedia;

beforeAll(() => {
  originalMatchMedia = window.matchMedia;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderDashboard(props: Partial<React.ComponentProps<typeof DashboardLayout>> = {}) {
  return render(
    <DashboardLayout data-testid="dl-root" {...props}>
      <DashboardLayout.Header data-testid="dl-header">Header</DashboardLayout.Header>
      <DashboardLayout.Navbar data-testid="dl-navbar">
        <DashboardLayout.Section data-testid="dl-section-top">Top</DashboardLayout.Section>
        <DashboardLayout.Section data-testid="dl-section-grow" grow>Nav Items</DashboardLayout.Section>
      </DashboardLayout.Navbar>
      <DashboardLayout.Main data-testid="dl-main">Main Content</DashboardLayout.Main>
    </DashboardLayout>,
  );
}

// Helper component that uses useNavbarState
function NavbarToggle() {
  const { collapsed, mobileOpened, toggleCollapse, toggleMobile } = useNavbarState();
  return (
    <div>
      <span data-testid="collapsed-state">{String(collapsed)}</span>
      <span data-testid="mobile-state">{String(mobileOpened)}</span>
      <button data-testid="toggle-collapse" onClick={toggleCollapse}>Toggle</button>
      <button data-testid="toggle-mobile" onClick={toggleMobile}>Mobile</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardLayout', () => {
  describe('Rendering', () => {
    it('renders root, header, navbar, and main', () => {
      renderDashboard();
      expect(screen.getByTestId('dl-root')).toBeInTheDocument();
      expect(screen.getByTestId('dl-header')).toBeInTheDocument();
      expect(screen.getByTestId('dl-navbar')).toBeInTheDocument();
      expect(screen.getByTestId('dl-main')).toBeInTheDocument();
    });

    it('renders children content', () => {
      renderDashboard();
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('forwards ref to root element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <DashboardLayout ref={ref}>
          <DashboardLayout.Main>Content</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('has correct displayName', () => {
      expect(DashboardLayout.displayName).toBe('@prismui/core/DashboardLayout');
    });

    it('exposes compound components', () => {
      expect(DashboardLayout.Header).toBeDefined();
      expect(DashboardLayout.Navbar).toBeDefined();
      expect(DashboardLayout.Main).toBeDefined();
      expect(DashboardLayout.Section).toBeDefined();
    });
  });

  describe('Layout mode', () => {
    it('defaults to layout="alt"', () => {
      renderDashboard();
      expect(screen.getByTestId('dl-root')).toHaveAttribute('data-layout', 'alt');
    });

    it('sets data-layout="default"', () => {
      renderDashboard({ layout: 'default' });
      expect(screen.getByTestId('dl-root')).toHaveAttribute('data-layout', 'default');
    });
  });

  describe('CSS variables', () => {
    it('sets --dl-navbar-width (expanded by default)', () => {
      renderDashboard();
      const root = screen.getByTestId('dl-root');
      expect(root.style.getPropertyValue('--dl-navbar-width')).toBe('280px');
    });

    it('sets --dl-header-height', () => {
      renderDashboard({ header: { height: 80 } });
      const root = screen.getByTestId('dl-root');
      expect(root.style.getPropertyValue('--dl-header-height')).toBe('80px');
    });

    it('sets custom navbar width', () => {
      renderDashboard({ navbar: { width: 300 } });
      const root = screen.getByTestId('dl-root');
      expect(root.style.getPropertyValue('--dl-navbar-width')).toBe('300px');
    });

    it('sets --dl-transition-duration', () => {
      renderDashboard({ transitionDuration: 300 });
      const root = screen.getByTestId('dl-root');
      expect(root.style.getPropertyValue('--dl-transition-duration')).toBe('300ms');
    });
  });

  describe('Borders', () => {
    it('sets data-with-border on header by default', () => {
      renderDashboard();
      expect(screen.getByTestId('dl-header')).toHaveAttribute('data-with-border', 'true');
    });

    it('sets data-with-border on navbar by default', () => {
      renderDashboard();
      expect(screen.getByTestId('dl-navbar')).toHaveAttribute('data-with-border', 'true');
    });

    it('removes borders when withBorder=false', () => {
      renderDashboard({ withBorder: false });
      expect(screen.getByTestId('dl-header')).not.toHaveAttribute('data-with-border');
      expect(screen.getByTestId('dl-navbar')).not.toHaveAttribute('data-with-border');
    });
  });

  describe('Navbar collapse (uncontrolled)', () => {
    it('starts expanded (not collapsed)', () => {
      renderDashboard();
      expect(screen.getByTestId('dl-navbar')).not.toHaveAttribute('data-collapsed');
    });

    it('collapses navbar via useNavbarState toggle', () => {
      render(
        <DashboardLayout>
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Navbar data-testid="dl-navbar">Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      expect(screen.getByTestId('collapsed-state').textContent).toBe('true');
      expect(screen.getByTestId('dl-navbar')).toHaveAttribute('data-collapsed', 'true');
    });

    it('sets mini width when collapsed', () => {
      render(
        <DashboardLayout data-testid="dl-root">
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Navbar>Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      const root = screen.getByTestId('dl-root');
      expect(root.style.getPropertyValue('--dl-navbar-width')).toBe('88px');
    });

    it('calls onNavbarCollapse callback', () => {
      const onCollapse = vi.fn();
      render(
        <DashboardLayout onNavbarCollapse={onCollapse}>
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Navbar>Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      expect(onCollapse).toHaveBeenCalledWith(true);
    });
  });

  describe('Navbar collapse (controlled)', () => {
    it('respects controlled desktop collapsed state', () => {
      render(
        <DashboardLayout
          data-testid="dl-root"
          navbar={{ collapsed: { desktop: true } }}
        >
          <DashboardLayout.Navbar data-testid="dl-navbar">Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(screen.getByTestId('dl-navbar')).toHaveAttribute('data-collapsed', 'true');
      expect(screen.getByTestId('dl-root').style.getPropertyValue('--dl-navbar-width')).toBe('88px');
    });

    it('respects controlled mobile opened state', () => {
      render(
        <DashboardLayout navbar={{ collapsed: { mobile: true } }}>
          <DashboardLayout.Navbar data-testid="dl-navbar">Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(screen.getByTestId('dl-navbar')).toHaveAttribute('data-opened', 'true');
    });
  });

  describe('Mobile drawer', () => {
    it('toggles mobile opened via useNavbarState', () => {
      render(
        <DashboardLayout>
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Navbar data-testid="dl-navbar">Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(screen.getByTestId('mobile-state').textContent).toBe('false');
      fireEvent.click(screen.getByTestId('toggle-mobile'));
      expect(screen.getByTestId('mobile-state').textContent).toBe('true');
      expect(screen.getByTestId('dl-navbar')).toHaveAttribute('data-opened', 'true');
    });

    it('calls onNavbarMobileChange callback', () => {
      const onMobile = vi.fn();
      render(
        <DashboardLayout onNavbarMobileChange={onMobile}>
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Navbar>Nav</DashboardLayout.Navbar>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      fireEvent.click(screen.getByTestId('toggle-mobile'));
      expect(onMobile).toHaveBeenCalledWith(true);
    });
  });

  describe('Section', () => {
    it('renders section content', () => {
      renderDashboard();
      expect(screen.getByText('Top')).toBeInTheDocument();
      expect(screen.getByText('Nav Items')).toBeInTheDocument();
    });

    it('sets data-grow on grow section', () => {
      renderDashboard();
      expect(screen.getByTestId('dl-section-top')).not.toHaveAttribute('data-grow');
      expect(screen.getByTestId('dl-section-grow')).toHaveAttribute('data-grow', 'true');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to root', () => {
      renderDashboard({ className: 'my-dashboard' });
      expect(screen.getByTestId('dl-root')).toHaveClass('my-dashboard');
    });

    it('applies custom className to header', () => {
      render(
        <DashboardLayout>
          <DashboardLayout.Header className="my-header" data-testid="dl-header">H</DashboardLayout.Header>
          <DashboardLayout.Main>M</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(screen.getByTestId('dl-header')).toHaveClass('my-header');
    });
  });

  describe('Context errors', () => {
    it('throws when Header is used outside DashboardLayout', () => {
      expect(() => {
        render(<DashboardLayout.Header>H</DashboardLayout.Header>);
      }).toThrow('[PrismUI]');
    });

    it('throws when Navbar is used outside DashboardLayout', () => {
      expect(() => {
        render(<DashboardLayout.Navbar>N</DashboardLayout.Navbar>);
      }).toThrow('[PrismUI]');
    });

    it('throws when useNavbarState is used outside DashboardLayout', () => {
      expect(() => {
        render(<NavbarToggle />);
      }).toThrow('[PrismUI]');
    });
  });

  describe('useNavbarState hook', () => {
    it('returns correct initial state', () => {
      render(
        <DashboardLayout>
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
      expect(screen.getByTestId('mobile-state').textContent).toBe('false');
    });

    it('toggleCollapse toggles collapsed state', () => {
      render(
        <DashboardLayout>
          <DashboardLayout.Header><NavbarToggle /></DashboardLayout.Header>
          <DashboardLayout.Main>Main</DashboardLayout.Main>
        </DashboardLayout>,
      );
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      expect(screen.getByTestId('collapsed-state').textContent).toBe('true');
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
    });
  });
});
