import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              checked: child.props.value === value,
              onClick: () => !disabled && onValueChange?.(child.props.value),
              disabled,
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  checked?: boolean
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, children, value, checked, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
          "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          checked
            ? "border-primary bg-primary/5"
            : "border-gray-200 bg-white",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        <div className={cn(
          "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          checked ? "border-primary" : "border-gray-300"
        )}>
          {checked && (
            <div className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <div className="flex-1">{children}</div>
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
