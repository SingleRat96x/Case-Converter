import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      '2xs': '375px',
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              textDecoration: 'underline',
              '&:hover': {
                color: 'hsl(var(--primary))',
              },
            },
            '[class~="lead"]': {
              color: 'hsl(var(--foreground))',
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            'ol > li::marker': {
              color: 'hsl(var(--foreground))',
            },
            'ul > li::marker': {
              color: 'hsl(var(--foreground))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            blockquote: {
              color: 'hsl(var(--foreground))',
              borderLeftColor: 'hsl(var(--border))',
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            'figure figcaption': {
              color: 'hsl(var(--muted-foreground))',
            },
            code: {
              color: 'hsl(var(--foreground))',
            },
            'a code': {
              color: 'hsl(var(--primary))',
            },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
            },
            thead: {
              color: 'hsl(var(--foreground))',
              borderBottomColor: 'hsl(var(--border))',
            },
            'tbody tr': {
              borderBottomColor: 'hsl(var(--border))',
            },
          },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config;
