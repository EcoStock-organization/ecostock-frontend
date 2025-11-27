/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          foreground: "rgb(var(--brand-foreground) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
        },
        sidebar: "rgb(var(--sidebar) / <alpha-value>)",
        'sidebar-foreground': "rgb(var(--sidebar-foreground) / <alpha-value>)",
        'sidebar-primary': "rgb(var(--sidebar-primary) / <alpha-value>)",
        'sidebar-primary-foreground': "rgb(var(--sidebar-primary-foreground) / <alpha-value>)",
        'sidebar-accent': "rgb(var(--sidebar-accent) / <alpha-value>)",
        'sidebar-accent-foreground': "rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
        'sidebar-border': "rgb(var(--sidebar-border) / <alpha-value>)",
        'sidebar-ring': "rgb(var(--sidebar-ring) / <alpha-value>)",
        'status-success': "rgb(var(--status-success) / <alpha-value>)",
        'status-success-foreground': "rgb(var(--status-success-foreground) / <alpha-value>)",
        'status-warning': "rgb(var(--status-warning) / <alpha-value>)",
        'status-warning-foreground': "rgb(var(--status-warning-foreground) / <alpha-value>)",
        'status-critical': "rgb(var(--status-critical) / <alpha-value>)",
        'status-critical-foreground': "rgb(var(--status-critical-foreground) / <alpha-value>)",
        'status-expiring': "rgb(var(--status-expiring) / <alpha-value>)",
        'status-expiring-foreground': "rgb(var(--status-expiring-foreground) / <alpha-value>)",
        chart1: "rgb(var(--chart-1) / <alpha-value>)",
        chart2: "rgb(var(--chart-2) / <alpha-value>)",
        chart3: "rgb(var(--chart-3) / <alpha-value>)",
        chart4: "rgb(var(--chart-4) / <alpha-value>)",
        chart5: "rgb(var(--chart-5) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
