import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background text-foreground",
        
        // Variantes de couleurs globales Airbnb
        coral: "bg-coral-light text-coral border border-coral-lighter",
        teal: "bg-teal-light text-teal border border-teal-lighter",
        orange: "bg-orange-light text-orange border border-orange-lighter",
        yellow: "bg-yellow-light text-yellow border border-yellow-lighter",
        
        // Variantes sémantiques
        success: "bg-success-light text-success border border-success-lighter",
        danger: "bg-danger-light text-danger border border-danger-lighter",
        warning: "bg-warning-light text-warning border border-warning-lighter",
        info: "bg-info-light text-info border border-info-lighter",
        
        // Variantes neutres
        neutral: "bg-gray-100 text-gray-700 border border-gray-200",
      },
      size: {
        default: "px-2.5 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }