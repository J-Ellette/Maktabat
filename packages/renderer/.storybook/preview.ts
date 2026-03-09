import type { Preview } from '@storybook/react'
import '../src/styles/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      // Match the three Maktabat themes
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'sepia', value: '#f8f1e4' },
      ],
    },
  },
  // Apply the theme class to the story container so CSS tokens are active
  decorators: [
    (Story, context) => {
      const bg = context.globals['backgrounds']?.value ?? '#ffffff'
      const theme = bg === '#1a1a2e' ? 'dark' : bg === '#f8f1e4' ? 'sepia' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
      return Story()
    },
  ],
}

export default preview
