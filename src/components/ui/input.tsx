import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-card/60 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
