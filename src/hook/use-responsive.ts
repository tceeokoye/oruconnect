"use client";

import { useEffect, useState } from "react";

/**
 * Get the current breakpoint for responsive design
 * Returns: 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("md");

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint("xs");
      else if (width < 768) setBreakpoint("sm");
      else if (width < 1024) setBreakpoint("md");
      else if (width < 1280) setBreakpoint("lg");
      else if (width < 1536) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };

    checkBreakpoint();
    const interval = setInterval(checkBreakpoint, 100);
    window.addEventListener("resize", () => checkBreakpoint());

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkBreakpoint);
    };
  }, []);

  return breakpoint;
}

/**
 * Check if screen size is below threshold
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

/**
 * Check if device is mobile
 */
export function useIsMobile(breakpoint = 768) {
  return useMediaQuery(`(max-width: ${breakpoint}px)`);
}
