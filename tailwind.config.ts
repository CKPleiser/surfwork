import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9",
        "primary-hover": "#0284C7",
        accent: "#0EA5E9",
        background: "#FFFBF5",
        foreground: "#0F172A",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        ring: "#0EA5E9",
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
        },
        focus: "#FEF2F2",
        success: "#10B981",
        "success-light": "#34D399",
        destructive: "#EF4444",
        "destructive-light": "#F87171",
        ocean: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
        sand: {
          50: "#FFFBF5",
          100: "#FEF3E2",
          200: "#FDE8C5",
          300: "#FCDCA3",
          400: "#FBCF81",
          500: "#F59E0B",
          600: "#D97706",
        },
        coral: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#DC2626",
          600: "#B91C1C",
        },
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      spacing: {
        section: "96px",
        "section-lg": "128px",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        xs: "0 1px 1px rgba(0, 0, 0, 0.04)",
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        primary: "0 2px 8px rgba(13, 122, 108, 0.15)",
        "primary-lg": "0 8px 16px rgba(13, 122, 108, 0.2)",
        glow: "0 0 20px rgba(12, 109, 97, 0.25)",
        "card-hover": "0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 6px 12px -2px rgba(0, 0, 0, 0.06)",
      },
      transitionTimingFunction: {
        "ease-default": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "ease-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      maxWidth: {
        content: "896px",
        form: "680px",
        profile: "700px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-ocean": "linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #0369A1 100%)",
        "gradient-sunset": "linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #DC2626 100%)",
        "gradient-card": "linear-gradient(to bottom right, #ffffff 0%, #FFFBF5 100%)",
        "gradient-hero": "linear-gradient(135deg, #FEF3E2 0%, #FFFBF5 50%, #ffffff 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "focus-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-3px)" },
          "75%": { transform: "translateX(3px)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.15" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "check-pop": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        wave: {
          "0%, 100%": { height: "30%" },
          "50%": { height: "100%" },
        },
      },
      animation: {
        "fade-up": "fade-up 300ms ease-default",
        "fade-down": "fade-down 200ms ease-default",
        "focus-pulse": "focus-pulse 800ms ease-default infinite",
        shake: "shake 300ms ease-in-out",
        ripple: "ripple 250ms ease-out",
        "check-pop": "check-pop 300ms ease-bounce",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        wave: "wave 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
