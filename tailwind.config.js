module.exports = {
  purge: ['./components/**/*.js', './pages/**/*.js'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'vu-gray': '#161c23',
        'vu-red': '#e14d43',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
