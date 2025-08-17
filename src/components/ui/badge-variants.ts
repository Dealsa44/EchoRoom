import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1.5 text-caption font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground shadow-soft hover:bg-primary hover:shadow-glow-primary/30",
        secondary:
          "border-transparent bg-secondary/90 text-secondary-foreground shadow-soft hover:bg-secondary hover:shadow-glow-secondary/30",
        tertiary:
          "border-transparent bg-tertiary/90 text-tertiary-foreground shadow-soft hover:bg-tertiary",
        accent:
          "border-transparent bg-accent/90 text-accent-foreground shadow-soft hover:bg-accent hover:shadow-glow-accent/30",
        destructive:
          "border-transparent bg-destructive/90 text-destructive-foreground shadow-soft hover:bg-destructive",
        success:
          "border-transparent bg-success/90 text-success-foreground shadow-soft hover:bg-success",
        warning:
          "border-transparent bg-warning/90 text-warning-foreground shadow-soft hover:bg-warning",
        outline: "border border-border-soft bg-background/50 text-foreground hover:bg-muted/50",
        ghost: "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        gradient: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-primary/40",
        glass: "glass text-foreground shadow-soft",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
