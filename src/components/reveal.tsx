"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Stagger in ms, applied as a transition-delay. */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Fades + lifts its children into view once when they scroll into the viewport.
 * Falls back to visible immediately if IntersectionObserver is unavailable.
 */
export function Reveal({ children, className = "", delay = 0, as = "div" }: Props) {
  const Tag = as;

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  });

  return (
    <Tag
      data-reveal=""
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
