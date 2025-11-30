/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        bgAlt: "#111111",
        fg: "#FFFFFF",
        fgMuted: "#D0D0D0",
        border: "#2A2A2A",
        accent: "#FFFFFF",
        danger: "#FF4D4D",
        success: "#33FF99"
      }
    }
  },
  plugins: []
};