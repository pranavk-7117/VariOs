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
        wari: {
          // Light theme surfaces
          pageBg:     "#F4EFE8",
          sidebarBg:  "#FEFCFA",
          cardBg:     "#FFFFFF",
          cardBorder: "#E5DDD5",
          headerBg:   "#FFFFFF",
          inputBg:    "#F8F4EF",

          // Text
          textPrimary:  "#1C1529",
          textSecond:   "#6A6070",
          textMuted:    "#9E98A6",

          // Brand accents (unchanged)
          orange:      "#E85A1C",
          orangeHover: "#FF6E30",
          orangeLight: "#FEF0EA",
          plum:        "#6B1D47",
          plumLight:   "#F5EBF0",

          // Status colors (unchanged — still pop on light bg)
          red:     "#B91C1C",
          redBg:   "#FEF2F2",
          green:   "#10B981",
          greenBg: "#F0FDF4",
          yellow:  "#F59E0B",
          yellowBg:"#FFFBEB",
          blue:    "#3B82F6",
          blueBg:  "#EFF6FF",

          // Legacy dark tokens (kept for backward compat during migration)
          bg:         "#14101D",
          surface:    "#1D172A",
          surface2:   "#272038",
          card:       "#191424",
          border:     "#332A46",
          borderLight:"#4B3F63",
          cream:      "#F6EFE9",
          creamMuted: "#D7CEC5",
          plumDark:   "#48122F",
          orangeMuted:"#873812",
          redGlow:    "#EF4444",
          muted:      "#645D6C",
          subtle:     "#9E98A6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card:    "0 1px 3px rgba(28, 21, 41, 0.08), 0 1px 2px rgba(28, 21, 41, 0.04)",
        cardHov: "0 4px 12px rgba(28, 21, 41, 0.12), 0 2px 4px rgba(28, 21, 41, 0.06)",
        header:  "0 1px 0 #E5DDD5, 0 2px 8px rgba(28, 21, 41, 0.04)",
        sidebar: "1px 0 0 #E5DDD5",
        tactical:"0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 15px -3px rgba(232, 90, 28, 0.15)",
        glowOrange:"0 0 25px -3px rgba(232, 90, 28, 0.4)",
        glowRed:  "0 0 25px -3px rgba(185, 28, 28, 0.5)",
        glowPlum: "0 0 25px -3px rgba(107, 29, 71, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beacon":     "beacon 2s infinite",
        "fadeIn":     "fadeIn 0.2s ease-out",
      },
      keyframes: {
        beacon: {
          "0%":   { transform: "scale(0.95)", opacity: "0.8" },
          "50%":  { transform: "scale(1.3)",  opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
