# Configuration Updates for Text Case Converter

## Site Name Update
The site name should be **"Text Case Converter"** throughout the application.

## Color Theme Configuration

### Updated `src/app/globals.css` with Tailwind v4 OKLCH Colors

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.65rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.141 0.005 285.823);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.141 0.005 285.823);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.141 0.005 285.823);
    --primary: oklch(0.705 0.213 47.604);
    --primary-foreground: oklch(0.98 0.016 73.684);
    --secondary: oklch(0.967 0.001 286.375);
    --secondary-foreground: oklch(0.21 0.006 285.885);
    --muted: oklch(0.967 0.001 286.375);
    --muted-foreground: oklch(0.552 0.016 285.938);
    --accent: oklch(0.967 0.001 286.375);
    --accent-foreground: oklch(0.21 0.006 285.885);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.92 0.004 286.32);
    --input: oklch(0.92 0.004 286.32);
    --ring: oklch(0.705 0.213 47.604);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.141 0.005 285.823);
    --sidebar-primary: oklch(0.705 0.213 47.604);
    --sidebar-primary-foreground: oklch(0.98 0.016 73.684);
    --sidebar-accent: oklch(0.967 0.001 286.375);
    --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
    --sidebar-border: oklch(0.92 0.004 286.32);
    --sidebar-ring: oklch(0.705 0.213 47.604);
  }

  .dark {
    --background: oklch(0.141 0.005 285.823);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.21 0.006 285.885);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.21 0.006 285.885);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.646 0.222 41.116);
    --primary-foreground: oklch(0.98 0.016 73.684);
    --secondary: oklch(0.274 0.006 286.033);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.274 0.006 286.033);
    --muted-foreground: oklch(0.705 0.015 286.067);
    --accent: oklch(0.274 0.006 286.033);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.646 0.222 41.116);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.21 0.006 285.885);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.646 0.222 41.116);
    --sidebar-primary-foreground: oklch(0.98 0.016 73.684);
    --sidebar-accent: oklch(0.274 0.006 286.033);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.646 0.222 41.116);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Updated Tailwind Configuration for v4

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

## Site Branding Updates

### Update Logo Component
In `src/components/layout/logo.tsx`:
```typescript
export function Logo({ showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
        <Type className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <span className="font-bold text-xl">
          Text Case Converter
        </span>
      )}
    </Link>
  )
}
```

### Update Site Metadata
In all metadata configurations, replace "TextTools" with "Text Case Converter":

```typescript
export const siteConfig = {
  name: "Text Case Converter",
  description: "Free online text case conversion and manipulation tools",
  url: "https://textcaseconverter.com",
  ogImage: "https://textcaseconverter.com/og.png",
  links: {
    github: "https://github.com/yourusername/text-case-converter",
  },
}
```

### Update Environment Variables
In `.env.local`:
```
NEXT_PUBLIC_APP_NAME="Text Case Converter"
NEXT_PUBLIC_APP_URL="https://textcaseconverter.com"
```

## Color Palette Analysis

The provided OKLCH color scheme creates:
- **Primary Color**: A warm orange/amber tone (in light mode) transitioning to a slightly darker orange in dark mode
- **Background**: Pure white in light mode, very dark purple-gray in dark mode
- **Foreground**: Very dark purple-gray text in light mode, near-white in dark mode
- **Accent Colors**: Subtle gray tones with slight purple undertones
- **Destructive**: Red-orange warning colors

This creates a warm, professional appearance with excellent contrast ratios for accessibility.

## Typography Considerations

With this color scheme, consider using:
- **Headings**: Inter or similar geometric sans-serif
- **Body Text**: System font stack for performance
- **Code/Monospace**: JetBrains Mono or similar

## Implementation Notes

1. The OKLCH color space provides better perceptual uniformity than RGB/HSL
2. Ensure browser compatibility for OKLCH (modern browsers support it)
3. Consider fallbacks for older browsers:

```css
/* Fallback for browsers that don't support OKLCH */
@supports not (color: oklch(0.5 0.5 0)) {
  :root {
    --primary: #f59e0b; /* Approximate fallback */
    /* Add other fallbacks */
  }
}
```

## Brand Identity
- **Name**: Text Case Converter
- **Tagline**: "Transform Your Text Instantly"
- **Primary Features**: Case conversion, text manipulation, multi-language support
- **Color Identity**: Warm orange primary with professional gray tones