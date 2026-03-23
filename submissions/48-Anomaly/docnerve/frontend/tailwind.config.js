/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DocNerve design system
        surface: '#F9FAFB',
        border: '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        severity: {
          critical: '#DC2626',
          'critical-bg': '#FEF2F2',
          high: '#D97706',
          'high-bg': '#FFFBEB',
          medium: '#2563EB',
          'medium-bg': '#EFF6FF',
          low: '#16A34A',
          'low-bg': '#F0FDF4',
          suspicious: '#9333EA',
          'suspicious-bg': '#FAF5FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
