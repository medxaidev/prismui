import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';
import { PrismuiProvider } from '../../core/PrismuiProvider';

const meta: Meta = {
  title: 'Core/Box',
  component: Box as any,
};

export default meta;

type Story = StoryObj;

function getStyleEngineSnapshot() {
  const styleEl = document.head.querySelector(
    'style[data-prismui-style-engine="true"]'
  ) as HTMLStyleElement | null;

  const rulesCount = styleEl?.sheet?.cssRules?.length ?? 0;
  const textLength = styleEl?.textContent?.length ?? 0;

  return { rulesCount, textLength };
}

function StyleEngineDebug() {
  const snapshot = useMemo(() => {
    if (typeof document === 'undefined') return { rulesCount: 0, textLength: 0 };
    return getStyleEngineSnapshot();
  }, []);

  return (
    <pre style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
      {JSON.stringify(snapshot, null, 2)}
    </pre>
  );
}

const demoCardStyle = {
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
} as any;

export const Basic: Story = {
  render: () => (
    <Box style={demoCardStyle}>
      Basic Box (no Provider)
    </Box>
  ),
};

export const Polymorphic: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Box component="button" style={demoCardStyle} type="button">
        component=&quot;button&quot;
      </Box>

      <Box
        component="a"
        style={demoCardStyle}
        href="https://example.com"
        target="_blank"
        rel="noreferrer"
      >
        component=&quot;a&quot; (link)
      </Box>
    </div>
  ),
};

export const StyleAndVars_MultiForms_ThemeAware: Story = {
  render: () => (
    <PrismuiProvider theme={{ spacingUnit: 10 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <Box
          m={2}
          __vars={[
            { '--story-color': '#7c3aed' },
            (theme: any) => ({ '--story-padding': `${(theme.spacingUnit ?? 4) * 2}px` } as any),
            [{ '--story-bg': '#f5f3ff' }],
          ] as any}
          style={[
            {
              border: '1px solid #ddd6fe',
              borderRadius: 10,
              background: 'var(--story-bg)' as any,
              color: 'var(--story-color)' as any,
            },
            (theme: any) => ({
              padding: `calc(${(theme.spacingUnit ?? 4) * 2}px * 1)` as any,
              boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
            }),
            [
              {
                outline: '1px dashed #a78bfa',
              },
              false as any,
              undefined,
            ],
          ] as any}
        >
          <div style={{ fontWeight: 600 }}>style + __vars multi-forms (Provider spacingUnit=10)</div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
            style: object + function(theme) + nested arrays
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
            __vars: object + function(theme) + nested arrays
          </div>
        </Box>
      </div>
    </PrismuiProvider>
  ),
};

export const RefForwarding: Story = {
  render: () => {
    function RefProbe() {
      const divRef = useRef<HTMLDivElement | null>(null);
      const buttonRef = useRef<HTMLButtonElement | null>(null);

      const [snapshot, setSnapshot] = useState({
        divTag: '',
        buttonTag: '',
      });

      useEffect(() => {
        setSnapshot({
          divTag: divRef.current?.tagName ?? '',
          buttonTag: buttonRef.current?.tagName ?? '',
        });
      }, []);

      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <Box ref={divRef} style={demoCardStyle}>
            default component (should be DIV)
          </Box>
          <Box ref={buttonRef} component="button" type="button" style={demoCardStyle}>
            component=&quot;button&quot; (should be BUTTON)
          </Box>

          <pre style={{ fontSize: 12, opacity: 0.8 }}>
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </div>
      );
    }

    return <RefProbe />;
  },
};

export const StylePrecedence_SystemPropsOverrideStyle: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Box
        m={2}
        __vars={{ '--story-margin': '40px' }}
        style={{
          ...demoCardStyle,
          background: '#fdf2f8',
          margin: '80px',
          outline: '1px solid #db2777',
        }}
      >
        style margin=80px + __vars --story-margin=40px + system m=2
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
          Expectation: system prop m wins (getBoxStyle merges: style → vars → system)
        </div>
      </Box>

      <Box
        m={2}
        style={{
          ...demoCardStyle,
          background: '#fdf2f8',
          margin: 'var(--story-margin)' as any,
        }}
        __vars={{ '--story-margin': '80px' }}
      >
        style margin=var(--story-margin) + __vars --story-margin=80px + system m=2
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
          Expectation: still system prop m wins
        </div>
      </Box>
    </div>
  ),
};

export const SystemProps_NonResponsive: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Box m={2} style={{ ...demoCardStyle, background: '#f8fafc' }}>
        m=2 (number) =&gt; inline margin
      </Box>
      <Box m="md" style={{ ...demoCardStyle, background: '#f8fafc' }}>
        m=&quot;md&quot; (token) =&gt; inline margin via CSS var
      </Box>
      <Box m="-md" style={{ ...demoCardStyle, background: '#f8fafc' }}>
        m=&quot;-md&quot; (negative token) =&gt; inline margin via calc
      </Box>
    </div>
  ),
};

export const SystemProps_Responsive_WithBase: Story = {
  render: () => (
    <div>
      <Box m={{ base: 2, sm: 6, md: 10 } as any} style={{ ...demoCardStyle, background: '#fff7ed' }}>
        <code>{'m={{ base: 2, sm: 6, md: 10 }}'}</code> (responsive class injected)
      </Box>
      <StyleEngineDebug />
    </div>
  ),
};

