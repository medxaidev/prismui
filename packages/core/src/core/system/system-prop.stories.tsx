import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../PrismuiProvider';
import { Box } from '../../components/Box/Box';
import { SYSTEM_CONFIG } from './system-config';

const meta: Meta = {
  title: 'Core/SystemProps',
};

export default meta;

type Story = StoryObj;

type ConfigKey = keyof typeof SYSTEM_CONFIG;

type PropCase = {
  prop: ConfigKey;
  cssProperty: string;
  value: any;
};

function toKebabCase(input: string) {
  return input.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

const demoCardStyle = {
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
} as any;

function buildCases(): PropCase[] {
  const keys = Object.keys(SYSTEM_CONFIG) as ConfigKey[];

  const cases: PropCase[] = keys.map((k) => {
    const conf = SYSTEM_CONFIG[k];

    let value: any;

    switch (k) {
      // spacing
      case 'm':
      case 'mt':
      case 'mb':
      case 'ml':
      case 'mr':
      case 'ms':
      case 'me':
      case 'mx':
      case 'my':
      case 'p':
      case 'pt':
      case 'pb':
      case 'pl':
      case 'pr':
      case 'ps':
      case 'pe':
      case 'px':
      case 'py':
      case 'gap':
      case 'rowGap':
      case 'columnGap':
        value = 'md';
        break;

      // border & radius
      case 'bd':
        value = '1px solid rgba(0,0,0,0.2)';
        break;
      case 'bdrs':
        value = 'theme';
        break;

      // colors
      case 'bg':
        value = 'blue.500';
        break;
      case 'c':
        value = 'white';
        break;

      // typography
      case 'ff':
        value = 'sans';
        break;
      case 'fz':
        value = 16;
        break;
      case 'fw':
        value = 600;
        break;
      case 'lts':
        value = 1;
        break;
      case 'ta':
        value = 'center';
        break;
      case 'lh':
        value = 'md';
        break;
      case 'fs':
        value = 'italic';
        break;
      case 'tt':
        value = 'uppercase';
        break;
      case 'td':
        value = 'underline';
        break;

      // sizing/layout
      case 'w':
        value = 200;
        break;
      case 'miw':
        value = 160;
        break;
      case 'maw':
        value = 260;
        break;
      case 'h':
        value = 56;
        break;
      case 'mih':
        value = 40;
        break;
      case 'mah':
        value = 120;
        break;

      // background
      case 'bgsz':
        value = 'cover';
        break;
      case 'bgp':
        value = 'center';
        break;
      case 'bgr':
        value = 'no-repeat';
        break;
      case 'bga':
        value = 'scroll';
        break;

      // positioning
      case 'pos':
        value = 'relative';
        break;
      case 'top':
      case 'left':
      case 'bottom':
      case 'right':
      case 'inset':
        value = 8;
        break;

      // display & flex
      case 'display':
        value = 'inline-flex';
        break;
      case 'flex':
        value = '0 0 auto';
        break;
      case 'alignItems':
        value = 'center';
        break;
      case 'justifyContent':
        value = 'center';
        break;
      case 'flexWrap':
        value = 'wrap';
        break;
      case 'flexDirection':
        value = 'row';
        break;
      case 'flexGrow':
        value = 1;
        break;
      case 'flexShrink':
        value = 0;
        break;

      // misc
      case 'opacity':
        value = 0.85;
        break;
      case 'overflow':
        value = 'hidden';
        break;
      case 'cursor':
        value = 'pointer';
        break;
      case 'visibility':
        value = 'visible';
        break;
      case 'z':
        value = 10;
        break;

      default:
        value = undefined;
    }

    return {
      prop: k,
      cssProperty: String(conf.cssProperty),
      value,
    };
  });

  return cases.filter((c) => c.value !== undefined);
}

function ComputedValueRow(props: {
  title: string;
  systemProp: string;
  cssProperty: string;
  value: any;
}) {
  const { title, systemProp, cssProperty, value } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [computed, setComputed] = useState('');

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const styles = getComputedStyle(el);
    const camel = (styles as any)[cssProperty];
    const kebab = styles.getPropertyValue(toKebabCase(cssProperty));
    const resolved = (camel ?? '').trim?.() ? camel : kebab;
    setComputed(String(resolved).trim());
  }, [cssProperty, value]);

  return (
    <div style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid #e5e7eb', borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {systemProp} → {cssProperty}
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.85 }}>
        value: <code>{JSON.stringify(value)}</code>
      </div>

      <Box
        ref={ref as any}
        {...({ [systemProp]: value } as any)}
        style={{
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 6,
          background: '#fafafa',
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.85 }}>sample</span>
        <span style={{ fontSize: 12 }}>computed:</span>
        <code style={{ fontSize: 12 }}>{computed || '(empty)'}</code>
      </Box>
    </div>
  );
}

export const All_SystemProps: Story = {
  render: () => {
    const cases = useMemo(() => buildCases(), []);

    return (
      <PrismuiProvider theme={{ spacingUnit: 8 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Box style={demoCardStyle}>
            System Props matrix (auto from <code>SYSTEM_CONFIG</code>)
          </Box>

          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Total: <b>{cases.length}</b>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {cases.map((c) => (
              <ComputedValueRow
                key={String(c.prop)}
                title={String(c.prop)}
                systemProp={String(c.prop)}
                cssProperty={c.cssProperty}
                value={c.value}
              />
            ))}
          </div>

          <Box style={{ ...demoCardStyle, fontSize: 12, opacity: 0.8 }}>
            Note: for some props (like <code>position</code> + offsets), the element may still appear the same visually, but the computed style should update.
          </Box>
        </div>
      </PrismuiProvider>
    );
  },
};

export const Responsive_MobileFirst: Story = {
  render: () => (
    <PrismuiProvider>
      <div style={{ display: 'grid', gap: 12 }}>
        <Box style={demoCardStyle}>Mobile-first responsive system props</Box>

        <Box
          p={{ base: 'sm', md: 'lg' } as any}
          m={{ base: 2, md: 4 } as any}
          bg="blue.500"
          c="white"
          bdrs="theme"
          style={{ ...demoCardStyle, borderColor: 'transparent' }}
        >
          <div style={{ fontWeight: 700 }}>Responsive spacing + tokens</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            <code>{'p={{ base: "sm", md: "lg" }}'}</code>{' '}
            <code>{'m={{ base: 2, md: 4 }}'}</code>
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            Resize viewport to see padding/margin change at md breakpoint.
          </div>
        </Box>

        <Box
          p={{ base: 'sm', md: 'lg' } as any}
          m={{ base: 2, md: 4 } as any}
          bg="blue.500"
          c="white"
          bdrs="theme"
          style={{ ...demoCardStyle, borderColor: 'transparent' }}
        >
          <div style={{ fontWeight: 700 }}>Same config (should dedupe CSS)</div>
        </Box>
      </div>
    </PrismuiProvider>
  ),
};
