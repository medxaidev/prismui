import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { createTheme } from '../../core/theme/create-theme';
import { ButtonBase } from './ButtonBase';

const meta: Meta<typeof ButtonBase> = {
  title: 'Components/ButtonBase',
  component: ButtonBase,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ButtonBase>;

// ---------------------------------------------------------------------------
// 1. Basic usage
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>ButtonBase — Basic</h3>
      <ButtonBase onClick={() => alert('Clicked!')}>
        Click me (renders &lt;button&gt;)
      </ButtonBase>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Polymorphic — as <a>
// ---------------------------------------------------------------------------

export const AsLink: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>ButtonBase — as &lt;a&gt;</h3>
      <ButtonBase component="a" href="https://example.com" target="_blank">
        I am an anchor tag
      </ButtonBase>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Polymorphic — as <div>
// ---------------------------------------------------------------------------

export const AsDiv: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>ButtonBase — as &lt;div&gt;</h3>
      <ButtonBase component="div" onClick={() => alert('Div clicked!')}>
        I am a div (inspect: no type attribute)
      </ButtonBase>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. Disabled state
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>ButtonBase — Disabled</h3>
      <div style={{ display: 'flex', gap: 16 }}>
        <ButtonBase onClick={() => alert('Should not fire')} disabled>
          Disabled button
        </ButtonBase>
        <ButtonBase onClick={() => alert('Enabled!')}>
          Enabled button
        </ButtonBase>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 5. Unstyled
// ---------------------------------------------------------------------------

export const Unstyled: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>ButtonBase — Unstyled</h3>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>Normal</p>
          <ButtonBase style={{ border: '1px solid #228be6', padding: '8px 16px' }}>
            Styled
          </ButtonBase>
        </div>
        <div>
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#666' }}>unstyled=true</p>
          <ButtonBase unstyled style={{ padding: '8px 16px' }}>
            Unstyled (browser defaults)
          </ButtonBase>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. __staticSelector override
// ---------------------------------------------------------------------------

export const StaticSelector: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — __staticSelector
      </h3>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 12 }}>
        Inspect: class contains &quot;prismui-MyButton-root&quot; instead of &quot;prismui-ButtonBase-root&quot;
      </p>
      <ButtonBase __staticSelector="MyButton">
        Custom static selector
      </ButtonBase>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 7. Theme customization
// ---------------------------------------------------------------------------

const customTheme = createTheme({
  components: {
    ButtonBase: {
      defaultProps: { className: 'theme-default-btn' },
      classNames: { root: 'theme-btn-root' },
      styles: {
        root: {
          border: '2px dashed #fa5252',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  render: () => (
    <PrismuiProvider theme={customTheme}>
      <div style={{ padding: 40 }}>
        <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
          ButtonBase — Theme Customization
        </h3>
        <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 12 }}>
          Theme sets: dashed red border, padding, borderRadius, custom className
        </p>
        <ButtonBase>Themed ButtonBase</ButtonBase>
      </div>
    </PrismuiProvider>
  ),
};

// ---------------------------------------------------------------------------
// 8. Per-instance classNames/styles
// ---------------------------------------------------------------------------

export const PerInstanceOverride: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — Per-Instance Override
      </h3>
      <ButtonBase
        classNames={{ root: 'my-custom-btn' }}
        styles={{
          root: {
            background: '#228be6',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 6,
          },
        }}
      >
        Custom styled instance
      </ButtonBase>
    </div>
  ),
};




export const ThemeClassNames: Story = {
  render: () => (
    <PrismuiProvider theme={{
      components: {
        ButtonBase: ButtonBase.extend({
          classNames: (_theme, props) => ({
            root: `provider-classname-${props.__staticSelector}`,
          }),
        })
      }
    }}>
      <div style={{ padding: 40 }}>
        <ButtonBase styles={() => ({ root: { color: 'red' } })}>Button</ButtonBase>
      </div>

    </PrismuiProvider>
  ),
};


export const PropsInStyles: Story = {
  render: () => (
    <ButtonBase
      variant="xl"
      classNames={(_theme, props) => ({
        root: `${props.__staticSelector}----test`,
      })}
    >
      Hello
    </ButtonBase>
  ),
};

// ---------------------------------------------------------------------------
// 11. Ripple effect — default
// ---------------------------------------------------------------------------

const rippleBtnStyle: React.CSSProperties = {
  padding: '12px 24px',
  borderRadius: 8,
  fontFamily: 'sans-serif',
  fontSize: 14,
  fontWeight: 500,
};

export const RippleDefault: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — Ripple Effect (default)
      </h3>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 16 }}>
        Click or touch the buttons to see the ripple effect. Ripple originates from the click point.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <ButtonBase style={{ ...rippleBtnStyle, background: '#228be6', color: '#fff' }}>
          Primary Ripple
        </ButtonBase>
        <ButtonBase style={{ ...rippleBtnStyle, background: '#fa5252', color: '#fff' }}>
          Danger Ripple
        </ButtonBase>
        <ButtonBase style={{ ...rippleBtnStyle, background: '#40c057', color: '#fff' }}>
          Success Ripple
        </ButtonBase>
        <ButtonBase style={{ ...rippleBtnStyle, border: '1px solid #dee2e6' }}>
          Outlined Ripple
        </ButtonBase>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 12. Ripple — center
