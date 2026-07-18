import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app/components/**/*.vue',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.ts',
    './app/plugins/**/*.ts',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        clock: ['var(--font-clock)', 'monospace'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        brand: ['var(--font-brand)', 'system-ui', 'sans-serif'],
      },
      colors: {
        clock: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
        },
      },
    },
  },
  plugins: [],
}
