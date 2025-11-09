/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "blue-bar": "hsl(var(--blue-bar))",
        "blue-form": "hsl(var(--blue-form))",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
      transitionDuration: {
        fast: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
