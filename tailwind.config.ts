module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        focus: '#682EFF',
        error: '#EB5757',
      },
      textColor: {
        primary: '#04121B',
        secondary: '#04121BA3',
        tertiary: '#04121B7A',
        placeholder: '#04121B5C',
        disabled: '#04121B3D',
        brand: '682EFF',
        positive: '#00A30E',
        negative: '#E12E3C',
        inverted: '#FFFFFF',
      },
      backgroundColor: {
        'primary': '#FFFFFF',
        'secondary': '#F4F5F6',
        'tertiary': '#E9ECED',
        'fullpage-tint': '#00000059',
        'inverted': '#000000',
        'brand-solid': '#682EFF',
        'brand-second': '#F0EAFF',
        'brand-solid-hover': '#5425CC',
        'hover-heart': '#D9D9D9',
      },
      borderColor: {
        primary: '#242D3429',
        secondary: '#F4F5F6',
        error: '#EB5757',
        focus: '#682EFF',
      },
      fontSize: {
        'XS': ['14px', '18px'],
        'M': ['16px', '20px'],
        'L': ['18px', '22px'],
        'XL': ['20px', '24px'],
        '2XL': ['24px', '28px'],
        '3XL': ['30px', '36px'],
        '4XL': ['36px', '44px'],
        '5XL': ['48px', '58px'],
        '6XL': ['64px', '78px'],
      },
      width: {
        list: '71.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'registr': '#682EFF',
      },
    },
  },
  plugins: [],
}