export const SystemProps_Responsive_MobileFirst: Story = {
  render: () => (
    <div>
      <Box m={{ base: 1, md: 4 } as any} style={{ ...demoCardStyle, background: '#ecfeff' }}>
        <code>{'m={{ base: 1, md: 4 }}'}</code> (mobile-first: base=1, md enhances to 4)
      </Box>
      <StyleEngineDebug />
    </div>
  ),
};

export const SystemProps_SingleBreakpoint_TreatedAsBase: Story = {
  render: () => (
    <Box m={{ sm: 2 } as any} style={{ ...demoCardStyle, background: '#f0fdf4' }}>
      <code>{'m={{ sm: 2 }}'}</code> (only one bp; treated as non-responsive base)
    </Box>
  ),
};

export const InlineStyles_Dedupe: Story = {
  render: () => (
    <div>
      <div style={{ display: 'grid', gap: 12 }}>
        <Box m={{ base: 2, sm: 6 } as any} style={{ ...demoCardStyle, background: '#fefce8' }}>
          Box A: m responsive
        </Box>
        <Box m={{ base: 2, sm: 6 } as any} style={{ ...demoCardStyle, background: '#fefce8' }}>
          Box B: same responsive config (should reuse same injected rule)
        </Box>
        <Box m={{ base: 1, sm: 5 } as any} style={{ ...demoCardStyle, background: '#fefce8' }}>
          Box C: different responsive config (should insert a new rule)
        </Box>
      </div>
      <StyleEngineDebug />
    </div>
  ),
};

export const WithProvider_ThemeOverride: Story = {
  render: () => (
    <PrismuiProvider theme={{ spacingUnit: 8 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <Box m={{ base: 1, md: 3, lg: 6 } as any} style={{ ...demoCardStyle, background: '#eff6ff' }}>
          With Provider: spacingUnit=8, m base→md→lg
        </Box>
        <Box style={{ ...demoCardStyle, background: '#eff6ff' }}>
          Another Box under same provider
        </Box>
      </div>
      <StyleEngineDebug />
    </PrismuiProvider>
  ),
};

export const Vars: Story = {
  render: () => (
    <Box
      __vars={{ '--story-accent': '#ef4444' }}
      style={{
        ...demoCardStyle,
        background: '#fff1f2',
        borderColor: 'var(--story-accent)' as any,
        color: 'var(--story-accent)' as any,
      }}
    >
      __vars merges into style (CSS variables)
    </Box>
  ),
};

export const Provider_DefaultInjectsBaselineAndVars: Story = {
  render: () => {
    function getStyleEngineText() {
      const styleEl = document.head.querySelector(
        'style[data-prismui-style-engine="true"]'
      ) as HTMLStyleElement | null;
      const sheet = styleEl?.sheet as CSSStyleSheet | null;
      const rulesText = sheet
        ? Array.from(sheet.cssRules).map((r) => (r as CSSRule).cssText).join('\n')
        : (styleEl?.textContent ?? '');
      return rulesText;
    }

    function Probe() {
      const cssText = useMemo(() => {
        if (typeof document === 'undefined') return '';
        return getStyleEngineText();
      }, []);

      const snapshot = useMemo(() => {
        const normalized = cssText.replace(/\s+/g, '');
        const hasScale = cssText.includes('--prismui-scale');
        const hasSpacingMd = cssText.includes('--prismui-spacing-md');
        const hasBoxSizing = normalized.includes('box-sizing:border-box');
        const hasBodyMargin = /body\{margin:0(px)?;?\}/.test(normalized);
        return { hasScale, hasSpacingMd, hasBoxSizing, hasBodyMargin };
      }, [cssText]);

      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <Box style={demoCardStyle}>
            Provider default injects ThemeVars + CssBaseline
          </Box>
          <pre style={{ fontSize: 12, opacity: 0.85 }}>
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <PrismuiProvider>
        <Probe />
      </PrismuiProvider>
    );
  },
};

export const ClassNameAndStyleMerging: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Box
        className="external-class"
        m={2}
        style={{ background: '#111827', color: '#f9fafb', padding: 12, borderRadius: 8 }}
      >
        className + inline style + system props
      </Box>

      <Box
        m={2}
        style={(theme) => ({
          background: '#0f766e',
          color: '#ffffff',
          padding: (theme.spacingUnit ?? 4) * 3,
          borderRadius: 8,
        })}
      >
        style as function(theme)
      </Box>

      <Box
        m={2}
        style={[
          { background: '#1d4ed8', color: '#fff', padding: 12, borderRadius: 8 },
          false as any,
          undefined,
        ]}
      >
        style as array (nested/conditional items)
      </Box>
    </div>
  ),
};

export const MuiInspiredProps: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Box
        display="flex"
        gap={4}
        alignItems="center"
        style={{ ...demoCardStyle, background: '#f0f9ff' }}
      >
        <div style={{ width: 24, height: 24, background: '#3b82f6', borderRadius: 4 }} />
        <span>display=flex + gap=4 + alignItems=center</span>
      </Box>

      <Box
        overflow="hidden"
        z={10}
        pos="relative"
        cursor="pointer"
        style={{ ...demoCardStyle, background: '#fefce8' }}
      >
        overflow=hidden + z=10 + pos=relative + cursor=pointer
      </Box>

      <Box
        flexDirection="column"
        display="flex"
        gap={2}
        style={{ ...demoCardStyle, background: '#f0fdf4' }}
      >
        <span>flexDirection=column</span>
        <span>display=flex + gap=2</span>
      </Box>
    </div>
  ),
};
