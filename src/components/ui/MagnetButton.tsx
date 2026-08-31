"use client";

import * as React from "react";
import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MagnetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  magnetRadius?: number;
  dampingFactor?: number;
}

export function MagnetButton({
  children,
  className,
  magnetRadius = 45,
  dampingFactor = 0.35,
  ...props
}: MagnetButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * dampingFactor;
      const deltaY = (e.clientY - centerY) * dampingFactor;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < magnetRadius) {
        setOffset({ x: deltaX, y: deltaY });
      }
    },
    [magnetRadius, dampingFactor]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: isHovered ? "transform 100ms ease-out" : "transform 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-button font-medium select-none transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
