/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f4f1ea",
        ink: "#0a0a0a",
        signal: "#e5341f",
        smoke: "#e7e3d8",
      },
      fontFamily: {
        grotesk: ["Archivo", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
