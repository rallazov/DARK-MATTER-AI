/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0d9488',
          secondary: '#0f172a',
          accent: '#f97316',
          mist: '#e2e8f0'
        }
      },
      keyframes: {
        pulseVault: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' }
        }
      },
      animation: {
        pulseVault: 'pulseVault 2.5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
