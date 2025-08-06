import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98] hover:shadow-glow-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-border-soft bg-background/80 backdrop-blur-sm shadow-soft hover:bg-card-hover hover:text-card-foreground hover:shadow-medium hover:border-border",
        secondary:
          "bg-secondary text-secondary-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98] hover:shadow-glow-secondary",
        tertiary:
          "bg-tertiary text-tertiary-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
        accent:
          "bg-accent text-accent-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98] hover:shadow-glow-accent",
        ghost: "hover:bg-muted/50 hover:text-foreground backdrop-blur-sm transition-spring",
        link: "text-primary underline-offset-4 hover:underline transition-spring",
        hero: "bg-gradient-hero text-foreground shadow-glow hover:shadow-large hover:scale-[1.02] active:scale-[0.98] border border-primary/20 backdrop-blur-sm",
        glass: "glass text-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
        gradient: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
        safe: "bg-safe-light text-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
        cozy: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-large hover:scale-[1.02] active:scale-[0.98] rounded-full",
        success: "bg-success text-success-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
        warning: "bg-warning text-warning-foreground shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-lg",
        sm: "h-9 px-4 text-sm rounded-lg",
        default: "h-10 px-6 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
