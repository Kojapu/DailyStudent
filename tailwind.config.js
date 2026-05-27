/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0D0D0F',
        surface: '#161618',
        'surface-hover': '#1E1E22',
        border: '#2A2A2F',
        accent: '#7C6FFF',
        'accent-soft': 'rgba(124,111,255,0.13)',
        success: '#4ADE80',
        warning: '#FACC15',
        danger: '#F87171',
        'text-primary': '#F0F0F5',
        'text-secondary': '#8888A0',
        'text-muted': '#4A4A60',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
