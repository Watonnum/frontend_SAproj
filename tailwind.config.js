/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        "2xl": "1400px",
      },
      gridTemplateColumns: {
        responsive: "repeat(auto-fit, minmax(280px, 1fr))",
      },
      aspectRatio: {
        "4/3": "4 / 3",
      },
      animation: {
        scale: "scale 0.3s ease-in-out",
      },
      keyframes: {
        scale: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
