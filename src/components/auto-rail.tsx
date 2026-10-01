"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Seconds for one full left-to-right pass. */
  duration?: number;
  className?: string;
};

/**
 * A horizontal rail that scrolls itself automatically and seamlessly.
 *
 * The children are rendered twice and the track is translated by -50%, so when
 * the animation loops there is always content under the seam. Hovering (or
 * focusing something inside) pauses it; a control lets the visitor stop and
 * step through it manually.
 */
export function AutoRail({ children, duration = 45, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // While animating, scrollLeft stays at 0 — measure via the transform instead.
    const half = el.scrollWidth / 2;
    const m = /translateX\((-?[\d.]+)px\)/.exec(getComputedStyle(el).transform);
    const offset = m ? Math.abs(parseFloat(m[1])) : el.scrollLeft;
    setAtStart(offset < 8);
    setAtEnd(offset > half - 8);
  }, []);

  const nudge = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      setPaused(true);
      el.getAnimations().forEach((a) => a.pause());
      const half = el.scrollWidth / 2;
      const m = /translateX\((-?[\d.]+)px\)/.exec(getComputedStyle(el).transform);
      const current = m ? Math.abs(parseFloat(m[1])) : el.scrollLeft;
      const next = Math.max(0, Math.min(half, current + dir * Math.round(half / 6)));
      el.style.transform = `translateX(${-next}px)`;
      window.setTimeout(measure, 60);
    },
    [measure]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // Keep the track pinned to the animation's current position when paused,
    // otherwise toggling the class would snap it back to the start.
    let committed: number | null = null;
    const commit = () => {
      if (committed !== null) return;
      const anims = el.getAnimations();
      const running = anims.find((a) => a.playState === "running") ?? anims[0];
      if (running && typeof running.currentTime === "number") {
        committed = running.currentTime;
        running.pause();
      }
      if (!paused) {
        const m = /translateX\((-?[\d.]+)px\)/.exec(getComputedStyle(el).transform);
        const offset = m ? Math.abs(parseFloat(m[1])) : 0;
        el.style.transform = `translateX(${-offset}px)`;
        running?.cancel?.();
        el.getAnimations().forEach((a) => a.cancel());
        void el.offsetWidth;
        el.style.animation = "rail var(--rail-duration, 40s) linear infinite";
        el.style.animationDelay = `${-offset / ((duration * 1000) / (el.scrollWidth / 2))}s`;
        el.style.animationPlayState = "running";
      }
    };
    commit();
  }, [paused, duration]);

  useEffect(() => {
    const id = window.setInterval(measure, 400);
    measure();
    return () => window.clearInterval(id);
  }, [measure]);

  return (
    <div className={`rail-viewport ${className}`}>
      <div
        ref={trackRef}
        className="rail-track flex w-max"
        style={
          {
            "--rail-duration": `${duration}s`,
            animationPlayState: paused ? "paused" : "running",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={atStart && !paused}
          aria-label="Scroll the rail backwards"
          className="btn btn-outline h-10 px-4 disabled:opacity-60"
        >
          &larr;
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume auto-scroll" : "Pause auto-scroll"}
          className="btn btn-primary h-10 px-4"
        >
          {paused ? "Play" : "Pause"}
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={atEnd}
          aria-label="Scroll the rail forwards"
          className="btn btn-outline h-10 px-4 disabled:opacity-60"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
