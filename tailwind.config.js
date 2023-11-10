/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "#130201",
        background: "#fde8e7",
        primary: "#f02f28",
        secondary: "#fabfbd",
        accent: "#db160f",
      },
      // fontSize: {
      //   sm: "0.750rem",
      //   base: "1rem",
      //   xl: "1.333rem",
      //   "2xl": "1.777rem",
      //   "3xl": "2.369rem",
      //   "4xl": "3.158rem",
      //   "5xl": "4.210rem",
      // },
      fontFamily: {
        heading: "Poppins",
        body: "Poppins",
      },
    },
  },
  plugins: [],
};
