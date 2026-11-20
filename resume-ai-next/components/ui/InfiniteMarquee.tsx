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
        className={`flex w-max gap-8 py-3 will-change-transform animate-marquee ${
          pauseOnHover ? "hover:[animation-play-state:paused]" : ""
        }`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md shadow-sm select-none"
          >
            <span className="font-semibold text-xs tracking-tight text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {item.name}
            </span>
            {item.role && (
              <span className="text-[11px] text-zinc-400 font-mono">
                {item.role}
              </span>
            )}
            {item.salary && (
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {item.salary}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
