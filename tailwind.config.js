/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        lilac: {
          DEFAULT: '#c08cad',
          50: '#f7f3f5',
          100: '#efe7eb',
          200: '#e0d0d8',
          300: '#cbb0be',
          400: '#c08cad', // Main lilac color
          500: '#a8739a',
          600: '#8f5c82',
          700: '#764c6b',
          800: '#634059',
          900: '#55384c',
        },
        tangerine: {
          DEFAULT: '#e69c7f',
          50: '#fdf7f4',
          100: '#fbeee8',
          200: '#f6dbd0',
          300: '#efc0ae',
          400: '#e69c7f', // Main atomic tangerine color
          500: '#dc7a5a',
          600: '#cc5f3f',
          700: '#aa4d34',
          800: '#884030',
          900: '#6f372c',
        },
        coral: {
          DEFAULT: '#ed8074',
          50: '#fef6f5',
          100: '#fdecea',
          200: '#faddd9',
          300: '#f6c4bd',
          400: '#f09d92',
          500: '#ed8074', // Main coral color
          600: '#e25a4a',
          700: '#d04233',
          800: '#ad372c',
          900: '#8f322a',
        },
        sage: {
          DEFAULT: '#becdb8',
          50: '#f6f8f5',
          100: '#eaf0e7',
          200: '#d6e2d1',
          300: '#becdb8', // Main ash gray/sage color
          400: '#9fb394',
          500: '#829873',
          600: '#687c5a',
          700: '#546349',
          800: '#45503d',
          900: '#3a4334',
        },
        // Keep white as is
        white: '#ffffff',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #c08cad, #e69c7f, #ed8074, #becdb8)',
        'gradient-soft': 'linear-gradient(45deg, #f7f3f5, #fdf7f4, #fef6f5, #f6f8f5)',
        'gradient-warm': 'linear-gradient(90deg, #e69c7f, #ed8074, #c08cad)',
        'gradient-cool': 'linear-gradient(90deg, #becdb8, #c08cad)',
        'gradient-coral': 'linear-gradient(135deg, #ed8074, #e69c7f)',
        'gradient-sunset': 'linear-gradient(45deg, #ed8074, #c08cad)',
      },
    },
  },
  plugins: [],
};