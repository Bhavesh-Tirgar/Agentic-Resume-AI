"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
}: ShinyTextProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <span
      className={`${isLight ? "text-slate-800" : "text-[#c8ced9]"} bg-clip-text inline-block ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        backgroundImage: isLight
          ? "linear-gradient(120deg, rgba(15, 23, 42, 0.4) 25%, rgba(15, 23, 42, 0.95) 50%, rgba(15, 23, 42, 0.4) 75%)"
          : "linear-gradient(120deg, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.2) 75%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
