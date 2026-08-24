/**
 * Stage-16 · Responsive system · Storybook (production · replaces deleted PoC).
 *
 * Demonstrates the CSS-first responsive props (Stack/Grid/Inline/Box) plus
 * the opt-in client hooks (useBreakpoint / useMediaQuery / up).
 *
 * HOW TO VERIFY: resize the preview viewport (or use the Storybook viewport
 * toolbar) across the 5 breakpoints — xs 576 · sm 768 · md 992 · lg 1200 ·
 * xl 1400 px. Values should snap at each min-width threshold. Below 576px
 * the component scalar default applies.
 */
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Stack } from './Stack/Stack';
import { Grid } from './Grid/Grid';
import { Box } from './Box/Box';
import { useBreakpoint, useMediaQuery } from '../../hooks';
import { up } from '../../core/responsive';

function Item({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: '#e0ecff',
        border: '1px solid #93b4f5',
        borderRadius: 4,
        padding: '8px 12px',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

const meta: Meta = {
  title: 'Primitives/Layout/Responsive',
};
export default meta;

type Story = StoryObj;

/** Stack gap that grows with the viewport. Resize to observe. */
export const ResponsiveGap: Story = {
  render: () => (
    <Stack gap={{ xs: 'xs', md: 'lg', xl: '3xl' }}>
      <Item>gap = xs:xs · md:lg · xl:3xl</Item>
      <Item>resize the viewport →</Item>
      <Item>watch the vertical gap change</Item>
    </Stack>
  ),
};

/** Grid columns that reflow: 1 → 2 → 4 across breakpoints. */
export const ResponsiveColumns: Story = {
  render: () => (
    <Grid columns={{ xs: 1, md: 2, lg: 4 }} gap="md">
      {Array.from({ length: 8 }, (_, i) => (
        <Item key={i}>{i + 1}</Item>
      ))}
    </Grid>
  ),
};

/** Box padding that scales with the viewport. */
export const ResponsiveBoxPadding: Story = {
  render: () => (
    <Box
      padding={{ xs: 'sm', lg: '3xl' }}
      style={{ background: '#f1f5f9', border: '1px dashed #94a3b8' }}
    >
      <Item>padding = xs:sm · lg:3xl</Item>
    </Box>
  ),
};

/** Client hooks: live-report the current breakpoint + a media-query match. */
export const HooksDemo: Story = {
  render: () => {
    const bp = useBreakpoint();
    const isDesktop = useMediaQuery(up('lg'));
    return (
      <Stack gap="sm">
        <Item>useBreakpoint() → {String(bp)}</Item>
        <Item>useMediaQuery(up(&apos;lg&apos;)) → {String(isDesktop)}</Item>
        <Item>resize to watch both update live</Item>
      </Stack>
    );
  },
};
