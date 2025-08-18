# Story 1.1: Project Setup & Core Dependencies

## Story Details
- **Stage**: 1 - Foundation & Infrastructure
- **Priority**: Critical (Must be completed first)
- **Estimated Hours**: 2-3 hours
- **Dependencies**: None

## Objective
Set up a new Next.js 14 project with TypeScript, configure the necessary build tools, and install all core dependencies required for the multilingual text tools website.

## Acceptance Criteria
- [ ] Next.js 14 project initialized with TypeScript
- [ ] All core dependencies installed and configured
- [ ] Project runs successfully in development mode
- [ ] Basic folder structure established
- [ ] Git repository initialized with proper .gitignore
- [ ] Environment variables structure set up

## Implementation Steps

### 1. Initialize Next.js Project
```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest texttools-multilingual --typescript --app --tailwind --eslint

# Navigate to project
cd texttools-multilingual

# Remove default Next.js boilerplate files
rm -rf src/app/favicon.ico
rm -rf src/app/globals.css
rm -rf src/app/page.tsx
rm -rf src/app/layout.tsx
rm -rf public/next.svg
rm -rf public/vercel.svg
```

### 2. Install Core Dependencies
```bash
# UI Components and Styling
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label
npm install @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot
npm install @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-tooltip
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# i18n Support
npm install next-intl
npm install @formatjs/intl-localematcher negotiator
npm install --save-dev @types/negotiator

# Theme Support
npm install next-themes

# Form Handling (for future tools)
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install date-fns
npm install crypto-js
npm install --save-dev @types/crypto-js

# Development Dependencies
npm install --save-dev prettier prettier-plugin-tailwindcss
npm install --save-dev @types/node
```

### 3. Create Base Folder Structure
```
texttools-multilingual/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── tools/
│   │   ├── api/
│   │   ├── fonts/
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── tools/
│   │   ├── layout/
│   │   └── shared/
│   ├── lib/
│   │   ├── utils.ts
│   │   └── tools/
│   ├── config/
│   │   ├── site.ts
│   │   └── tools.ts
│   ├── hooks/
│   ├── types/
│   └── i18n/
│       ├── config.ts
│       ├── locales/
│       │   ├── en/
│       │   ├── fr/
│       │   ├── ru/
│       │   └── it/
│       └── middleware.ts
├── public/
│   ├── images/
│   └── locales/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4. Create Essential Configuration Files

#### Create `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### Create `.env.example`
```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Text Tools"

# Analytics (to be configured later)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_ADSENSE_CLIENT_ID=

# Supported Locales
NEXT_PUBLIC_LOCALES=en,fr,ru,it
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

#### Create `src/config/site.ts`
```typescript
export const siteConfig = {
  name: "Text Tools",
  description: "Free online text manipulation and conversion tools",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.jpg",
  links: {
    github: "https://github.com/yourusername/texttools",
  },
  creator: "Your Name",
}

export const locales = ['en', 'fr', 'ru', 'it'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
```

#### Create `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
} satisfies Config

export default config
```

#### Create `src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
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

#### Create `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindConfig": "./tailwind.config.ts"
}
```

#### Update `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
```

### 5. Install Additional Dependencies for UI Components
```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# When prompted:
# - Would you like to use TypeScript? → Yes
# - Which style would you like to use? → Default
# - Which color would you like to use as base color? → Slate
# - Where is your global CSS file? → src/app/globals.css
# - Would you like to use CSS variables for colors? → Yes
# - Where is your tailwind.config.ts located? → tailwind.config.ts
# - Configure the import alias for components? → src/components
# - Configure the import alias for utils? → src/lib/utils
```

### 6. Initialize Git Repository
```bash
# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea
.vscode
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
EOF

# Initial commit
git add .
git commit -m "Initial project setup with Next.js 14, TypeScript, and core dependencies"
```

## Testing & Verification

### 1. Verify Installation
```bash
# Check all dependencies are installed
npm list

# Run the development server
npm run dev
```

### 2. Create a Test Page
Create `src/app/[locale]/page.tsx`:
```typescript
export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Text Tools - Multilingual</h1>
      <p className="mt-4 text-muted-foreground">
        Project setup complete. Ready for i18n configuration.
      </p>
    </div>
  )
}
```

Create `src/app/[locale]/layout.tsx`:
```typescript
import '@/app/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### 3. Verify Project Structure
Ensure all folders are created and the project runs without errors.

## Success Indicators
- ✅ Project runs on http://localhost:3000
- ✅ No TypeScript errors
- ✅ All dependencies installed successfully
- ✅ Folder structure matches specification
- ✅ Git repository initialized with proper .gitignore

## Next Steps
Once this story is complete, proceed to Story 1.2: i18n Configuration & Language Routing

## Notes for AI Implementation
- Ensure all commands are run in order
- Pay attention to the specific versions of packages if any compatibility issues arise
- The project should be completely clean of Next.js boilerplate
- All configuration files should be created exactly as specified
- Test the setup thoroughly before marking as complete