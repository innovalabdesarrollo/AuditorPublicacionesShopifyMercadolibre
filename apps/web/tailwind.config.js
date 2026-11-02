/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0f1419',
          900: '#1a2332',
          700: '#3d4f66',
          500: '#6b7c93',
          100: '#e8eef4'
        },
        accent: {
          DEFAULT: '#0d7a6f',
          soft: '#e6f5f3',
          dark: '#095a52'
        },
        warn: {
          DEFAULT: '#c47a0a',
          soft: '#fff4e0'
        },
        danger: {
          DEFAULT: '#b42318',
          soft: '#fdecea'
        },
        ok: {
          DEFAULT: '#1b7a3d',
          soft: '#e8f6ed'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};
