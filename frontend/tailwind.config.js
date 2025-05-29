module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        hero: "url('/assets/hero.jpg')",
      },
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        primary: '#1DB954',
        'primary-600': '#1AA34A',
        content2: '#1E1E1E',
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}