"use client";

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
        "bg-[#FF5733] text-white hover:bg-[#D9411E] shadow-sm focus-visible:ring-[#FF5733] active:scale-[0.98]",
      secondary:
        "bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 hover:border-[#CBD5E1] shadow-2xs focus-visible:ring-slate-400 active:scale-[0.98]",
      ghost:
        "bg-transparent text-[#0F172A] hover:bg-slate-100 focus-visible:ring-slate-300",
      destructive:
        "bg-[#EF4444] text-white hover:bg-red-600 focus-visible:ring-red-500 active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "h-9 px-4 text-xs font-bold",
      md: "h-11 px-5 text-xs sm:text-sm font-bold",
      lg: "h-12 px-7 text-sm font-bold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold transition-all duration-150 rounded-xl disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 select-none",
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
