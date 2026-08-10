/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        jaatra: {
          ink: "rgb(var(--foreground) / <alpha-value>)",
          navy: "rgb(var(--role-accent-strong) / <alpha-value>)",
          teal: "rgb(var(--role-accent) / <alpha-value>)",
          mint: "rgb(var(--role-accent-soft) / <alpha-value>)",
          sky: "rgb(var(--secondary-soft) / <alpha-value>)",
          amber: "#F59E0B",
          red: "#DC2626",
          gray: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
        outline: "rgb(var(--border) / <alpha-value>)",
        ai: "rgb(var(--ai) / <alpha-value>)",
        tracking: "rgb(var(--tracking) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 14px 36px rgb(var(--shadow) / 0.12)",
        glow: "0 0 0 4px rgb(var(--role-accent) / 0.12), 0 12px 30px rgb(var(--role-accent) / 0.16)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
