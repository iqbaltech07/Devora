import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variantStyles = {
      primary:
        "bg-devora-brand text-white hover:bg-devora-brand-dark focus-visible:ring-devora-brand active:translate-y-px",
      secondary:
        "bg-transparent border border-devora-border text-devora-ink hover:bg-devora-surface hover:border-devora-border-strong focus-visible:ring-devora-border-strong",
      ghost:
        "bg-transparent text-devora-ink hover:bg-devora-surface-strong focus-visible:ring-devora-border",
      destructive:
        "bg-devora-danger text-white hover:bg-red-700 focus-visible:ring-devora-danger",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs",
      md: "h-11 px-5 text-sm", // 44px height per design.md (42-46px)
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-button disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
