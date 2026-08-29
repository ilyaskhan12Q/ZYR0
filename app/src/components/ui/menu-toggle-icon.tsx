import * as React from "react"
import { cn } from "@/lib/utils"

interface MenuToggleIconProps {
  isOpen: boolean
  className?: string
}

const MenuToggleIcon = React.forwardRef<HTMLButtonElement, MenuToggleIconProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ isOpen, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn("relative h-8 w-8 shrink-0", className)}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      {...props}
    >
      <span className="absolute left-1/2 top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2">
        <span
          className={cn(
            "absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-transform duration-200",
            isOpen && "rotate-45"
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-all duration-200",
            isOpen && "opacity-0"
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-transform duration-200",
            isOpen && "-rotate-45"
          )}
        />
      </span>
    </button>
  )
)

MenuToggleIcon.displayName = "MenuToggleIcon"

export { MenuToggleIcon }
