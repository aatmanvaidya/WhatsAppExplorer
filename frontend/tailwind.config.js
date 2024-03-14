module.exports = {
  content: [
    // "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/ImageContainer/*.js",
    "./src/components/Navbar/*.js",
    "./src/components/pages/loginPage.js",
    "./src/components/pages/NewUser.js",
  ],
  theme: {
    screens: {
      // 'Ism': '640px',
      // => @media (min-width: 640px) { ... }

      'Ism': '768px',
      // => @media (min-width: 768px) { ... }

      'Ilg': '1500px',
      // 'Imd': '1080px',
      // => @media (min-width: 1024px) { ... }

    },
    extend: {},
  },
  plugins: [],
}
