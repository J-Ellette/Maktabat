import type { StorybookConfig } from '@storybook/react-vite'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Re-use the same path aliases defined in vite.config.ts
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../../shared'),
      '@arabic-nlp': path.resolve(__dirname, '../../arabic-nlp/src'),
    }
    return config
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
