import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary to-info text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
        destructive:
          'bg-gradient-to-r from-destructive to-red-500 text-destructive-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
        outline:
          'border-2 border-primary/30 bg-background/80 text-foreground shadow-md hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary hover:shadow-lg hover:scale-105 backdrop-blur-sm',
        secondary:
          'bg-gradient-to-r from-secondary to-muted text-secondary-foreground shadow-md hover:shadow-lg hover:from-accent/20 hover:to-muted/80 hover:scale-105',
        ghost:
          'text-foreground hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/10 hover:shadow-md hover:scale-105',
        link: 'text-primary underline-offset-4 hover:underline hover:text-info transition-colors',
        success:
          'bg-gradient-to-r from-success to-emerald-500 text-success-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
        warning:
          'bg-gradient-to-r from-warning to-orange-500 text-warning-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
        info: 'bg-gradient-to-r from-info to-blue-500 text-info-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
      },
      size: {
        default: 'h-10 px-6 py-2.5',
        sm: 'h-8 rounded-lg px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
