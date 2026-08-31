"use client";

import * as React from "react";
import { useEffect, useState } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  animateOnHover?: boolean;
}

const DEFAULT_CHARS = "0123456789ABCDEF_/*#@";

export function DecryptedText({
  text,
  speed = 25,
  maxIterations = 8,
  characters = DEFAULT_CHARS,
  className = "",
  animateOnHover = false,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / (maxIterations / text.length);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, characters, isHovered]);

  return (
    <span
      className={className}
      onMouseEnter={() => {
        if (animateOnHover) setIsHovered(!isHovered);
      }}
    >
      {displayText}
    </span>
  );
}
