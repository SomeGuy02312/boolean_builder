/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
theme: {
    extend: {
      colors: {
        app: "#F8FAFC",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#8A6DFF",
          light: "#C8A5FF",
        },
        mint: "#3EE0C2",
        pill: {
          lavender: "#EFE7FF",
          blue: "#E7F0FF",
          mint: "#E3FAF5",
        },
      },
      borderRadius: {
        bucket: "1rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 2px 6px rgba(15, 23, 42, 0.08)",
        softLg: "0 10px 25px rgba(15, 23, 42, 0.10)",
        pill: "0 1px 3px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
