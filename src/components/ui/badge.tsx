import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "surface" | "outline" | "success" | "warning";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-devora-surface-strong text-devora-ink border-devora-border",
    brand:
      "bg-devora-brand-soft text-devora-brand-dark border-devora-brand/20",
    surface:
      "bg-devora-surface text-devora-muted border-devora-border",
    outline:
      "bg-transparent text-devora-ink border-devora-border",
    success:
      "bg-emerald-50 text-devora-success border-emerald-200",
    warning:
      "bg-amber-50 text-devora-warning border-amber-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-mono font-medium transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
