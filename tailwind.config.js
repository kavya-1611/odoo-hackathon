/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  "#FBF6EF",
          100: "#F3E9DD",
          200: "#E6D3BC",
          300: "#D3B28C",
          400: "#B98D5F",
          500: "#8C5E3C",
          600: "#6F4E37",
          700: "#5A3D2B",
          800: "#432D20",
          900: "#2E1F17",
        },
        cream: "#FBF6EF",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        pop: "0 1px 2px rgba(46,31,23,0.08), 0 8px 20px -6px rgba(46,31,23,0.18)",
        popHover: "0 4px 10px rgba(46,31,23,0.12), 0 16px 32px -8px rgba(46,31,23,0.28)",
        inset3d: "inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 14px -4px rgba(46,31,23,0.35)",
      },
    },
  },
  plugins: [],
}