// ---------------------------------------------------------------------------

export const RippleCenter: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — Center Ripple
      </h3>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 16 }}>
        Ripple always starts from the center, regardless of click position.
        Useful for icon buttons and circular elements.
      </p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <ButtonBase
          centerRipple
          style={{
            ...rippleBtnStyle,
            background: '#228be6',
            color: '#fff',
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            fontSize: 20,
          }}
        >
          +
        </ButtonBase>
        <ButtonBase
          centerRipple
          style={{ ...rippleBtnStyle, background: '#7950f2', color: '#fff' }}
        >
          Center Ripple
        </ButtonBase>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 13. Ripple — disabled
// ---------------------------------------------------------------------------

export const RippleDisabled: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — Ripple Control Props
      </h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <ButtonBase style={{ ...rippleBtnStyle, background: '#228be6', color: '#fff' }}>
            Default (ripple on)
          </ButtonBase>
          <p style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#999', marginTop: 4 }}>
            disableRipple=false
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ButtonBase
            disableRipple
            style={{ ...rippleBtnStyle, background: '#868e96', color: '#fff' }}
          >
            No Ripple
          </ButtonBase>
          <p style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#999', marginTop: 4 }}>
            disableRipple=true
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ButtonBase
            disableTouchRipple
            style={{ ...rippleBtnStyle, background: '#fd7e14', color: '#fff' }}
          >
            No Touch Ripple
          </ButtonBase>
          <p style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#999', marginTop: 4 }}>
            disableTouchRipple=true
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ButtonBase
            disabled
            style={{ ...rippleBtnStyle, background: '#e9ecef', color: '#adb5bd' }}
          >
            Disabled
          </ButtonBase>
          <p style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#999', marginTop: 4 }}>
            disabled=true (no ripple)
          </p>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 14. Ripple — focus pulsate
// ---------------------------------------------------------------------------

export const RippleFocusPulsate: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — Focus Ripple (Pulsate)
      </h3>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 16 }}>
        Tab to focus the button — a pulsating ripple appears. Click to see normal ripple.
      </p>
      <ButtonBase
        focusRipple
        style={{ ...rippleBtnStyle, background: '#228be6', color: '#fff' }}
      >
        Focus me (Tab key)
      </ButtonBase>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 15. Ripple — polymorphic with ripple
// ---------------------------------------------------------------------------

export const RipplePolymorphic: Story = {
  render: () => (
    <div style={{ padding: 40 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        ButtonBase — Ripple on Polymorphic Elements
      </h3>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666', marginBottom: 16 }}>
        Ripple works on any element type via the component prop.
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <ButtonBase style={{ ...rippleBtnStyle, background: '#228be6', color: '#fff' }}>
          &lt;button&gt;
        </ButtonBase>
        <ButtonBase
          component="a"
          href="#"
          style={{ ...rippleBtnStyle, background: '#12b886', color: '#fff' }}
        >
          &lt;a&gt; link
        </ButtonBase>
        <ButtonBase
          component="div"
          style={{ ...rippleBtnStyle, background: '#7950f2', color: '#fff' }}
        >
          &lt;div&gt;
        </ButtonBase>
      </div>
    </div>
  ),
};
