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
        // ========================================
        // COULEURS THÉMABLES VIA CSS VARIABLES
        // Définies dynamiquement par ThemeProvider
        // ========================================
        
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Palette Primary (Cyan par défaut)
        primary: {
          DEFAULT: "var(--primary)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
        
        // Palette Accent (Violet par défaut)
        accent: {
          DEFAULT: "var(--accent)",
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
          950: "var(--accent-950)",
        },
      },
      
      // ========================================
      // FONTS DYNAMIQUES
      // ========================================
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        // Legacy - Pour compatibilité
        inter: ["Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
        space: ["Space Grotesk", "system-ui", "sans-serif"],
        outfit: ["Outfit", "system-ui", "sans-serif"],
        montserrat: ["Montserrat", "system-ui", "sans-serif"],
        dm: ["DM Sans", "system-ui", "sans-serif"],
      },
      
      // ========================================
      // BORDER RADIUS DYNAMIQUES
      // ========================================
      borderRadius: {
        theme: "var(--radius)",
        "theme-sm": "var(--radius-sm)",
        "theme-md": "var(--radius-md)",
        "theme-lg": "var(--radius-lg)",
        "theme-xl": "var(--radius-xl)",
      },
      
      // ========================================
      // SPACING (Header-aware)
      // ========================================
      spacing: {
        header: "var(--header-height)",
      },
      
      // ========================================
      // ANIMATIONS
      // ========================================
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "circuit-flow": "circuitFlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        circuitFlow: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      
      // ========================================
      // BOX SHADOWS THÉMABLES
      // ========================================
      boxShadow: {
        "glow-sm": "0 0 10px var(--primary-500)",
        "glow": "0 0 20px var(--primary-500)",
        "glow-lg": "0 0 40px var(--primary-500)",
        "glow-accent": "0 0 20px var(--accent-500)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.35)",
      },
      
      // ========================================
      // BACKDROP BLUR
      // ========================================
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
