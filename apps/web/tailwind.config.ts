import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette professionnelle entreprise
        brand: {
          // Couleur de marque - Orange KLOZD
          orange: "#f9952a", // Orange principal de la marque
          "orange-light": "#ffb347", // Orange clair
          "orange-dark": "#d87a0f", // Orange foncé
          "orange-50": "#fff7ed", // Orange très clair
          "orange-100": "#ffedd5", // Orange clair
          "orange-200": "#fed7aa", // Orange moyen-clair
          "orange-300": "#fdba74", // Orange moyen
          "orange-400": "#fb923c", // Orange moyen-foncé
          "orange-500": "#f9952a", // Orange principal
          "orange-600": "#ea580c", // Orange foncé
          "orange-700": "#c2410c", // Orange très foncé
          // Couleur principale - Bleu professionnel
          primary: "#2563eb", // Blue 600
          "primary-light": "#3b82f6", // Blue 500
          "primary-dark": "#1d4ed8", // Blue 700
          // Couleur secondaire - Gris professionnel
          secondary: "#64748b", // Slate 500
          "secondary-light": "#94a3b8", // Slate 400
          "secondary-dark": "#475569", // Slate 600
          // Accent moderne
          accent: "#0ea5e9", // Sky 500
          // Rétrocompatibilité
          purple: "#64748b",
          "purple-light": "#94a3b8",
          "purple-dark": "#475569",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        // Palette de gris (Simplified utilise fond clair)
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-delayed': 'float-delayed 25s ease-in-out infinite',
        'float-slow': 'float-slow 30s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
        'pulse-slow-delayed': 'pulse-slow-delayed 10s ease-in-out infinite',
        'line-draw': 'line-draw 15s ease-in-out infinite',
        'line-draw-delayed': 'line-draw-delayed 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

