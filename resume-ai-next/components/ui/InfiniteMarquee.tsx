"use client";

import React from "react";

interface MarqueeItem {
  name: string;
  role?: string;
  salary?: string;
  icon?: string;
}

interface InfiniteMarqueeProps {
  items: MarqueeItem[];
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function InfiniteMarquee({
  items,
  speed = 30,
  pauseOnHover = true,
  className = "",
}: InfiniteMarqueeProps) {
  return (
    <div
      className={`relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div
        className={`flex w-max gap-6 py-2.5 will-change-transform animate-marquee ${
          pauseOnHover ? "hover:[animation-play-state:paused]" : ""
        }`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#12151c] border border-slate-200 dark:border-[#202533] shadow-xs select-none"
          >
            <span className="font-semibold text-xs tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {item.name}
            </span>
            {item.role && (
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                {item.role}
              </span>
            )}
            {item.salary && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                {item.salary}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
