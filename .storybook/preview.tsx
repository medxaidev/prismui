import type { Preview } from '@storybook/react';
import { PrismUIProvider } from '../packages/core/src/core/theme/provider/PrismUIProvider';
import { ColorSchemeProvider } from '../packages/core/src/core/theme/color-scheme.context';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
  },
  globalTypes: {
    colorScheme: {
      name: 'Color Scheme',
      description: 'Global color scheme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const scheme = context.globals.colorScheme ?? 'light';
      return (
        <PrismUIProvider colorScheme={scheme}>
          <ColorSchemeProvider defaultColorScheme={scheme as 'light' | 'dark'}>
            <div
              style={{
                padding: '24px',
                minHeight: '100px',
                background: scheme === 'dark' ? '#1a1a2e' : '#ffffff',
                color: scheme === 'dark' ? '#e0e0e0' : '#1a1a1a',
              }}
            >
              <Story />
            </div>
          </ColorSchemeProvider>
        </PrismUIProvider>
      );
    },
  ],
};

export default preview;