"use client";

import React, { useRef, useEffect } from "react";

interface SquaresBackgroundProps {
  direction?: "diagonal" | "up" | "right" | "down" | "left";
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export function SquaresBackground({
  direction = "right",
  speed = 0.5,
  borderColor = "rgba(255, 255, 255, 0.05)",
  squareSize = 44,
  hoverFillColor = "rgba(16, 185, 129, 0.08)",
  className = "",
}: SquaresBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridOffset = { x: 0, y: 0 };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move grid based on direction and speed
      if (direction === "right") gridOffset.x = (gridOffset.x + speed) % squareSize;
      if (direction === "left") gridOffset.x = (gridOffset.x - speed) % squareSize;
      if (direction === "down") gridOffset.y = (gridOffset.y + speed) % squareSize;
      if (direction === "up") gridOffset.y = (gridOffset.y - speed) % squareSize;
      if (direction === "diagonal") {
        gridOffset.x = (gridOffset.x + speed) % squareSize;
        gridOffset.y = (gridOffset.y + speed) % squareSize;
      }

      const startX = Math.floor(gridOffset.x % squareSize) - squareSize;
      const startY = Math.floor(gridOffset.y % squareSize) - squareSize;

      // Draw grid lines and hover highlight
      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          if (mouseRef.current) {
            const isHovered =
              mouseRef.current.x >= x &&
              mouseRef.current.x < x + squareSize &&
              mouseRef.current.y >= y &&
              mouseRef.current.y < y + squareSize;

            if (isHovered) {
              ctx.fillStyle = hoverFillColor;
              ctx.fillRect(x, y, squareSize, squareSize);
            }
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto w-full h-full ${className}`}
    />
  );
}
