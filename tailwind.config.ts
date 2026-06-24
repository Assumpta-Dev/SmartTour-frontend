import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ffeb00',
          dark: '#e5d300',
        },
        accent: {
          DEFAULT: '#ff2d55',
          dark: '#e6244a',
        },
        dark: {
          DEFAULT: '#111111',
          light: '#222222',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Montserrat', 'sans-serif'],
        brush: ['"Permanent Marker"', 'cursive'],
      },
      boxShadow: {
        'modern': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 18px -4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
