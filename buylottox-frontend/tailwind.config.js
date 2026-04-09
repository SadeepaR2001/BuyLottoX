/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blx: {
          text: '#F8F7FF',
          border: 'rgba(255,255,255,0.10)',
          panel: 'rgba(14, 10, 26, 0.88)',
          purple: '#A855F7',
        },
      },
      boxShadow: {
        neon: '0 0 18px rgba(168,85,247,0.35)',
        neonStrong: '0 0 28px rgba(168,85,247,0.45)',
      },
      backgroundImage: {
        'panel-sparkle': 'radial-gradient(circle at top left, rgba(168,85,247,0.16), transparent 45%), radial-gradient(circle at bottom right, rgba(124,58,237,0.12), transparent 50%)',
      },
    },
  },
  plugins: [],
}
