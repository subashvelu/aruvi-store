/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandmint: "#2dd4bf",
        brandteal: "#0d9488",
        brandsky: "#0369a1",
        carbon: "#050505",
        ink: "#0f172a",
      },
      boxShadow: {
        glow: "0 30px 100px rgba(13,148,136, 0.28)",
        soft: "0 24px 80px rgba(0, 0, 0, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
