"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"

export const Label = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <label htmlFor={props.htmlFor} className={cn("block text-sm font-medium", className)} ref={ref} {...props}>
      {children}
    </label>
  ),
)

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ checked = false, onCheckedChange, className, ...props }, ref) => (
    <div
      className={cn(
        "relative flex h-5 w-11 items-center rounded-full bg-muted cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
      ref={ref}
      {...props}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-full transition-transform",
          checked ? "translate-x-6 bg-primary" : "translate-x-0 bg-muted",
        )}
      >
        <div className="h-3 w-3 rounded-full bg-white"></div>
      </div>
    </div>
  ),
)

