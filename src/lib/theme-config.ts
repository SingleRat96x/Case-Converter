/**
 * Centralized theme configuration
 * All classes use theme tokens - NO hardcoded colors
 */

export const themeClasses = {
  // Typography
  label: 'text-sm font-medium text-foreground',
  heading: {
    h1: 'text-3xl sm:text-4xl font-semibold text-foreground',
    h2: 'text-2xl sm:text-3xl font-semibold text-foreground',
    h3: 'text-xl sm:text-2xl font-semibold text-foreground',
  },
  description: 'text-muted-foreground',
  
  // Inputs
  textarea: {
    base: 'w-full p-4 rounded-lg border border-border bg-background text-foreground resize-y transition-all duration-200 placeholder:text-muted-foreground',
    focus: 'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-md',
    sizes: {
      sm: 'min-h-[150px]',
      md: 'min-h-[200px]',
      lg: 'min-h-[250px]',
      xl: 'min-h-[300px]',
    }
  },
  
  // Buttons
  button: {
    base: 'flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]',
    sizes: {
      sm: 'px-3 py-1.5 min-h-[32px]',
      md: 'px-5 py-2.5 min-h-[44px]',
      lg: 'px-6 py-3 min-h-[52px]',
    },
    variants: {
      primary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md',
      secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border',
      ghost: 'bg-muted hover:bg-muted/80 text-muted-foreground',
      destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    }
  },
  
  // Layout
  container: {
    sm: 'max-w-2xl mx-auto',
    md: 'max-w-4xl mx-auto',
    lg: 'max-w-6xl mx-auto',
    xl: 'max-w-7xl mx-auto',
    full: 'w-full',
  },
  
  section: {
    spacing: {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
      xl: 'space-y-12',
    },
    gaps: {
      sm: 'mt-4',
      md: 'mt-6',
      lg: 'mt-8',
      xl: 'mt-12',
    }
  },
  
  grid: {
    base: 'grid',
    gaps: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
    }
  },
  
  // Stats
  stats: {
    card: {
      base: 'p-4 rounded-lg transition-all duration-200',
      variants: {
        default: 'bg-muted/20 border border-border/30',
        elevated: 'bg-card shadow-sm border border-border',
        accent: 'bg-accent/5 border border-accent/10',
      }
    },
    inline: {
      base: 'flex flex-wrap items-center gap-3 text-sm',
      divider: 'text-muted-foreground/40',
      label: 'text-muted-foreground',
      value: 'font-medium text-accent',
    }
  },
  
  // Utilities
  divider: 'border-t border-border',
  focusRing: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
} as const;

// Helper function to combine classes
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}