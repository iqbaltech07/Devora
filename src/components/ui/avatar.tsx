"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "circle";
}

export function Avatar({
  src,
  alt = "User avatar",
  fallback = "DEV",
  size = "md",
  shape = "rounded",
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const isCircle = shape === "circle" || className?.includes("rounded-full");

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 aspect-square overflow-hidden border border-devora-border bg-devora-surface-strong font-mono font-medium text-devora-ink select-none",
        isCircle ? "rounded-full" : "rounded-button",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover block"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
