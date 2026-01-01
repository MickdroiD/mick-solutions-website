import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Safelist pour les classes générées dynamiquement (admin panel)
  safelist: [
    // ========== TAILLES DE TEXTE ==========
    'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
    'text-lg', 'text-xl', 'text-base', 'text-sm', 'text-xs',
    
    // ========== POIDS DE POLICE ==========
    'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold',
    
    // ========== COULEURS DE TEXTE ==========
    'text-white', 'text-slate-100', 'text-slate-300', 'text-slate-500',
    'text-cyan-400', 'text-violet-400', 'text-pink-400', 'text-emerald-400',
    'text-foreground', 'text-muted-foreground', 'text-primary-400', 'text-primary-300',
    
    // ========== ALIGNEMENT ==========
    'text-left', 'text-center', 'text-right',
    
    // ========== TRANSFORMATION ==========
    'normal-case', 'uppercase', 'lowercase', 'capitalize',
    
    // ========== HAUTEUR DE LIGNE ==========
    'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
    
    // ========== BOUTONS - FORMES ==========
    'rounded-xl', 'rounded-full', 'rounded-none', 'rounded-lg', 'rounded-2xl', 'rounded-3xl',
    
    // ========== BOUTONS - TAILLES ==========
    'px-4', 'px-6', 'px-8', 'px-10', 'py-2', 'py-3', 'py-4', 'py-5',
    
    // ========== GAPS (ESPACEMENT) ==========
    'gap-0', 'gap-4', 'gap-6', 'gap-8', 'gap-12', 'gap-16', 'gap-20', 'gap-24',
    'lg:gap-6', 'lg:gap-8', 'lg:gap-12', 'lg:gap-16', 'lg:gap-20', 'lg:gap-24',
    
    // ========== PADDING ==========
    'py-0', 'py-6', 'py-10', 'py-16', 'py-20', 'py-24',
    'lg:py-8', 'lg:py-16', 'lg:py-24', 'lg:py-32', 'lg:py-40',
    
    // ========== MAX WIDTH ==========
    'max-w-3xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full',
    
    // ========== GRID ==========
    'grid', 'lg:grid-cols-2', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'flex', 'flex-col', 'flex-wrap', 'items-center',
    
    // ========== ANIMATIONS ==========
    'animate-float', 'animate-float-slow', 'animate-float-fast',
    'animate-swing', 'animate-swing-slow', 'animate-swing-fast',
    'animate-pulse', 'animate-pulse-slow', 'animate-pulse-fast',
    'animate-bounce', 'animate-bounce-slow', 'animate-bounce-fast',
    'animate-spin', 'animate-spin-slow', 'animate-spin-fast',
    'animate-gradient-x', 'animate-fade-in',
    
    // ========== BACKGROUNDS ==========
    'bg-primary-600', 'bg-primary-700', 'bg-white/10', 'bg-white/20', 'bg-white/5',
    'bg-gradient-to-r', 'from-primary-600', 'to-accent-600',
    
    // ========== BORDERS ==========
    'border', 'border-2', 'border-white/10', 'border-white/20', 'border-primary-500',
    
    // ========== SHADOWS ==========
    'shadow-lg', 'shadow-primary-500/20', 'shadow-primary-500/40',
  ],
  theme: {
    extend: {
      // ========================================
      // COULEURS THÉMABLES VIA CSS VARIABLES
      // Définies dynamiquement par ThemeProvider
      // ========================================
      colors: {
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
      // ANIMATIONS - FUSIONNÉES ET COMPLÈTES
      // ========================================
      animation: {
        // Base animations
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "circuit-flow": "circuitFlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "spin-slow-reverse": "spinReverse 12s linear infinite",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
        
        // --- ANIMATIONS ÉCLAIRS (TechHUDWrapper) ---
        "flicker": "flicker 0.8s ease-in-out infinite",
        "flicker-delay-1": "flicker 0.8s ease-in-out infinite 0.15s",
        "flicker-delay-2": "flicker 0.8s ease-in-out infinite 0.3s",
        "flicker-delay-3": "flicker 0.8s ease-in-out infinite 0.45s",
        
        // --- ANIMATIONS VIVES (Mapping DB) ---
        "electric-flicker": "electricFlicker 1.5s infinite",
        "shake-hard": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite",
        "pulse-fast": "pulseGlow 1s ease-in-out infinite",
        
        // --- ANIMATIONS LOGO AVANCÉES ---
        "spin-glow": "spinGlow 8s linear infinite",
        "electric-pulse": "electricPulse 2s ease-in-out infinite",
        "lightning-ring": "lightningRing 3s ease-in-out infinite",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
      },
      
      keyframes: {
        // Base keyframes
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
        
        // --- KEYFRAMES VIVES ---
        electricFlicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {
            opacity: "0.99",
            filter: "drop-shadow(0 0 10px var(--primary-500)) brightness(1.2)",
          },
          "20%, 24%, 55%": {
            opacity: "0.4",
            filter: "none",
          },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        
        // --- KEYFRAMES LOGO AVANCÉES ---
        spinGlow: {
          "0%": { 
            transform: "rotate(0deg)",
            filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))",
          },
          "50%": { 
            filter: "drop-shadow(0 0 20px rgba(168, 139, 250, 0.6))",
          },
          "100%": { 
            transform: "rotate(360deg)",
            filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))",
          },
        },
        electricPulse: {
          "0%, 100%": { 
            boxShadow: "0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3), 0 0 30px rgba(168, 139, 250, 0.2)",
          },
          "50%": { 
            boxShadow: "0 0 20px rgba(168, 139, 250, 0.6), 0 0 40px rgba(34, 211, 238, 0.4), 0 0 60px rgba(168, 139, 250, 0.3)",
          },
        },
        lightningRing: {
          "0%": { 
            transform: "scale(1) rotate(0deg)", 
            opacity: "0.8",
            borderColor: "rgba(34, 211, 238, 0.5)",
          },
          "50%": { 
            transform: "scale(1.05) rotate(180deg)", 
            opacity: "0.4",
            borderColor: "rgba(168, 139, 250, 0.5)",
          },
          "100%": { 
            transform: "scale(1) rotate(360deg)", 
            opacity: "0.8",
            borderColor: "rgba(34, 211, 238, 0.5)",
          },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        
        // --- KEYFRAMES TECHHUDWRAPPER ---
        spinReverse: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.02)" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.4", strokeWidth: "1.5" },
          "20%": { opacity: "1", strokeWidth: "2.5" },
          "40%": { opacity: "0.6", strokeWidth: "2" },
          "60%": { opacity: "0.9", strokeWidth: "2.5" },
          "80%": { opacity: "0.3", strokeWidth: "1.5" },
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
        "electric": "0 0 15px rgba(34, 211, 238, 0.5), 0 0 30px rgba(168, 139, 250, 0.3)",
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
