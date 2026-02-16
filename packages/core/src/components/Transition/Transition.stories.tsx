import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Transition } from './Transition';
import { TransitionGroup } from './TransitionGroup';
import { SwitchTransition } from './SwitchTransition';
import type { PrismuiTransitionName } from './transitions';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Transition> = {
  title: 'Components/Transition',
  component: Transition,
};

export default meta;
type Story = StoryObj<typeof Transition>;

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 20,
  marginBottom: 16,
};

const box: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 700,
};

const label: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 4,
  fontFamily: 'monospace',
};

const btn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: '#3b82f6',
  color: '#fff',
  border: '1px solid #3b82f6',
};

// ---------------------------------------------------------------------------
// 1. Basic Fade
// ---------------------------------------------------------------------------

export const BasicFade: Story = {
  name: '1. Basic Fade',
  render: () => {
    const [mounted, setMounted] = useState(true);
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Basic Fade Transition</h3>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide' : 'Show'}
          </button>
          <div style={{ marginTop: 16, minHeight: 130 }}>
            <Transition mounted={mounted} transition="fade" duration={300}>
              {(styles) => (
                <div style={{ ...box, ...styles, background: '#3b82f6' }}>
                  Fade
                </div>
              )}
            </Transition>
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 2. Generic Effects (fade, grow, zoom)
// ---------------------------------------------------------------------------

export const GenericEffects: Story = {
  name: '2. Generic Effects',
  render: () => {
    const [mounted, setMounted] = useState(true);
    const effects: PrismuiTransitionName[] = ['fade', 'grow', 'zoom'];
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899'];

    return (
      <div style={{ maxWidth: 700 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Fade / Grow / Zoom</h3>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide All' : 'Show All'}
          </button>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, minHeight: 130 }}>
            {effects.map((effect, i) => (
              <div key={effect}>
                <div style={label}>{effect}</div>
                <Transition mounted={mounted} transition={effect} duration={300}>
                  {(styles) => (
                    <div style={{ ...box, ...styles, background: colors[i] }}>
                      {effect}
                    </div>
                  )}
                </Transition>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 3. Placement Transitions (Tooltip/Popover style)
// ---------------------------------------------------------------------------

export const PlacementTransitions: Story = {
  name: '3. Placement Transitions',
  render: () => {
    const [mounted, setMounted] = useState(true);
    const placements: PrismuiTransitionName[] = [
      'top-start', 'top', 'top-end',
      'bottom-start', 'bottom', 'bottom-end',
      'left-start', 'left', 'left-end',
      'right-start', 'right', 'right-end',
    ];

    return (
      <div style={{ maxWidth: 900 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Placement-Based Transitions</h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
            Used for tooltips, popovers, and dropdowns. Each placement slides from
            the appropriate direction with a subtle scale effect.
          </p>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide All' : 'Show All'}
          </button>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginTop: 16,
          }}>
            {placements.map((placement) => (
              <div key={placement}>
                <div style={label}>{placement}</div>
                <Transition mounted={mounted} transition={placement} duration={225}>
                  {(styles) => (
                    <div style={{
                      ...styles,
                      padding: '12px 16px',
                      background: '#1e293b',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                      {placement}
                    </div>
                  )}
                </Transition>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 4. Slide Directions
// ---------------------------------------------------------------------------

export const SlideDirections: Story = {
  name: '4. Slide Directions',
  render: () => {
    const [mounted, setMounted] = useState(true);
    const slides: PrismuiTransitionName[] = ['slide-up', 'slide-down', 'slide-left', 'slide-right'];
    const colors = ['#059669', '#0891b2', '#d97706', '#dc2626'];

    return (
      <div style={{ maxWidth: 700 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Slide Directions</h3>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide All' : 'Show All'}
          </button>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, minHeight: 130, overflow: 'hidden' }}>
            {slides.map((slide, i) => (
              <div key={slide}>
                <div style={label}>{slide}</div>
                <Transition mounted={mounted} transition={slide} duration={300}>
                  {(styles) => (
                    <div style={{ ...box, ...styles, background: colors[i] }}>
                      {slide}
                    </div>
                  )}
                </Transition>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 5. Custom Transition
// ---------------------------------------------------------------------------

export const CustomTransition: Story = {
  name: '5. Custom Transition',
  render: () => {
    const [mounted, setMounted] = useState(true);

    const rotateFlip = {
      in: { opacity: 1, transform: 'perspective(600px) rotateY(0deg)' },
      out: { opacity: 0, transform: 'perspective(600px) rotateY(90deg)' },
      transitionProperty: 'opacity, transform',
    };

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Custom Transition Object</h3>
          <div style={label}>{'{ in: rotateY(0), out: rotateY(90deg) }'}</div>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide' : 'Show'}
          </button>
          <div style={{ marginTop: 16, minHeight: 130 }}>
            <Transition mounted={mounted} transition={rotateFlip} duration={400}>
              {(styles) => (
                <div style={{ ...box, ...styles, background: '#7c3aed', width: 160 }}>
                  Custom Flip
                </div>
              )}
            </Transition>
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 6. Duration & Timing
// ---------------------------------------------------------------------------

export const DurationAndTiming: Story = {
  name: '6. Duration & Timing',
  render: () => {
    const [mounted, setMounted] = useState(true);

    return (
      <div style={{ maxWidth: 700 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Duration & Timing Function</h3>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide All' : 'Show All'}
          </button>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, minHeight: 130 }}>
            <div>
              <div style={label}>150ms (shortest)</div>
              <Transition mounted={mounted} transition="grow" duration={150}>
                {(styles) => (
                  <div style={{ ...box, ...styles, background: '#3b82f6', width: 100 }}>150ms</div>
                )}
              </Transition>
            </div>
            <div>
              <div style={label}>300ms (standard)</div>
              <Transition mounted={mounted} transition="grow" duration={300}>
                {(styles) => (
                  <div style={{ ...box, ...styles, background: '#8b5cf6', width: 100 }}>300ms</div>
                )}
              </Transition>
            </div>
            <div>
              <div style={label}>500ms (slow)</div>
              <Transition mounted={mounted} transition="grow" duration={500}>
                {(styles) => (
                  <div style={{ ...box, ...styles, background: '#ec4899', width: 100 }}>500ms</div>
                )}
              </Transition>
            </div>
            <div>
              <div style={label}>300ms easeIn</div>
              <Transition mounted={mounted} transition="grow" duration={300} timingFunction="cubic-bezier(0.4, 0, 1, 1)">
                {(styles) => (
                  <div style={{ ...box, ...styles, background: '#059669', width: 100 }}>easeIn</div>
                )}
              </Transition>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 7. keepMounted
// ---------------------------------------------------------------------------

export const KeepMounted: Story = {
  name: '7. keepMounted',
  render: () => {
    const [mounted, setMounted] = useState(true);
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>keepMounted (display: none instead of unmount)</h3>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide' : 'Show'}
          </button>
          <div style={{ marginTop: 16, minHeight: 130 }}>
            <Transition mounted={mounted} transition="fade" duration={250} keepMounted>
              {(styles) => (
                <div style={{ ...box, ...styles, background: '#0891b2' }}>
                  keepMounted
                </div>
              )}
            </Transition>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Element stays in DOM with display:none when hidden
          </p>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 8. TransitionGroup
// ---------------------------------------------------------------------------

export const TransitionGroupStory: Story = {
  name: '8. TransitionGroup',
  render: () => {
    const [items, setItems] = useState([1, 2, 3]);
    const nextId = React.useRef(4);

    const addItem = () => {
      setItems((prev) => [...prev, nextId.current++]);
    };

    const removeItem = (id: number) => {
      setItems((prev) => prev.filter((i) => i !== id));
    };

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>TransitionGroup — List Animation</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button style={btnPrimary} onClick={addItem}>Add Item</button>
          </div>
          <TransitionGroup style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((id) => (
              <Transition key={id} mounted transition="fade" duration={250}>
                {(styles) => (
                  <div style={{
                    ...styles,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#f1f5f9',
                    borderRadius: 6,
                    fontSize: 14,
                  }}>
                    <span>Item #{id}</span>
                    <button
                      style={{ ...btn, fontSize: 11, padding: '4px 8px' }}
                      onClick={() => removeItem(id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </Transition>
            ))}
          </TransitionGroup>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 9. SwitchTransition
// ---------------------------------------------------------------------------

export const SwitchTransitionStory: Story = {
  name: '9. SwitchTransition (out-in)',
  render: () => {
    const [tab, setTab] = useState<'A' | 'B' | 'C'>('A');
    const colors = { A: '#3b82f6', B: '#8b5cf6', C: '#ec4899' };

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>SwitchTransition — Tab Switch (out-in)</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['A', 'B', 'C'] as const).map((t) => (
              <button
                key={t}
                style={tab === t ? btnPrimary : btn}
                onClick={() => setTab(t)}
              >
                Tab {t}
              </button>
            ))}
          </div>
          <div style={{ minHeight: 140 }}>
            <SwitchTransition mode="out-in">
              <Transition key={tab} mounted transition="fade" duration={200}>
                {(styles) => (
                  <div style={{
                    ...styles,
                    ...box,
                    width: '100%',
                    background: colors[tab],
                  }}>
                    Content {tab}
                  </div>
                )}
              </Transition>
            </SwitchTransition>
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 10. Callbacks
// ---------------------------------------------------------------------------

export const Callbacks: Story = {
  name: '10. Callbacks',
  render: () => {
    const [mounted, setMounted] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => {
      setLog((prev) => [...prev.slice(-6), `${new Date().toLocaleTimeString()} — ${msg}`]);
    };

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Transition Callbacks</h3>
          <button style={btnPrimary} onClick={() => setMounted((v) => !v)}>
            {mounted ? 'Hide' : 'Show'}
          </button>
          <div style={{ marginTop: 16, minHeight: 130 }}>
            <Transition
              mounted={mounted}
              transition="grow"
              duration={300}
              onEnter={() => addLog('onEnter')}
              onEntered={() => addLog('onEntered')}
              onExit={() => addLog('onExit')}
              onExited={() => addLog('onExited')}
            >
              {(styles) => (
                <div style={{ ...box, ...styles, background: '#059669' }}>
                  Grow
                </div>
              )}
            </Transition>
          </div>
          <div style={{
            marginTop: 12,
            padding: 12,
            background: '#f8fafc',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'monospace',
            minHeight: 80,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Event Log:</div>
            {log.map((entry, i) => (
              <div key={i} style={{ color: '#4b5563' }}>{entry}</div>
            ))}
            {log.length === 0 && <div style={{ color: '#9ca3af' }}>Click Show to start...</div>}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 11. API Reference
// ---------------------------------------------------------------------------

export const APIReference: Story = {
  name: '11. API Reference',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Transition API Reference</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Prop</th>
              <th style={{ padding: '8px 12px' }}>Type</th>
              <th style={{ padding: '8px 12px' }}>Default</th>
              <th style={{ padding: '8px 12px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['mounted', 'boolean', '—', 'Controls visibility'],
              ['transition', 'PrismuiTransitionName | TransitionStyles', "'fade'", 'Transition preset or custom object'],
              ['duration', 'number', '225', 'Enter duration (ms)'],
              ['exitDuration', 'number', 'duration', 'Exit duration (ms)'],
              ['timingFunction', 'string', "'cubic-bezier(0.4,0,0.2,1)'", 'CSS timing function'],
              ['keepMounted', 'boolean', 'false', 'Keep in DOM with display:none'],
              ['enterDelay', 'number', '—', 'Delay before enter (ms)'],
              ['exitDelay', 'number', '—', 'Delay before exit (ms)'],
              ['onEnter', '() => void', '—', 'Called when enter starts'],
              ['onEntered', '() => void', '—', 'Called when enter ends'],
              ['onExit', '() => void', '—', 'Called when exit starts'],
              ['onExited', '() => void', '—', 'Called when exit ends'],
              ['reduceMotion', 'boolean', 'false', 'Skip animation'],
            ].map(([prop, type, def, desc]) => (
              <tr key={prop} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{prop}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{type}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#9ca3af' }}>{def}</td>
                <td style={{ padding: '8px 12px' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Available Presets (19 total)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Category</th>
              <th style={{ padding: '8px 12px' }}>Names</th>
              <th style={{ padding: '8px 12px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Placement', 'top, top-start, top-end, bottom, bottom-start, bottom-end, left, left-start, left-end, right, right-start, right-end', 'Tooltip/popover style with translate3d + scale3d'],
              ['Generic', 'fade, grow, zoom', 'Common effects'],
              ['Slide', 'slide-up, slide-down, slide-left, slide-right', 'Full-distance slide with translate3d'],
            ].map(([cat, names, desc]) => (
              <tr key={cat} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{cat}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{names}</td>
                <td style={{ padding: '8px 12px' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Theme Transition Config</h3>
        <pre style={{ background: '#f8fafc', padding: 16, borderRadius: 6, fontSize: 12, overflow: 'auto' }}>
{`theme.transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
}`}
        </pre>
      </div>
    </div>
  ),
};
