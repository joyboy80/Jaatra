/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        safar: {
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
        brand: {
          maroon: "#831843",
          crimson: "#BE123C",
          purple: "#6B21A8",
          indigo: "#4338CA",
          cyan: "#0E7490",
          teal: "#0F766E",
        }
      },
      boxShadow: {
        soft: "0 14px 36px rgb(var(--shadow) / 0.12)",
        glow: "0 0 0 4px rgb(var(--role-accent) / 0.12), 0 12px 30px rgb(var(--role-accent) / 0.16)",
        float: "0 20px 40px -10px rgb(var(--shadow) / 0.15)",
        innerGlow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.4s infinite ease-in-out both',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        typing: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
