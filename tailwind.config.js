/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'system': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fefdf8',
          100: '#fef7cd',
          200: '#feee95',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 50%, #0c4a6e 100%)',
        'ios-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'bottle-shimmer': 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'wave': 'wave 2s ease-in-out infinite',
        'wave-slow': 'wave 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bubble': 'bubble 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 1s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'neural-pulse': 'neuralPulse 3s ease-in-out infinite',
        'quantum-drift': 'quantumDrift 20s linear infinite',
        'data-stream': 'dataStream 2s linear infinite',
        'holographic-shift': 'holographicShift 4s ease-in-out infinite',
        'neural-connect': 'neuralConnect 6s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%'
          },
          '50%': {
            transform: 'rotate(180deg)',
            borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%'
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.7'
          },
          '50%': {
            transform: 'translateY(-20px) rotate(5deg)',
            opacity: '1'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bubble: {
          '0%': {
            transform: 'translateY(100vh) scale(0) rotate(0deg)',
            opacity: '0'
          },
          '10%': {
            transform: 'translateY(90vh) scale(0.1) rotate(45deg)',
            opacity: '1'
          },
          '50%': {
            transform: 'translateY(50vh) scale(1) rotate(180deg)',
            opacity: '0.8'
          },
          '90%': {
            transform: 'translateY(10vh) scale(0.2) rotate(315deg)',
            opacity: '0.5'
          },
          '100%': {
            transform: 'translateY(-10vh) scale(0) rotate(360deg)',
            opacity: '0'
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)'
          },
          '40%': {
            transform: 'translateY(-10px)'
          },
          '60%': {
            transform: 'translateY(-5px)'
          },
        },
        neuralPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 30px rgba(59, 130, 246, 0.2)',
            filter: 'hue-rotate(0deg)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(147, 51, 234, 0.8), inset 0 0 50px rgba(147, 51, 234, 0.3)',
            filter: 'hue-rotate(90deg)'
          },
        },
        quantumDrift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0.7' },
          '25%': { transform: 'translate(-20px, -30px) rotate(90deg)', opacity: '1' },
          '50%': { transform: 'translate(40px, -15px) rotate(180deg)', opacity: '0.8' },
          '75%': { transform: 'translate(-10px, -45px) rotate(270deg)', opacity: '0.9' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)', opacity: '0.7' },
        },
        dataStream: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        holographicShift: {
          '0%, 100%': {
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%)'
          },
          '33%': {
            background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(6, 182, 212, 0.3) 100%)'
          },
          '66%': {
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.3) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(59, 130, 246, 0.3) 100%)'
          },
        },
        neuralConnect: {
          '0%': {
            transform: 'scale(1) rotate(0deg)',
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%'
          },
          '25%': {
            transform: 'scale(1.1) rotate(90deg)',
            borderRadius: '40% 60% 50% 50%/50% 60% 40% 60%'
          },
          '50%': {
            transform: 'scale(0.9) rotate(180deg)',
            borderRadius: '30% 70% 60% 40%/40% 50% 60% 50%'
          },
          '75%': {
            transform: 'scale(1.05) rotate(270deg)',
            borderRadius: '70% 30% 40% 60%/30% 70% 50% 50%'
          },
          '100%': {
            transform: 'scale(1) rotate(360deg)',
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%'
          },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
        'ios': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'ios-hover': '0 15px 40px rgba(0, 0, 0, 0.15)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'neon-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
      blur: {
        'xs': '2px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}