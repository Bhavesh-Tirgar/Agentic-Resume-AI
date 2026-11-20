"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { luxuryEasing } from "@/lib/motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export function SplitText({
  text,
  className = "",
  delay = 0.03,
  highlightWords = [],
  highlightClass = "text-white font-extrabold",
}: SplitTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: luxuryEasing,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => {
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
        );

        return (
          <motion.span
            key={i}
            variants={wordVariants}
            className={`inline-block mr-[0.28em] last:mr-0 ${
              isHighlight ? highlightClass : ""
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
