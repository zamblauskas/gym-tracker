import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] shadow hover:opacity-80",
        secondary:
          "border-transparent bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))] hover:opacity-80",
        destructive:
          "border-transparent bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))] shadow hover:opacity-80",
        outline: "text-[hsl(var(--color-foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
