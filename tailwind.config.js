/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: true,
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  // important: '#__next',
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-Mulish)"],
      },
      fontWeight: {
        thin: 100,
        light: 300,
        regular: 400,
        semibold: 600,
        medium: 500,
        bold: 700,
      },
      colors: {
        charlestongreen: "#334155",
        ornategrey: "#abbbc2",
        textgrey: "#7d7e81",
        lightgrey: "#c8c8c8",
        textcolor: "#575757",
        backgroundgrey: "#f3f3f3",
        primary: "#14A850",
        "primary-light-10": "#E8F7EF",
        "primary-light-5": "#F3FBF7",
        "primary-light-50": "rgba(20, 168, 80, 0.5)",
        secondary: "#1175BC",
        tertiary: "#045cb4",
        darkgray: "#252733",
        backgroundorange: "#F479201A",
        bordergrey: "#dddfe5",
        slategray: "#2F4858",
        buttongrey: "#bbb",
        ornategreen: "#33C863",
        ornatelightgreen: "#33c8631a",
        ornatered: "#F9575B",
        ornatelightred: "#f7575b1a",
        gunmetal: "#2a333e",
        lightwhite: "#fafafa",
        editfield: "#3F5575",
        "dark-bluish-green": "#304C5C",
        ornateblue: "#3280D8",
        sggreen: "#15A245",
      },
      backgroundImage: {
        "orange-shade":
          "linear-gradient(81.53deg, #F37920 17.22%, #FF9E5E 86.25%)",
      },
      borderWidth: {
        1: "1px",
      },
      spacing: {
        extrasmall: "7.5rem",
        small: "10rem",
        medium: "12.5rem",
        semimedium: "14rem",
        large: "20rem",
      },
      gridTemplateRows: {
        layout: "repeat(36, minmax(0, 1fr))",
      },
      animation: {
        "spin-slow": "spin 1.5s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      // screens: {
      //   "3xl": { max: "1920px" },
      //   "2xl": { max: "1535px" },
      //   xl: { max: "1279px" },
      //   lg: { max: "1023px" },
      //   md: { max: "768px" },
      //   sm: { max: "639px" },
      // },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
